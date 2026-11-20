import { LANGUAGES } from '../../i18n/config.i18n';
import categoriesData from '../../data/categories/categories.data.json';
import productsData from '../../data/products/products.data.json';

const BASE_URL = 'https://www.proexportgt.com';
const langs = Object.keys(LANGUAGES);

const STATIC_PATHS = ['', 'acerca-de-nosotros/', 'productos/', 'contacto/'] as const;

/**
 * Generate static localized URLs for all supported languages.
 */
const getStaticUrls = (): string[] => {
  return langs.flatMap((lang) =>
    STATIC_PATHS.map((path) => `${BASE_URL}/${lang}/${path}`)
  );
};

/**
 * Generate localized URLs for all categories.
 */
const getCategoryUrls = (): string[] => {
  const categories = categoriesData.categories ?? [];
  return langs.flatMap((lang) =>
    categories.map((category) => `${BASE_URL}/${lang}/product-category/${category.slug}/`)
  );
};

/**
 * Generate localized URLs for all products.
 */
const getProductUrls = (): string[] => {
  const products = productsData.products ?? [];
  return langs.flatMap((lang) =>
    products.map(
      (product) => `${BASE_URL}/${lang}/${product.category_slug}/${product.slug}/`
    )
  );
};

/**
 * Combine all URLs for the Astro sitemap configuration.
 */
export const getAllSitemapUrls = (): string[] => {
  return [
    ...getStaticUrls(),
    ...getCategoryUrls(),
    ...getProductUrls(),
  ];
};
