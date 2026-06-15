import { requestJson } from "@/services/index";
import { Product } from "@/types/product";

export type MemberOrder = {
  id: string;
  product: Product;
  paid: number;
  final: number;
  state: string;
  refund: number;
};

export const memberOrderService = {
  async getOrders() {
    return requestJson<{ data: MemberOrder[] }>("/api/v1/me/orders").then((response) => response.data);
  },
  async cancelOrder(orderId: string) {
    return requestJson<{ data: MemberOrder }>(`/api/v1/orders/${orderId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason: "사용자 요청" }),
    }).then((response) => response.data);
  },
};
