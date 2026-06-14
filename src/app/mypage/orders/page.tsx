import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { GuestOrdersClient } from "@/components/GuestOrdersClient";
import { products } from "@/mocks/products";
import { won } from "@/utils/format";

const orders = [
  { product: products[0], paid: 27000, final: 24000, state: "공동구매 진행 중", refund: 3000 },
  { product: products[4], paid: 23000, final: 19000, state: "차액 환불 완료", refund: 4000 },
  { product: products[7], paid: 16000, final: 14000, state: "배송 중", refund: 2000 },
];

export default async function OrdersPage() {
  const session = await getSession();
  if (session?.role === "seller") redirect("/seller/sales");
  if (!session) {
    return <div className="shell section"><GuestOrdersClient /></div>;
  }

  return (
    <div className="shell section">
      <span className="eyebrow">My DropDeal</span>
      <h1 className="page-title">내 공동구매 참여 내역</h1>
      <p className="page-lead">가격 변화와 환불 진행 상태를 한눈에 확인하세요.</p>
      <div className="hero-actions"><Link className="btn btn-soft" href="/mypage/profile">내 정보·배송지 관리</Link><Link className="btn btn-soft" href="/mypage/coupons">내 쿠폰함</Link></div>
      <div className="toolbar">
        <button className="filter active">전체</button>
        <button className="filter">진행 중</button>
        <button className="filter">환불 완료</button>
        <button className="filter">배송 중</button>
      </div>
      <div className="order-list">
        {orders.map(({ product, paid, final, state, refund }) => (
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
            <button className="btn btn-soft">상세 보기</button>
          </div>
        ))}
      </div>
    </div>
  );
}
