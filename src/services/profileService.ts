import { requestJson } from "@/services/index";

export type ShippingAddress = {
  recipientName: string;
  phone: string;
  postalCode: string;
  address: string;
  detailAddress: string;
  deliveryMemo: string;
};

const storageKey = "dropdeal_profile";

const initialProfile: ShippingAddress = {
  recipientName: "",
  phone: "",
  postalCode: "",
  address: "",
  detailAddress: "",
  deliveryMemo: "",
};

const readProfile = (): ShippingAddress | null => {
  if (typeof window === "undefined") return null;
  const savedProfile = window.localStorage.getItem(storageKey);
  if (!savedProfile) return null;
  try {
    return { ...initialProfile, ...JSON.parse(savedProfile) } as ShippingAddress;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

const clearProfile = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey);
};

export const profileService = {
  async getDefaultShippingAddress() {
    return requestJson<{ data: ShippingAddress | null }>("/api/v1/me/profile").then((response) => response.data);
  },
  async save(profile: ShippingAddress) {
    return requestJson<{ data: ShippingAddress }>("/api/v1/me/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    }).then((response) => response.data);
  },
  async loadLocalProfile() {
    return readProfile();
  },
  async clearLocalProfile() {
    clearProfile();
  },
};
