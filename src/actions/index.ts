// src/actions/index.ts
import { getCategories } from './categories/getCategories.action';
import { getBrands } from './brands/getBrands.action';
import { getProducts } from './products/getProducts.action';
import { getProductBySlug } from './products/getProductBySlug.action';
import { sendContactForm } from './contact/sendContactForm.action';

export const server = {
  getCategories,
  getBrands,
  getProducts,
  getProductBySlug,
  sendContactForm,
};
