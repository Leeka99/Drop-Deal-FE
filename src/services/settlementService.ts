import { settlements } from "@/mocks/settlements";

const wait = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export const settlementService = {
  async getSettlements() {
    await wait();
    return settlements;
  },
  async getSettlementById(id: number) {
    await wait();
    return settlements.find((settlement) => settlement.id === id) ?? settlements[0];
  },
};
