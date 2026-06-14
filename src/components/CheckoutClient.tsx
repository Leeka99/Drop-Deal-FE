"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Product } from "@/types/product";
import { discountRate, won } from "@/utils/format";

type Props = {
  product: Product;
  viewerRole?: "buyer" | "seller";
  canParticipate: boolean;
};

export function CheckoutClient({ product, viewerRole, canParticipate }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [fulfillment, setFulfillment] = useState<"SHIPPING" | "PICKUP">(product.giveaway?.fulfillmentMethods[0] ?? "SHIPPING");
  const [shippingAddress, setShippingAddress] = useState({
    recipientName: "",
    phone: "",
    postalCode: "",
    address: "",
    detailAddress: "",
    deliveryMemo: "",
  });
  const isSeller = viewerRole === "seller";
  const isGiveaway = product.type === "FREE_GIVEAWAY";
  const pickupDeposit = product.giveaway?.pickup?.deposit ?? 2000;
  const shippingFee = isGiveaway ? product.giveaway?.shippingFee ?? 0 : product.shippingFee ?? 3000;
  const needsShippingAddress = fulfillment === "SHIPPING";
  const shippingAddressComplete = !needsShippingAddress || (
    shippingAddress.recipientName.trim() &&
    shippingAddress.phone.trim() &&
    shippingAddress.postalCode.trim() &&
    shippingAddress.address.trim() &&
    shippingAddress.detailAddress.trim()
  );
  const totalAmount = isGiveaway
    ? fulfillment === "PICKUP" ? pickupDeposit : shippingFee
    : product.currentPrice + shippingFee;
  const blocked = isSeller || !canParticipate;

  const pay = () => {
    if (!shippingAddressComplete) return;
    setLoading(true);
    setTimeout(() => {
      if (isGiveaway) {
        setLoading(false);
        setCompleted(true);
        return;
      }
      router.push("/payment/success");
    }, 1000);
  };

  const loadDefaultAddress = () => {
    const savedProfile = localStorage.getItem("dropdeal_profile");
    if (!savedProfile) return;
    try {
      const profile = JSON.parse(savedProfile) as Partial<typeof shippingAddress> & { phone?: string };
      setShippingAddress((current) => ({
        ...current,
        recipientName: profile.recipientName ?? current.recipientName,
        phone: profile.phone ?? current.phone,
        postalCode: profile.postalCode ?? current.postalCode,
        address: profile.address ?? current.address,
        detailAddress: profile.detailAddress ?? current.detailAddress,
        deliveryMemo: profile.deliveryMemo ?? current.deliveryMemo,
      }));
    } catch {
      localStorage.removeItem("dropdeal_profile");
    }
  };

  if (completed && isGiveaway) {
    return <div className="status-page"><div className="status-card">
      <div className="status-icon">✓</div>
      <span className="eyebrow">Free giveaway reserved</span>
      <h1>완전무료! 상품 신청이 완료되었습니다.</h1>
      {fulfillment === "PICKUP" ? <>
        <p className="page-lead">매장에서 교환 코드 또는 QR을 보여주세요. 수령 완료 후 보증금 {won(pickupDeposit)}이 전액 반환됩니다.</p>
        <div className="panel" style={{ margin:"22px 0" }}>
          <span className="seller">교환 코드</span><h2 style={{ letterSpacing:4 }}>FREE-9K2A</h2>
          <div style={{ width:140, height:140, margin:"18px auto 0", display:"grid", placeItems:"center", background:"repeating-conic-gradient(#111 0 25%, #fff 0 50%) 0 / 22px 22px", border:"10px solid white" }} aria-label="픽업 교환 QR 코드"/>
          <p>{product.giveaway?.pickup?.storeName}<br/>{product.giveaway?.pickup?.address}</p>
        </div>
      </> : <p className="page-lead">택배비 {won(totalAmount)} 결제가 완료되었습니다. {shippingAddress.address} {shippingAddress.detailAddress}로 발송됩니다.</p>}
      <Link className="btn btn-primary" href="/mypage/orders">내 참여 내역</Link>
    </div></div>;
  }

  if (blocked) {
    return (
      <div className="shell checkout">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1 className="page-title">공동구매 참여가 제한되었습니다.</h1>
          <div className="form-section">
            <h3>참여 불가 사유</h3>
            <div className="notice">
              {isSeller
                ? "판매자 계정은 상품을 둘러볼 수 있지만 직접 구매할 수 없습니다."
                : "이 상품은 현재 참여할 수 없는 상태입니다."}
            </div>
          </div>
        </div>
        <aside className="panel summary">
          <h3>상품 정보</h3>
          <div className="summary-row"><span>상품명</span><b>{product.name}</b></div>
          <div className="summary-row"><span>현재 가격</span><b>{won(product.currentPrice)}</b></div>
          <div className="summary-row"><span>참여 현황</span><b>{product.currentParticipants} / {product.maxParticipants}명</b></div>
          <div className="hero-actions" style={{ marginTop: 16 }}>
            {isSeller ? (
              <>
                <Link className="btn btn-primary" href="/seller/sales">판매 내역 보기</Link>
                <Link className="btn btn-soft" href="/seller/products">판매자 센터로 이동</Link>
              </>
            ) : (
              <Link className="btn btn-primary" href={`/products/${product.id}`}>상품 상세로</Link>
            )}
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="shell checkout">
      <div>
        <span className="eyebrow">Checkout</span>
        <h1 className="page-title">{isGiveaway ? "완전무료! 상품 신청" : "공동구매 참여 확인"}</h1>
        <div className="form-section">
          <h3>참여 상품</h3>
          <div className="order">
            <div>
              <span className="seller">{product.sellerName}</span>
              <h3>{product.name}</h3>
              <div className="price-line">
                {isGiveaway ? <><span className="discount">완전무료!</span><strong>상품 가격 0원</strong></> : <>
                <span className="discount">{discountRate(product)}%</span>
                <strong>{won(product.currentPrice)}</strong>
                </>}
              </div>
            </div>
            <div className={`product-visual ${product.visual}`} style={{ width: 120, height: 110, borderRadius: 14 }}>
              <span className="visual-icon" style={{ fontSize: 45 }}>{product.icon}</span>
            </div>
          </div>
        </div>
        {isGiveaway && product.giveaway && <div className="form-section">
          <h3>수령 방법</h3>
          <div className="reactions">
            {product.giveaway.fulfillmentMethods.includes("SHIPPING") && <button type="button" className={`reaction ${fulfillment === "SHIPPING" ? "selected" : ""}`} onClick={()=>setFulfillment("SHIPPING")}>택배 · {won(product.giveaway?.shippingFee ?? 0)}</button>}
            {product.giveaway.fulfillmentMethods.includes("PICKUP") && <button type="button" className={`reaction ${fulfillment === "PICKUP" ? "selected" : ""}`} onClick={()=>setFulfillment("PICKUP")}>가게 직접 픽업 · 보증금 {won(pickupDeposit)}</button>}
          </div>
          {fulfillment === "PICKUP" && product.giveaway.pickup && <div className="notice" style={{ marginTop:14 }}>{product.giveaway.pickup.storeName} · {product.giveaway.pickup.address}<br/>{product.giveaway.pickup.instructions}<br/>수령 확인 시 보증금은 전액 환불됩니다.</div>}
        </div>}
        {needsShippingAddress && <div className="form-section">
          <div className="section-head" style={{ marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>배송 정보</h3>
            <button className="btn btn-soft" type="button" onClick={loadDefaultAddress}>기본 배송지 불러오기</button>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>받는 분</label><input className="field" value={shippingAddress.recipientName} onChange={(event)=>setShippingAddress((current)=>({...current, recipientName:event.target.value}))} placeholder="이름" required/></div>
            <div className="form-group"><label>연락처</label><input className="field" value={shippingAddress.phone} onChange={(event)=>setShippingAddress((current)=>({...current, phone:event.target.value}))} placeholder="010-0000-0000" required/></div>
            <div className="form-group"><label>우편번호</label><input className="field" value={shippingAddress.postalCode} onChange={(event)=>setShippingAddress((current)=>({...current, postalCode:event.target.value}))} placeholder="우편번호" required/></div>
            <div className="form-group"><label>기본 주소</label><input className="field" value={shippingAddress.address} onChange={(event)=>setShippingAddress((current)=>({...current, address:event.target.value}))} placeholder="도로명 주소" required/></div>
            <div className="form-group full"><label>상세 주소</label><input className="field" value={shippingAddress.detailAddress} onChange={(event)=>setShippingAddress((current)=>({...current, detailAddress:event.target.value}))} placeholder="동·호수 또는 상세 위치" required/></div>
            <div className="form-group full"><label>배송 메모</label><input className="field" value={shippingAddress.deliveryMemo} onChange={(event)=>setShippingAddress((current)=>({...current, deliveryMemo:event.target.value}))} placeholder="배송 요청사항을 입력하세요"/></div>
          </div>
        </div>}
        <div className="form-section">
          <h3>결제 수단</h3>
          <div className="reactions">
            <button className="reaction selected">신용·체크카드</button>
            <button className="reaction">간편결제</button>
            <button className="reaction">계좌이체</button>
          </div>
        </div>
        <div className="form-section">
          <h3>{isGiveaway ? "무료나눔 결제 안내" : "자동 환불 안내"}</h3>
          <div className="notice">
            {isGiveaway ? <>
              상품 가격과 사이트 수수료는 0원입니다.<br/>
              {fulfillment === "PICKUP" ? `픽업 보증금 ${won(pickupDeposit)}은 수령 완료 후 전액 환불됩니다.` : "판매자가 등록한 택배비만 결제됩니다."}
            </> : <>
            현재 가격으로 먼저 결제됩니다.<br />
            공동구매 종료 후 최종 가격이 더 낮아지면 차액은 자동 환불됩니다.<br />
            최소 참여 인원을 달성하지 못하면 결제 금액은 전액 환불됩니다.
            </>}
          </div>
        </div>
      </div>
      <aside className="panel summary">
        <h3>결제 금액</h3>
        {isGiveaway ? <>
          <div className="summary-row"><span>상품 가격</span><b>0원</b></div>
          <div className="summary-row"><span>{fulfillment === "PICKUP" ? "환불형 픽업 보증금" : "택배비"}</span><b>{won(totalAmount)}</b></div>
        </> : <>
          <div className="summary-row"><span>정가</span><del>{won(product.originalPrice)}</del></div>
          <div className="summary-row"><span>현재 공동구매 할인</span><b className="discount">-{won(product.originalPrice - product.currentPrice)}</b></div>
          <div className="summary-row"><span>택배비</span><b>{won(shippingFee)}</b></div>
        </>}
        <div className="summary-row summary-total"><span>총 결제 금액</span><b>{won(totalAmount)}</b></div>
        <p className="page-lead">현재 참여 {product.currentParticipants} / 최대 {product.maxParticipants}명 · 1인 1개 구매</p>
        <button
          className="btn btn-brand"
          style={{ width: "100%", marginTop: 14, padding: 16 }}
          onClick={pay}
          disabled={loading || !canParticipate || !shippingAddressComplete}
        >
          {loading ? "결제 처리 중..." : isGiveaway ? fulfillment === "PICKUP" ? "보증금 결제하고 픽업 예약하기" : "택배비 결제하고 신청하기" : "현재가로 참여하고 결제하기"}
        </button>
      </aside>
    </div>
  );
}
