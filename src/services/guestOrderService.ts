import { requestJson } from "@/services/index";

export type GuestOrder = {
  id: string;
  name: string;
  phone: string;
  productName: string;
  paid: number;
  state: string;
};

export const guestOrderService = {
  async create(order: GuestOrder) {
    return requestJson<{ data: GuestOrder }>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }).then((response) => response.data);
  },
  async verify(name: string, phone: string) {
    return requestJson<{ data: { token: string } }>("/api/v1/guest-orders/verify", {
      method: "POST",
      body: JSON.stringify({ name, phone }),
    }).then((response) => response.data.token);
  },
  async list(token?: string) {
    return requestJson<{ data: GuestOrder[] }>("/api/v1/guest-orders", {
      headers: token ? { "Guest-Order-Token": token } : {},
    }).then((response) => response.data);
  },
  async cancel(orderId: string, token?: string) {
    return requestJson<{ data: GuestOrder }>(`/api/v1/guest-orders/${orderId}/cancel`, {
      method: "POST",
      headers: token ? { "Guest-Order-Token": token } : {},
      body: JSON.stringify({ reason: "사용자 요청" }),
    }).then((response) => response.data);
  },
};
