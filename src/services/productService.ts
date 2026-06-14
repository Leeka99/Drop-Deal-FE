import { products } from "@/mocks/products";
import { isMockMode, requestJson } from "@/services/index";
import { Product } from "@/types/product";

const wait = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export const productService = {
  async getProducts() {
    if (isMockMode()) {
      await wait();
      return products;
    }
    return requestJson<{ data: Product[] }>("/api/v1/products").then((response) => response.data);
  },
  async getProductById(id: number) {
    if (isMockMode()) {
      await wait();
      return products.find((product) => product.id === id) ?? products[0];
    }
    return requestJson<{ data: Product }>(`/api/v1/products/${id}`).then((response) => response.data);
  },
  async getClearanceProducts() {
    if (isMockMode()) {
      await wait();
      return products.filter((product) => product.type === "CLEARANCE");
    }
    return requestJson<{ data: Product[] }>("/api/v1/products?type=CLEARANCE").then((response) => response.data);
  },
  async getFreeGiveawayProducts() {
    if (isMockMode()) {
      await wait();
      return products.filter((product) => product.type === "FREE_GIVEAWAY");
    }
    return requestJson<{ data: Product[] }>("/api/v1/products?type=FREE_GIVEAWAY").then((response) => response.data);
  },
};

