import { Product } from "@/types/product";

export const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;
export const discountRate = (product: Product) =>
  Math.round((1 - product.currentPrice / product.originalPrice) * 100);
export const nextParticipants = (product: Product) => {
  if (product.currentParticipants < product.minParticipants) {
    return product.minParticipants - product.currentParticipants;
  }
  const participantsAfterDiscountStart = product.currentParticipants - product.minParticipants;
  const remainder = participantsAfterDiscountStart % product.discountStepParticipants;
  return remainder === 0 ? product.discountStepParticipants : product.discountStepParticipants - remainder;
};
export const nextPrice = (product: Product) =>
  product.currentParticipants < product.minParticipants
    ? product.startPrice
    : Math.max(product.minPrice, product.currentPrice - product.discountStepAmount);
