"use client";

import { FormEvent, useState } from "react";
import { won } from "@/utils/format";

type GuestOrder = {
  id: string;
  name: string;
  phone: string;
  productName: string;
  paid: number;
  state: string;
};

const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

export function GuestOrdersClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<GuestOrder[] | null>(null);
  const [message, setMessage] = useState("");

  const verify = (event: FormEvent) => {
    event.preventDefault();
    try {
      const savedOrders = JSON.parse(localStorage.getItem("dropdeal_guest_orders") ?? "[]") as GuestOrder[];
      const matchedOrders = savedOrders.filter(
        (order) => order.name.trim() === name.trim() && normalizePhone(order.phone) === normalizePhone(phone),
      );
      setOrders(matchedOrders);
      setMessage(matchedOrders.length ? "" : "인증 정보와 일치하는 비회원 주문을 찾을 수 없습니다.");
    } catch {
      localStorage.removeItem("dropdeal_guest_orders");
      setOrders([]);
      setMessage("비회원 주문 정보를 확인할 수 없습니다.");
    }
  };

  const reset = () => {
    setOrders(null);
    setMessage("");
  };

  const cancelOrder = (orderId: string) => {
    if (!window.confirm("진행 중인 공동구매 참여를 취소하시겠습니까? 결제 금액은 전액 환불 처리됩니다.")) return;
    const updatedOrders = (orders ?? []).map((order) => (
      order.id === orderId ? { ...order, state: "주문 취소 · 전액 환불 예정" } : order
    ));
    setOrders(updatedOrders);
    try {
      const savedOrders = JSON.parse(localStorage.getItem("dropdeal_guest_orders") ?? "[]") as GuestOrder[];
      localStorage.setItem("dropdeal_guest_orders", JSON.stringify(savedOrders.map((order) => (
        order.id === orderId ? { ...order, state: "주문 취소 · 전액 환불 예정" } : order
      ))));
    } catch {
      localStorage.setItem("dropdeal_guest_orders", JSON.stringify(updatedOrders));
    }
  };

  if (orders?.length) {
    return (
      <>
        <div className="section-head" style={{ marginBottom: 20 }}>
          <div>
            <span className="eyebrow">Verified guest orders</span>
            <h1 className="page-title">비회원 참여 내역</h1>
          </div>
          <button className="btn btn-soft" type="button" onClick={reset}>인증 정보 변경</button>
        </div>
        <div className="order-list">
          {orders.map((order) => {
            const cancellable = order.state === "공동구매 진행 중" || order.state === "신청 완료";
            return <div className="order" key={order.id}>
              <div>
                <span className="badge badge-live">{order.state}</span>
                <h3>{order.productName}</h3>
                <div className="order-data">
                  <div><span>주문 번호</span><b>{order.id}</b></div>
                  <div><span>결제 금액</span><b>{won(order.paid)}</b></div>
                </div>
              </div>
              <div className="order-actions">
                <button className="btn btn-soft">상세 보기</button>
                {cancellable && <button className="btn btn-primary" type="button" onClick={() => cancelOrder(order.id)}>공동구매 취소하기</button>}
              </div>
            </div>;
          })}
        </div>
      </>
    );
  }

  return (
    <div className="auth-page" style={{ minHeight: "auto", padding: "30px 0" }}>
      <section className="auth-card">
        <span className="eyebrow">Guest order verification</span>
        <h1>비회원 주문 조회</h1>
        <p className="page-lead">비회원 주문 시 입력한 이름과 휴대폰 번호를 인증한 후 참여 내역을 확인할 수 있습니다.</p>
        {message && <div className="auth-alert">{message}</div>}
        <form className="auth-form" onSubmit={verify}>
          <div className="form-group">
            <label htmlFor="guest-order-name">이름</label>
            <input className="field" id="guest-order-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="guest-order-phone">휴대폰 번호</label>
            <input className="field" id="guest-order-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="010-0000-0000" required />
          </div>
          <button className="btn btn-primary" type="submit">인증하고 주문 조회하기</button>
        </form>
      </section>
    </div>
  );
}
