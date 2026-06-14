import { settlements } from "@/mocks/settlements";
import { isMockMode, requestJson } from "@/services/index";
import { Settlement } from "@/types/settlement";

const wait = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export const settlementService = {
  async getSettlements() {
    if (isMockMode()) {
      await wait();
      return settlements;
    }
    return requestJson<{ data: Settlement[] }>("/api/v1/seller/settlements").then((response) => response.data);
  },
  async getSettlementById(id: number) {
    if (isMockMode()) {
      await wait();
      return settlements.find((settlement) => settlement.id === id) ?? settlements[0];
    }
    return requestJson<{ data: Settlement }>(`/api/v1/seller/settlements/${id}`).then((response) => response.data);
  },
};

