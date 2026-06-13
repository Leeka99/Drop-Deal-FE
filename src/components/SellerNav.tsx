import Link from "next/link";

export function SellerNav() {
  return <aside className="seller-side"><h3>판매자 센터</h3><Link href="/seller/products">상품 관리</Link><Link href="/seller/products/new">새 공동구매 등록</Link><Link href="/seller/products">주문·참여 현황</Link><Link href="/seller/products">Q&A 관리</Link><Link href="/seller/products">정산 관리</Link></aside>;
}
