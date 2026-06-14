import { ProductType } from "@/types/product";

export const productTypePolicy: Record<ProductType, {
  label: string;
  summary: string;
  criteria: string[];
}> = {
  NORMAL: {
    label: "일반 공동구매",
    summary: "정상 판매 상품을 참여 인원에 따라 단계적으로 할인합니다.",
    criteria: [
      "품질, 유통기한, 외관상 별도 고지가 필요하지 않은 정상 상품",
      "안정적인 재고와 배송 일정을 확보한 상품",
      "참여 인원에 따른 가격 하락이 핵심 혜택인 상품",
    ],
  },
  CLEARANCE: {
    label: "재고떨이 상품",
    summary: "명확한 재고 소진 사유를 공개하고 더 큰 할인을 제공합니다.",
    criteria: [
      "과잉 재고, 시즌오프, 판매 종료 예정 상품",
      "유통기한 임박 또는 패키지·외관상 하자가 있는 상품",
      "소진 사유와 상품 상태를 구매자에게 명확히 고지할 수 있는 상품",
    ],
  },
  FREE_GIVEAWAY: {
    label: "완전무료! 상품",
    summary: "폐업·대량 재고 기부 또는 가게 홍보를 위해 상품 가격 없이 나눔합니다.",
    criteria: [
      "상품 가격은 무료이며 택배 선택 시 등록된 택배비만 결제",
      "매장 픽업은 2,000원 보증금 결제 후 수령 완료 시 전액 반환",
      "무료나눔 사유와 수령 방법을 구매자에게 명확히 고지할 수 있는 상품",
    ],
  },
};

export const clearanceReasons = [
  "과잉 재고",
  "시즌오프",
  "유통기한 임박",
  "패키지·외관상 하자",
  "판매 종료 예정",
];

export const giveawayReasons = [
  "폐업 예정 또는 폐업 재고 기부",
  "과잉 물량 무료 기부",
  "지역사회 나눔",
  "가게 홍보 및 방문 유도",
  "기타 무료나눔",
];
