import { http, HttpResponse } from "msw";
import { products } from "@/mocks/products";
import { settlements } from "@/mocks/settlements";
import type { GuestOrder } from "@/services/guestOrderService";
import type { MemberOrder } from "@/services/memberOrderService";
import type { ShippingAddress } from "@/services/profileService";

const guestOrdersKey = "dropdeal_guest_orders";
const profileKey = "dropdeal_profile";

let serverGuestOrders: GuestOrder[] = [];
let serverProfile: ShippingAddress | null = null;

const memberOrders: MemberOrder[] = [
  { id: "DD-260614-01842", product: products[0], paid: 27000, final: 24000, state: "공동구매 진행 중", refund: 3000 },
  { id: "DD-260614-01843", product: products[4], paid: 23000, final: 19000, state: "차액 환불 완료", refund: 4000 },
  { id: "DD-260614-01844", product: products[7], paid: 16000, final: 14000, state: "배송 중", refund: 2000 },
];

const isBrowser = () => typeof window !== "undefined";

const readStorage = <T>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? JSON.stringify(fallback)) as T;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
};

const writeStorage = (key: string, value: unknown) => {
  if (isBrowser()) window.localStorage.setItem(key, JSON.stringify(value));
};

const readGuestOrders = () => readStorage(guestOrdersKey, serverGuestOrders);

const writeGuestOrders = (orders: GuestOrder[]) => {
  serverGuestOrders = orders;
  writeStorage(guestOrdersKey, orders);
};

const readProfile = () => readStorage<ShippingAddress | null>(profileKey, serverProfile);

const writeProfile = (profile: ShippingAddress) => {
  serverProfile = profile;
  writeStorage(profileKey, profile);
};

const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

export const handlers = [
  http.get("*/api/v1/products", ({ request }) => {
    const type = new URL(request.url).searchParams.get("type");
    return HttpResponse.json({ data: type ? products.filter((product) => product.type === type) : products });
  }),
  http.get("*/api/v1/products/:id", ({ params }) => {
    const product = products.find((item) => item.id === Number(params.id)) ?? products[0];
    return HttpResponse.json({ data: product });
  }),
  http.get("*/api/v1/me/orders", () => HttpResponse.json({ data: memberOrders })),
  http.post("*/api/v1/orders/:orderId/cancel", ({ params }) => {
    const order = memberOrders.find((item) => item.id === params.orderId) ?? null;
    return HttpResponse.json({ data: order });
  }),
  http.post("*/api/v1/orders", async ({ request }) => {
    const order = await request.json() as GuestOrder;
    writeGuestOrders([order, ...readGuestOrders()]);
    return HttpResponse.json({ data: order });
  }),
  http.post("*/api/v1/guest-orders/verify", async ({ request }) => {
    const identity = await request.json() as Pick<GuestOrder, "name" | "phone">;
    const token = encodeURIComponent(JSON.stringify({
      name: identity.name.trim(),
      phone: normalizePhone(identity.phone),
    }));
    return HttpResponse.json({ data: { token } });
  }),
  http.get("*/api/v1/guest-orders", ({ request }) => {
    const token = request.headers.get("Guest-Order-Token");
    if (!token) return HttpResponse.json({ data: [] });

    try {
      const identity = JSON.parse(decodeURIComponent(token)) as Pick<GuestOrder, "name" | "phone">;
      const orders = readGuestOrders().filter(
        (order) => order.name.trim() === identity.name
          && normalizePhone(order.phone) === identity.phone,
      );
      return HttpResponse.json({ data: orders });
    } catch {
      return HttpResponse.json({ data: [] });
    }
  }),
  http.post("*/api/v1/guest-orders/:orderId/cancel", ({ params }) => {
    const orders = readGuestOrders().map((order) => (
      order.id === params.orderId ? { ...order, state: "주문 취소 · 전액 환불 예정" } : order
    ));
    writeGuestOrders(orders);
    return HttpResponse.json({ data: orders.find((order) => order.id === params.orderId) ?? null });
  }),
  http.get("*/api/v1/me/profile", () => HttpResponse.json({ data: readProfile() })),
  http.put("*/api/v1/me/profile", async ({ request }) => {
    const profile = await request.json() as ShippingAddress;
    writeProfile(profile);
    return HttpResponse.json({ data: profile });
  }),
  http.get("*/api/v1/seller/settlements", () => HttpResponse.json({ data: settlements })),
  http.get("*/api/v1/seller/settlements/:id", ({ params }) => {
    const settlement = settlements.find((item) => item.id === Number(params.id)) ?? settlements[0];
    return HttpResponse.json({ data: settlement });
  }),
];
