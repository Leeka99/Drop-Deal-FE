import Link from "next/link";
import { redirect } from "next/navigation";
import { GuestOrdersClient } from "@/components/GuestOrdersClient";
import { MemberOrdersClient } from "@/components/MemberOrdersClient";
import { getSession } from "@/lib/auth";
import { memberOrderService } from "@/services/memberOrderService";

export default async function OrdersPage() {
  const session = await getSession();
  if (session?.role === "seller") redirect("/seller/sales");
  if (!session) {
    return <div className="shell section"><GuestOrdersClient /></div>;
  }

  const orders = await memberOrderService.getOrders();

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
      <MemberOrdersClient initialOrders={orders} />
    </div>
  );
}

