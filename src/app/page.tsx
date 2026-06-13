import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { productService } from "@/services/productService";

export default async function Home() {
  const products = await productService.getProducts();
  const openProducts = products.filter((product) => product.status === "OPEN").slice(0, 4);
  const clearance = products.filter((product) => product.type === "CLEARANCE").slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <span className="eyebrow">Real-time group buying</span>
            <h1>모이면<br/>가격이 내려갑니다.</h1>
            <p>참여자가 늘어날수록 모두의 가격이 실시간으로 내려가요.<br/>먼저 참여해도 최종가와의 차액은 자동 환불됩니다.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/products">진행 중인 공동구매</Link>
              <Link className="btn btn-lime" href="/products?type=clearance">재고떨이 특가</Link>
            </div>
          </div>
          <div className="live-stage">
            <span className="live-chip"><i className="live-dot"/> LIVE PRICE DROP</span>
            <div className="stage-price"><del>36,000원</del><strong>19,000원</strong><b>46명이 함께 가격을 내렸어요</b></div>
            <div className="progress" style={{ marginTop:18, background:"rgba(255,255,255,.12)" }}><span style={{ width:"78%", background:"var(--lime)" }}/></div>
            <div className="stage-ticker">방금 참여자가 늘어 현재 가격이 2,000원 내려갔어요 ↓</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head"><div><span className="eyebrow">Dropping now</span><h2>지금 가격이 내려가는 중</h2><p>다음 참여자가 가격을 바꿀 수 있어요.</p></div><Link className="btn btn-soft" href="/products">전체 보기</Link></div>
          <div className="product-grid">{openProducts.map((product) => <ProductCard key={product.id} product={product}/>)}</div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="section-head"><div><span className="eyebrow">Clearance deal</span><h2>재고가 많을수록 할인은 더 크게</h2><p>좋은 상품의 마지막 재고를 함께 가장 낮은 가격으로.</p></div><Link className="btn btn-soft" href="/products?type=clearance">특가 전체 보기</Link></div>
          <div className="product-grid">{clearance.map((product) => <ProductCard key={product.id} product={product}/>)}</div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head"><div><span className="eyebrow">How it works</span><h2>먼저 참여해도 손해 보지 않아요</h2></div></div>
          <div className="steps">
            <div className="step"><span className="step-no">1</span><h3>현재가로 참여</h3><p className="page-lead">원하는 상품의 공동구매에 현재 가격으로 먼저 참여합니다.</p></div>
            <div className="step"><span className="step-no">2</span><h3>모일수록 가격 하락</h3><p className="page-lead">참여자가 단계별 목표를 달성할 때마다 모두의 가격이 내려갑니다.</p></div>
            <div className="step"><span className="step-no">3</span><h3>최종가 차액 환불</h3><p className="page-lead">종료 후 최종가보다 더 낸 금액은 결제수단으로 자동 환불됩니다.</p></div>
          </div>
        </div>
      </section>
      <section className="section"><div className="shell trust"><div><h2>가격이 내려갈수록 환불 금액은 올라갑니다.</h2><p>공동구매 실패 시에는 결제 금액 전액을 자동 환불합니다.</p></div><Link className="btn btn-lime" href="/products">안심하고 참여하기</Link></div></section>
    </>
  );
}
