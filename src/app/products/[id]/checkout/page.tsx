"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { products } from "@/mocks/products";
import { discountRate, won } from "@/utils/format";

export default function CheckoutPage() {
  const params = useParams<{ id:string }>();
  const router = useRouter();
  const [loading,setLoading] = useState(false);
  const product = products.find((item)=>item.id === Number(params.id)) ?? products[0];
  const pay = () => { setLoading(true); setTimeout(()=>router.push("/payment/success"),1000); };
  return (
    <div className="shell checkout">
      <div>
        <span className="eyebrow">Checkout</span><h1 className="page-title">공동구매 참여 확인</h1>
        <div className="form-section"><h3>참여 상품</h3><div className="order"><div><span className="seller">{product.sellerName}</span><h3>{product.name}</h3><div className="price-line"><span className="discount">{discountRate(product)}%</span><strong>{won(product.currentPrice)}</strong></div></div><div className={`product-visual ${product.visual}`} style={{ width:120,height:110,borderRadius:14 }}><span className="visual-icon" style={{ fontSize:45 }}>{product.icon}</span></div></div></div>
        <div className="form-section"><h3>결제 수단</h3><div className="reactions"><button className="reaction selected">신용·체크카드</button><button className="reaction">간편결제</button><button className="reaction">계좌이체</button></div></div>
        <div className="form-section"><h3>자동 환불 안내</h3><div className="notice">현재 가격으로 먼저 결제됩니다.<br/>공동구매 종료 후 최종 가격이 더 낮아지면 차액은 자동 환불됩니다.<br/>최소 참여 인원을 달성하지 못하면 결제 금액은 전액 환불됩니다.</div></div>
      </div>
      <aside className="panel summary">
        <h3>결제 금액</h3>
        <div className="summary-row"><span>정가</span><del>{won(product.originalPrice)}</del></div>
        <div className="summary-row"><span>현재 공동구매 할인</span><b className="discount">-{won(product.originalPrice-product.currentPrice)}</b></div>
        <div className="summary-row summary-total"><span>총 결제 금액</span><b>{won(product.currentPrice)}</b></div>
        <p className="page-lead">현재 남은 재고 {product.remainingStock}개 · 1인 1개 구매</p>
        <button className="btn btn-brand" style={{ width:"100%",marginTop:14,padding:16 }} onClick={pay} disabled={loading}>{loading ? "결제 처리 중..." : "현재가로 참여하고 결제하기"}</button>
      </aside>
    </div>
  );
}
