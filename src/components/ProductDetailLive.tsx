"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { discountRate, nextParticipants, nextPrice, won } from "@/utils/format";

const reactionLabels = ["🔥 같이 사요", "💸 더 내려가자", "⏰ 마감 임박", "👀 고민 중", "🎉 가격 좋다", "📦 재고 털자"];
const initialFeeds = [
  "방금 1명이 공동구매에 참여했어요.",
  "다음 가격 하락까지 얼마 남지 않았어요.",
  "🔥 12명이 같이 사요를 눌렀어요.",
  "공동구매 성공 조건을 달성했어요.",
];

export function ProductDetailLive({ initialProduct }: { initialProduct: Product }) {
  const [product, setProduct] = useState(initialProduct);
  const [feeds, setFeeds] = useState(initialFeeds);
  const [selected, setSelected] = useState("");
  const [counts, setCounts] = useState([24,18,7,11,15,9]);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setProduct((prev) => {
        if (prev.status !== "OPEN" || prev.currentParticipants >= prev.maxParticipants) return prev;
        const participants = prev.currentParticipants + 1;
        const shouldDrop = participants % prev.discountStepParticipants === 0;
        const price = shouldDrop ? Math.max(prev.minPrice, prev.currentPrice - prev.discountStepAmount) : prev.currentPrice;
        setFeeds((old) => [
          shouldDrop ? `현재 가격이 ${won(price)}으로 내려갔어요.` : "새로운 참여자가 공동구매에 참여했어요.",
          ...old.slice(0, 5),
        ]);
        return { ...prev, currentParticipants: participants, remainingStock: Math.max(0, prev.remainingStock - 1), currentPrice: price };
      });
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const currentStep = product.currentParticipants % product.discountStepParticipants;
  const progress = currentStep / product.discountStepParticipants * 100;
  const couponLeft = Math.max(0, 50 - product.currentParticipants);
  const rate = useMemo(() => discountRate(product), [product]);

  const react = (label: string, index: number) => {
    if (selected === label) return;
    setCounts((prev) => prev.map((count, i) => i === index ? count + 1 : count));
    setSelected(label);
    setFeeds((prev) => [`${label.split(" ")[0]} 1명이 ${label.slice(3)}를 눌렀어요.`, ...prev.slice(0, 5)]);
  };

  return (
    <>
      <div className="shell detail-grid">
        <div className={`detail-visual ${product.visual}`}>{product.icon}</div>
        <div>
          <div className="badges" style={{ position:"static" }}>
            {product.type === "CLEARANCE" && <span className="badge badge-clear">재고떨이</span>}
            {product.couponEvent && <span className="badge badge-event">랜덤 쿠폰 이벤트</span>}
            <span className="badge badge-live">실시간 공동구매</span>
          </div>
          <p className="seller" style={{ marginTop:18 }}>{product.sellerName} · ★ {product.rating} ({product.reviewCount})</p>
          <h1 className="detail-title">{product.name}</h1>
          <p className="page-lead">{product.description}</p>
          <div className="detail-price">
            <del className="original">{won(product.originalPrice)}</del>
            <div className="price-line"><span className="discount">{rate}%</span><strong>{won(product.currentPrice)}</strong></div>
            <span className="seller">최저 가능가 {won(product.minPrice)}</span>
          </div>
          <div className="detail-stat-grid">
            <div className="detail-stat"><span>현재 참여자</span><b>{product.currentParticipants} / {product.maxParticipants}명</b></div>
            <div className="detail-stat"><span>남은 재고</span><b>{product.remainingStock}개</b></div>
            <div className="detail-stat"><span>마감까지</span><b>05:42:18</b></div>
          </div>
          <div className="notice">먼저 참여해도 손해 보지 않습니다. 최종 가격이 더 내려가면 차액은 자동 환불됩니다.</div>
          <div className="price-panel">
            <div className="price-next"><div><span className="seller">현재 가격</span><br/><b>{won(product.currentPrice)}</b></div><div style={{ textAlign:"right" }}><span className="seller">다음 가격</span><br/><strong>{won(nextPrice(product))}</strong></div></div>
            <b>{nextParticipants(product)}명만 더 참여하면 가격이 내려갑니다.</b>
            <div className="progress" style={{ height:10 }}><span style={{ width:`${progress}%` }} /></div>
            <div className="metric"><span>현재 단계 {currentStep}명</span><span>{product.discountStepParticipants}명 달성 시 ↓ {won(product.discountStepAmount)}</span></div>
          </div>
          <Link className="btn btn-brand" style={{ width:"100%", marginTop:16, padding:16 }} href={`/products/${product.id}/checkout`}>현재가로 공동구매 참여하기</Link>
        </div>
      </div>

      <section className="section section-soft">
        <div className="shell">
          <div className="content-grid">
            <div className="panel">
              <h3>실시간 참여 피드 <span className="badge badge-live">LIVE</span></h3>
              <div className="feed-list">{feeds.map((feed, index) => <div className="feed" key={`${feed}-${index}`}>{feed}<time>방금 전</time></div>)}</div>
            </div>
            <div className="panel">
              <h3>같이 가격을 내려봐요</h3>
              <p className="page-lead">응원 리액션은 실시간 피드에 반영됩니다.</p>
              <div className="reactions" style={{ marginTop:18 }}>
                {reactionLabels.map((label, index) => <button key={label} className={`reaction ${selected === label ? "selected" : ""}`} onClick={() => react(label,index)}>{label} {counts[index]}</button>)}
              </div>
            </div>
          </div>
          {product.couponEvent && <div className="coupon-box" style={{ marginBottom:25 }}><span className="eyebrow">Clearance Lucky Draw</span><h3>공동구매 성공 시 참여자 중 5%에게 50% 할인 쿠폰</h3><p>다음 구매에 사용할 수 있어요. 쿠폰 추첨 조건까지 <b>{couponLeft}명</b> 남았습니다.</p></div>}
          <div className="content-grid">
            <div className="panel">
              <h3>판매자 Q&A</h3>
              <div className="qa"><b>Q. 유통기한이 언제까지인가요?</b><p className="qa-answer">A. 2026년 8월 30일까지입니다.</p></div>
              <div className="qa"><b>Q. 배송은 언제 시작되나요?</b><p className="qa-answer">A. 공동구매 종료 다음 날부터 순차 발송됩니다.</p></div>
              <div className="form-group" style={{ marginTop:16 }}><textarea className="field" maxLength={300} value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="판매자에게 궁금한 점을 남겨주세요."/><button className="btn btn-soft" onClick={()=>setQuestion("")}>질문 등록</button></div>
            </div>
            <div className="panel">
              <h3>구매 후기 <span className="seller">★ {product.rating} · {product.reviewCount}개</span></h3>
              <div className="qa"><b>★★★★★ 구매자 sun***</b><p>가격이 내려가는 걸 보는 재미가 있고 포장도 꼼꼼했어요.</p></div>
              <div className="qa"><b>★★★★☆ 구매자 min***</b><p>처음 참여했는데 차액 환불 안내가 명확해서 안심됐습니다.</p></div>
              <button className="btn btn-soft" style={{ marginTop:16 }}>후기 작성하기</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
