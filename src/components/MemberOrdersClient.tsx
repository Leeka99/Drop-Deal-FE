"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { won } from "@/utils/format";

type MemberOrder = {
  product: Product;
  paid: number;
  final: number;
  state: string;
  refund: number;
};

export function MemberOrdersClient({ initialOrders }: { initialOrders: MemberOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);

  const cancelOrder = (productId: number) => {
    if (!window.confirm("진행 중인 공동구매 참여를 취소하시겠습니까? 결제 금액은 전액 환불 처리됩니다.")) return;
    setOrders((current) => current.map((order) => (
      order.product.id === productId
        ? { ...order, state: "주문 취소 · 전액 환불 예정", refund: order.paid }
        : order
    )));
  };

  return (
    <div className="order-list">
      {orders.map(({ product, paid, final, state, refund }) => {
        const cancellable = state === "공동구매 진행 중";
        return (
          <div className="order" key={product.id}>
            <div>
              <span className="badge badge-live">{state}</span>
              <h3>{product.name}</h3>
              <div className="order-data">
                <div><span>결제 금액</span><b>{won(paid)}</b></div>
                <div><span>현재/최종가</span><b>{won(final)}</b></div>
                <div><span>환불 예정·완료</span><b className="discount">{won(refund)}</b></div>
              </div>
            </div>
            <div className="order-actions">
              <button className="btn btn-soft">상세 보기</button>
              {cancellable && <button className="btn btn-primary" type="button" onClick={() => cancelOrder(product.id)}>공동구매 취소하기</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
