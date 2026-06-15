import { requestJson } from "@/services/index";
import { Settlement } from "@/types/settlement";

export const settlementService = {
  async getSettlements() {
    return requestJson<{ data: Settlement[] }>("/api/v1/seller/settlements").then((response) => response.data);
  },
  async getSettlementById(id: number) {
    return requestJson<{ data: Settlement }>(`/api/v1/seller/settlements/${id}`).then((response) => response.data);
  },
};
