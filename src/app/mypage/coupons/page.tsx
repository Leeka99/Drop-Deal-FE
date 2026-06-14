const coupons = [
  { rate:3, name:"신규 공동구매 참여 쿠폰", limit:"최대 3,000원", date:"2026.08.31", status:"사용 가능" },
  { rate:5, name:"재구매 감사 쿠폰", limit:"최대 5,000원", date:"2026.08.15", status:"사용 가능" },
  { rate:10, name:"마감 임박 응원 쿠폰", limit:"최대 10,000원", date:"2026.07.31", status:"사용 가능" },
  { rate:15, name:"재고떨이 특별 쿠폰", limit:"최대 15,000원", date:"2026.07.15", status:"사용 가능" },
  { rate:30, name:"한정 특별 프로모션 쿠폰", limit:"최대 10,000원 · 최종 참여 인원의 5% 추첨", date:"2026.06.30", status:"사용 가능" },
];
export default function CouponsPage() {
  return <div className="shell section"><span className="eyebrow">My benefits</span><h1 className="page-title">내 쿠폰함</h1><p className="page-lead">상품 참여율과 이벤트 조건에 맞는 쿠폰 혜택을 확인하세요.</p><div className="coupon-grid" style={{ marginTop:28 }}>{coupons.map((coupon)=><div className="coupon" key={coupon.name}><span className="badge badge-event">{coupon.status}</span><strong>{coupon.rate}% OFF</strong><b>{coupon.name}</b><p className="seller">{coupon.limit} · 사용 기한 {coupon.date}까지</p></div>)}</div></div>;
}
