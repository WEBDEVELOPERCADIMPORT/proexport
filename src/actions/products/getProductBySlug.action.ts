import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import {
  getProductDetailBySlug,
  type Product,
} from '../../services/products.service';

export interface GetProductBySlugData {
  product: Product;
  relatedProducts: Product[];
}

export interface GetProductBySlugResult {
  message: string;
  data: GetProductBySlugData;
}

export const getProductBySlug = defineAction({
  input: z.object({
    categorySlug: z.string().min(1, 'El slug de categoría es requerido'),
    productSlug: z.string().min(1, 'El slug del producto es requerido'),
  }),
  handler: async ({
    categorySlug,
    productSlug,
  }): Promise<GetProductBySlugResult> => {
    try {
      const { product, relatedProducts } = await getProductDetailBySlug(
        categorySlug,
        productSlug
      );

      if (!product) {
        throw new ActionError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      return {
        message: 'Producto obtenido con éxito',
        data: {
          product,
          relatedProducts,
        },
      };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener el producto del backend',
      });
    }
  },
});
