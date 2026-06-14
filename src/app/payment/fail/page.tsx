import Link from "next/link";

export default function PaymentFailPage() {
  return <div className="status-page"><div className="status-card"><div className="status-icon" style={{ background:"var(--brand)" }}>!</div><span className="eyebrow">Payment failed</span><h1>결제가 완료되지 않았습니다.</h1><p className="page-lead">결제 수단을 확인한 뒤 다시 시도해주세요.</p><div className="hero-actions" style={{ justifyContent:"center" }}><Link className="btn btn-primary" href="/products/1/checkout">다시 결제하기</Link><Link className="btn btn-soft" href="/products/1">상품 상세로</Link></div></div></div>;
}
