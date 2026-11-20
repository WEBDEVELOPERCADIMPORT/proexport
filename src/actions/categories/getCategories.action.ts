import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import categoriesData from '../../data/categories/categories.data.json';

export interface Category {
  id: string;
  slug: string;
  name: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  bannerImage: string;
  order: number;
}

export interface GetCategoriesResult {
  message: string;
  data: Category[];
}

export const getCategories = defineAction({
  input: z.object({}).optional(),
  handler: async (): Promise<GetCategoriesResult> => {
    const rawCategories = (categoriesData.categories ?? []) as Category[];
    const sorted = [...rawCategories].sort((a, b) => a.order - b.order);

    return {
      message: 'Categorías obtenidas con éxito',
      data: sorted,
    };
  },
});
