import { requestJson } from "@/services/index";
import { Product } from "@/types/product";

export const productService = {
  async getProducts() {
    return requestJson<{ data: Product[] }>("/api/v1/products").then((response) => response.data);
  },
  async getProductById(id: number) {
    return requestJson<{ data: Product }>(`/api/v1/products/${id}`).then((response) => response.data);
  },
  async getClearanceProducts() {
    return requestJson<{ data: Product[] }>("/api/v1/products?type=CLEARANCE").then((response) => response.data);
  },
  async getFreeGiveawayProducts() {
    return requestJson<{ data: Product[] }>("/api/v1/products?type=FREE_GIVEAWAY").then((response) => response.data);
  },
};
