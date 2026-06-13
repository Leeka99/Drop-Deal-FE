import Link from "next/link";

export default function PaymentSuccessPage() {
  return <div className="status-page"><div className="status-card"><div className="status-icon">✓</div><span className="eyebrow">Payment complete</span><h1>공동구매 참여가 완료되었습니다.</h1><p className="page-lead">최종 가격이 더 내려가면 차액은 자동 환불됩니다.</p><div className="panel" style={{ margin:"22px 0",textAlign:"left" }}><div className="summary-row"><span>주문 번호</span><b>DD-260614-01842</b></div><div className="summary-row"><span>결제 가격</span><b>24,000원</b></div><div className="summary-row"><span>현재 공동구매가</span><b className="discount">24,000원</b></div></div><div className="hero-actions" style={{ justifyContent:"center" }}><Link className="btn btn-soft" href="/products/1">상품 상세로</Link><Link className="btn btn-primary" href="/mypage/orders">내 참여 내역</Link></div></div></div>;
}
