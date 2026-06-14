import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="header">
      <nav className="shell nav">
        <Link className="logo" href="/">
          <span className="logo-mark"><Image src="/brand/mainlogo.png" alt="" fill sizes="38px"/></span>
          <span>Drop<b>Deal</b></span>
        </Link>
        <div className="nav-links">
          <Link href="/products">공동구매</Link>
          <Link href="/products?type=clearance">재고떨이</Link>
          <Link href="/mypage/orders">내 참여</Link>
          <Link href="/seller/products">판매자 센터</Link>
        </div>
        <div className="nav-actions">
          <Link className="btn btn-soft" href="/mypage/coupons">내 쿠폰</Link>
          <Link className="btn btn-primary" href="/products">가격 내려가기</Link>
        </div>
      </nav>
    </header>
  );
}
