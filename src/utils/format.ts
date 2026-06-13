import { Product } from "@/types/product";

export const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;
export const discountRate = (product: Product) =>
  Math.round((1 - product.currentPrice / product.originalPrice) * 100);
export const nextParticipants = (product: Product) => {
  const remainder = product.currentParticipants % product.discountStepParticipants;
  return remainder === 0 ? product.discountStepParticipants : product.discountStepParticipants - remainder;
};
export const nextPrice = (product: Product) =>
  Math.max(product.minPrice, product.currentPrice - product.discountStepAmount);
