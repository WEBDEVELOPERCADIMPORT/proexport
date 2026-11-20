export interface Product {
  id?: string;
  slug: string;
  sku: string;
  name: string;
  category_slug: string;
  brand_slug: string;
  image: string;
}

export interface BackendContentItem<T> {
  id: string;
  data: T;
  createdAt: string;
  updatedAt?: string;
}

export interface BackendMeta {
  total: number;
  limit: number;
  page: number;
}

export interface BackendContentResponse<T> {
  status: string;
  message: string;
  website?: {
    id?: string;
    name: string;
    domain: string;
  };
  contentType?: {
    id?: string;
    name?: string;
    slug: string;
    description?: string | null;
  };
  filtersApplied?: Record<string, string>;
  items: BackendContentItem<T>[];
  meta: BackendMeta;
}

export interface FetchProductsParams {
  category_slug?: string;
  brand_slug?: string;
  slug?: string;
  sku?: string;
  limit?: number;
  page?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface PaginatedProductsResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetProductsListOptions {
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  sort?: 'default' | 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const getApiConfig = (): { baseUrl: string; apiKey: string } => {
  const rawUrl = import.meta.env.BACKEND_API_URL;
  const apiKey = import.meta.env.BACKEND_API_KEY;

  if (!rawUrl || !apiKey) {
    throw new Error(
      'Missing BACKEND_API_URL or BACKEND_API_KEY environment variables'
    );
  }

  return {
    baseUrl: rawUrl.replace(/\/+$/, ''),
    apiKey,
  };
};

const mapItemToProduct = (item: BackendContentItem<Product>): Product => ({
  id: item.id,
  ...item.data,
});

/**
 * Fetches paginated and dynamically filtered products from the central backend.
 */
export const fetchProductsFromApi = async (
  params: FetchProductsParams = {}
): Promise<PaginatedProductsResult> => {
  const { baseUrl, apiKey } = getApiConfig();
  const url = new URL(`${baseUrl}/content/products`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Products API request failed (${response.status}): ${errorText || response.statusText}`
    );
  }

  const json = (await response.json()) as BackendContentResponse<Product>;
  const products = (json.items ?? []).map(mapItemToProduct);
  const total = json.meta?.total ?? products.length;
  const limit = json.meta?.limit ?? params.limit ?? 20;
  const page = json.meta?.page ?? params.page ?? 1;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  return {
    products,
    total,
    page,
    limit,
    totalPages,
  };
};

/**
 * Fetches all pages matching the given backend filters (used when client-side
 * search or sorting is requested on top of backend filters).
 */
const fetchAllMatchingProducts = async (
  filters: Omit<FetchProductsParams, 'limit' | 'page'> = {}
): Promise<Product[]> => {
  const batchSize = 100;
  const firstPage = await fetchProductsFromApi({
    ...filters,
    limit: batchSize,
    page: 1,
  });

  if (firstPage.totalPages <= 1) {
    return firstPage.products;
  }

  const remainingPageNumbers = Array.from(
    { length: firstPage.totalPages - 1 },
    (_, index) => index + 2
  );

  const remainingPages = await Promise.all(
    remainingPageNumbers.map((pageNumber) =>
      fetchProductsFromApi({
        ...filters,
        limit: batchSize,
        page: pageNumber,
      })
    )
  );

  return [
    ...firstPage.products,
    ...remainingPages.flatMap((result) => result.products),
  ];
};

/**
 * Retrieves products using backend dynamic filters and pagination (`limit` & `page`),
 * applying text search or alphabetical sorting when requested.
 */
export const getProductsList = async (
  options: GetProductsListOptions = {}
): Promise<PaginatedProductsResult> => {
  const {
    categorySlug,
    brandSlug,
    search,
    sort = 'default',
    page = 1,
    limit = 20,
  } = options;

  const normalizedSearch = search?.trim().toLowerCase() ?? '';
  const hasSearch = normalizedSearch.length > 0;
  const hasCustomSort = sort !== 'default';

  const backendFilters: Omit<FetchProductsParams, 'limit' | 'page'> = {
    ...(categorySlug ? { category_slug: categorySlug } : {}),
    ...(brandSlug ? { brand_slug: brandSlug } : {}),
  };

  if (!hasSearch && !hasCustomSort) {
    return fetchProductsFromApi({
      ...backendFilters,
      limit,
      page,
    });
  }

  const allMatching = await fetchAllMatchingProducts(backendFilters);

  const filtered = hasSearch
    ? allMatching.filter(
        (product) =>
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.sku.toLowerCase().includes(normalizedSearch)
      )
    : allMatching;

  const sorted = hasCustomSort
    ? [...filtered].sort((a, b) =>
        sort === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      )
    : filtered;

  const total = sorted.length;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
  const startIndex = (page - 1) * limit;
  const paginated = sorted.slice(startIndex, startIndex + limit);

  return {
    products: paginated,
    total,
    page,
    limit,
    totalPages,
  };
};

/**
 * Retrieves a single product by slug and category_slug along with up to 4 related products.
 */
export const getProductDetailBySlug = async (
  categorySlug: string,
  productSlug: string
): Promise<{ product: Product | null; relatedProducts: Product[] }> => {
  const { products } = await fetchProductsFromApi({
    slug: productSlug,
    category_slug: categorySlug,
    limit: 1,
    page: 1,
  });

  const product = products[0] ?? null;
  if (!product) {
    return { product: null, relatedProducts: [] };
  }

  const sameCategoryResult = await fetchProductsFromApi({
    category_slug: product.category_slug,
    limit: 5,
    page: 1,
  });

  let relatedProducts = sameCategoryResult.products
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  if (relatedProducts.length < 4 && product.brand_slug) {
    const excludedSlugs = new Set<string>([
      product.slug,
      ...relatedProducts.map((p) => p.slug),
    ]);

    const sameBrandResult = await fetchProductsFromApi({
      brand_slug: product.brand_slug,
      limit: 5 + relatedProducts.length,
      page: 1,
    });

    const sameBrandFiltered = sameBrandResult.products.filter(
      (p) => !excludedSlugs.has(p.slug)
    );

    relatedProducts = [...relatedProducts, ...sameBrandFiltered].slice(0, 4);
  }

  return {
    product,
    relatedProducts,
  };
};
