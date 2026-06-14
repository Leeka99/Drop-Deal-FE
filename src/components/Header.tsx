import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/login/actions";
import { getSession } from "@/lib/auth";

export async function Header() {
  const session = await getSession();
  const isSeller = session?.role === "seller";

  return (
    <header className="header">
      <nav className="shell nav">
        <Link className="logo" href="/">
          <span className="logo-mark"><Image src="/brand/mainlogo.png" alt="" fill sizes="38px" /></span>
          <span>Drop<b>Deal</b></span>
        </Link>
        <div className="nav-links">
          <Link href="/products">공동구매</Link>
          <Link href="/products?type=clearance">재고떨이</Link>
          <Link href="/products?type=free">완전무료!</Link>
          {isSeller ? <Link href="/seller/sales">판매 내역</Link> : <Link href="/mypage/orders">내 참여</Link>}
          {session && !isSeller && <Link href="/mypage/profile">내 정보</Link>}
          {isSeller && <Link href="/seller/products">판매자 센터</Link>}
        </div>
        <div className="nav-actions">
          {session
            ? (
              <>
                <span className="nav-user">{session.name}</span>
                <form action={logout}>
                  <button className="btn btn-soft" type="submit">로그아웃</button>
                </form>
              </>
            )
            : <Link className="btn btn-soft" href="/login">로그인</Link>}
          {isSeller
            ? <Link className="btn btn-primary" href="/seller/products">판매자 센터</Link>
            : <Link className="btn btn-primary" href="/products">상품 구경하기</Link>}
        </div>
      </nav>
    </header>
  );
}
