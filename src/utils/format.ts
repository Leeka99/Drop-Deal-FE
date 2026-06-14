import { Product } from "@/types/product";

export const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;
export const discountRate = (product: Product) =>
  product.type === "FREE_GIVEAWAY" ? 100 : Math.round((1 - product.currentPrice / product.originalPrice) * 100);
export const nextParticipants = (product: Product) => {
  if (product.type === "FREE_GIVEAWAY") return 0;
  if (product.type === "CLEARANCE") {
    return Math.max(0, product.discountStepParticipants - product.currentParticipants);
  }
  if (product.currentParticipants < product.minParticipants) {
    return product.minParticipants - product.currentParticipants;
  }
  const participantsAfterDiscountStart = product.currentParticipants - product.minParticipants;
  const remainder = participantsAfterDiscountStart % product.discountStepParticipants;
  return remainder === 0 ? product.discountStepParticipants : product.discountStepParticipants - remainder;
};
export const nextPrice = (product: Product) =>
  product.type === "FREE_GIVEAWAY"
    ? 0
    : product.type === "CLEARANCE"
    ? product.currentParticipants < product.discountStepParticipants
      ? product.minPrice
      : product.currentPrice
    : product.currentParticipants < product.minParticipants
    ? product.startPrice
    : Math.max(product.minPrice, product.currentPrice - product.discountStepAmount);
