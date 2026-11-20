import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import {
  getProductsList,
  type Product,
} from '../../services/products.service';

export type { Product };

export interface GetProductsData {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GetProductsResult {
  message: string;
  data: GetProductsData;
}

export const getProducts = defineAction({
  input: z.object({
    categorySlug: z.string().optional(),
    brandSlug: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(['default', 'asc', 'desc']).default('default'),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).default(20),
  }),
  handler: async ({
    categorySlug,
    brandSlug,
    search,
    sort,
    page,
    limit,
  }): Promise<GetProductsResult> => {
    try {
      const result = await getProductsList({
        categorySlug,
        brandSlug,
        search,
        sort,
        page,
        limit,
      });

      return {
        message: 'Productos obtenidos con éxito',
        data: {
          products: result.products,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener productos del backend',
      });
    }
  },
});
