import { products } from "@/mocks/products";
import { isMockMode, requestJson } from "@/services/index";
import { Product } from "@/types/product";

export type MemberOrder = {
  id: string;
  product: Product;
  paid: number;
  final: number;
  state: string;
  refund: number;
};

const mockOrders: MemberOrder[] = [
  { id: "DD-260614-01842", product: products[0], paid: 27000, final: 24000, state: "공동구매 진행 중", refund: 3000 },
  { id: "DD-260614-01843", product: products[4], paid: 23000, final: 19000, state: "차액 환불 완료", refund: 4000 },
  { id: "DD-260614-01844", product: products[7], paid: 16000, final: 14000, state: "배송 중", refund: 2000 },
];

export const memberOrderService = {
  async getOrders() {
    if (isMockMode()) return mockOrders;
    return requestJson<{ data: MemberOrder[] }>("/api/v1/me/orders").then((response) => response.data);
  },
  async cancelOrder(orderId: string) {
    if (isMockMode()) {
      return mockOrders.find((order) => order.id === orderId) ?? null;
    }
    return requestJson<{ data: MemberOrder }>(`/api/v1/orders/${orderId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason: "사용자 요청" }),
    }).then((response) => response.data);
  },
};
