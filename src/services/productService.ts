import { products } from "@/mocks/products";

const wait = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export const productService = {
  async getProducts() { await wait(); return products; },
  async getProductById(id: number) { await wait(); return products.find((product) => product.id === id) ?? products[0]; },
  async getClearanceProducts() { await wait(); return products.filter((product) => product.type === "CLEARANCE"); },
};
