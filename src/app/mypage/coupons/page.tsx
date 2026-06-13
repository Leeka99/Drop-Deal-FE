const coupons = [
  { rate:50, name:"재고떨이 랜덤 이벤트 당첨", date:"2026.08.31", status:"사용 가능" },
  { rate:15, name:"첫 공동구매 감사 쿠폰", date:"2026.07.15", status:"사용 가능" },
  { rate:10, name:"가격 하락 응원 쿠폰", date:"2026.06.01", status:"만료됨" },
];
export default function CouponsPage() {
  return <div className="shell section"><span className="eyebrow">My benefits</span><h1 className="page-title">내 쿠폰함</h1><p className="page-lead">재고떨이 공동구매에 참여하면 특별한 쿠폰을 받을 수 있어요.</p><div className="coupon-grid" style={{ marginTop:28 }}>{coupons.map((coupon)=><div className="coupon" key={coupon.name}><span className="badge badge-event">{coupon.status}</span><strong>{coupon.rate}% OFF</strong><b>{coupon.name}</b><p className="seller">사용 기한 {coupon.date}까지</p></div>)}</div></div>;
}
