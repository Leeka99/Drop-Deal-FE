import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "DropDeal - 모이면 가격이 내려갑니다",
    short_name: "DropDeal",
    description: "참여자가 늘수록 모두의 가격이 내려가는 실시간 공동구매",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fff2e0",
    theme_color: "#f6b1c1",
    categories: ["shopping", "lifestyle"],
    lang: "ko-KR",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "공동구매 상품 보기",
        short_name: "공동구매",
        description: "현재 진행 중인 공동구매 상품을 확인합니다.",
        url: "/products",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "내 참여 내역",
        short_name: "내 참여",
        description: "참여한 공동구매와 환불 상태를 확인합니다.",
        url: "/mypage/orders",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
