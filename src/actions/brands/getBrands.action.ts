import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import brandsData from '../../data/brands/brands.data.json';

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string;
  order: number;
}

export interface GetBrandsResult {
  message: string;
  data: Brand[];
}

export const getBrands = defineAction({
  input: z.object({}).optional(),
  handler: async (): Promise<GetBrandsResult> => {
    const rawBrands = (brandsData.brands ?? []) as Brand[];
    const sorted = [...rawBrands].sort((a, b) => a.order - b.order);

    return {
      message: 'Marcas obtenidas con éxito',
      data: sorted,
    };
  },
});
