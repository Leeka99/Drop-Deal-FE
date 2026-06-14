import { isMockMode, requestJson } from "@/services/index";

export type GuestOrder = {
  id: string;
  name: string;
  phone: string;
  productName: string;
  paid: number;
  state: string;
};

const storageKey = "dropdeal_guest_orders";

const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

const readOrders = (): GuestOrder[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as GuestOrder[];
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
};

const writeOrders = (orders: GuestOrder[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(orders));
};

export const guestOrderService = {
  async create(order: GuestOrder) {
    if (isMockMode()) {
      writeOrders([order, ...readOrders()]);
      return order;
    }
    return requestJson<{ data: GuestOrder }>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }).then((response) => response.data);
  },
  async verify(name: string, phone: string) {
    if (isMockMode()) {
      return readOrders().filter(
        (order) => order.name.trim() === name.trim() && normalizePhone(order.phone) === normalizePhone(phone),
      );
    }
    return requestJson<{ data: { token: string } }>("/api/v1/guest-orders/verify", {
      method: "POST",
      body: JSON.stringify({ name, phone }),
    }).then((response) => response.data.token);
  },
  async list(token?: string) {
    if (isMockMode()) return readOrders();
    return requestJson<{ data: GuestOrder[] }>("/api/v1/guest-orders", {
      headers: token ? { "Guest-Order-Token": token } : {},
    }).then((response) => response.data);
  },
  async cancel(orderId: string, token?: string) {
    if (isMockMode()) {
      const updatedOrders = readOrders().map((order) => (
        order.id === orderId ? { ...order, state: "주문 취소 · 전액 환불 예정" } : order
      ));
      writeOrders(updatedOrders);
      return updatedOrders.find((order) => order.id === orderId) ?? null;
    }
    return requestJson<{ data: GuestOrder }>(`/api/v1/guest-orders/${orderId}/cancel`, {
      method: "POST",
      headers: token ? { "Guest-Order-Token": token } : {},
      body: JSON.stringify({ reason: "사용자 요청" }),
    }).then((response) => response.data);
  },
};
