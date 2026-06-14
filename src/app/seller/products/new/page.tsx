"use client";

import { FormEvent, useMemo, useState } from "react";
import { SellerNav } from "@/components/SellerNav";
import { clearanceReasons, PLATFORM_COMMISSION_RATE, productTypePolicy } from "@/constants/productPolicy";
import { ProductType } from "@/types/product";
import { won } from "@/utils/format";
import { calculateSettlement } from "@/utils/settlement";

export default function NewSellerProductPage() {
  const [type, setType] = useState<ProductType>("NORMAL");
  const [values, setValues] = useState({ original:30000, start:27000, min:18000, stepPeople:5, stepAmount:1000, maxPeople:50 });
  const [saved, setSaved] = useState(false);
  const policy = productTypePolicy[type];
  const commissionPercent = PLATFORM_COMMISSION_RATE * 100;
  const steps = useMemo(() => Array.from(
    { length:Math.min(7, Math.ceil(values.maxPeople / values.stepPeople)) },
    (_, index) => ({ people:index * values.stepPeople, price:Math.max(values.min, values.start - index * values.stepAmount) }),
  ), [values]);
  const estimate = useMemo(() => {
    const grossAmount = values.min * values.maxPeople;
    return { grossAmount, ...calculateSettlement(grossAmount, PLATFORM_COMMISSION_RATE) };
  }, [values]);
  const number = (key:keyof typeof values) => (event:React.ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [key]:Number(event.target.value) });
  const submit = (event:FormEvent) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="seller-shell">
      <SellerNav/>
      <div className="seller-content">
        <span className="eyebrow">Create group deal</span>
        <h1 className="page-title">새 공동구매 등록</h1>
        <p className="page-lead">상품 유형별 등록 기준을 확인하면 고정 수수료를 반영한 예상 정산금을 계산합니다.</p>

        <section className="type-policy-guide">
          {(Object.entries(productTypePolicy) as [ProductType, typeof policy][]).map(([policyType, item]) => (
            <button type="button" className={`type-policy-card ${type === policyType ? "active" : ""}`} key={policyType} onClick={() => setType(policyType)}>
              <span className="type-policy-check">{type === policyType ? "선택됨" : "선택"}</span>
              <strong>{item.label}</strong>
              <p>{item.summary}</p>
              <ul>{item.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul>
            </button>
          ))}
        </section>

        <form onSubmit={submit} className="content-grid" style={{ marginTop:28, alignItems:"start" }}>
          <div className="panel">
            <div className="selected-policy">
              <div><span className="eyebrow">Selected product type</span><h3>{policy.label}</h3><p>{policy.summary}</p></div>
              <span className="fixed-fee">플랫폼 고정 수수료 <b>{commissionPercent}%</b></span>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label>상품명</label><input className="field" placeholder="상품명을 입력하세요" required/></div>
              <div className="form-group full"><label>상품 설명</label><textarea className="field" placeholder="상품과 공동구매를 소개해주세요."/></div>
              <div className="form-group"><label>상품 타입</label><input className="field readonly-field" value={policy.label} readOnly/></div>
              <div className="form-group"><label>판매자명</label><input className="field" defaultValue="DropDeal 파트너"/></div>
              {type === "CLEARANCE" && <>
                <div className="form-group"><label>재고떨이 사유</label><select className="field" required defaultValue=""><option value="" disabled>소진 사유를 선택하세요</option>{clearanceReasons.map((reason) => <option key={reason}>{reason}</option>)}</select></div>
                <div className="form-group"><label>고지 대상 상태</label><input className="field" placeholder="예: 유통기한 2026.08.30까지" required/></div>
                <div className="form-group full policy-confirm"><label><input type="checkbox" required/> 재고 소진 사유와 상품 상태를 구매자에게 명확히 고지했음을 확인합니다.</label></div>
              </>}
              <div className="form-group"><label>정가</label><input className="field" type="number" value={values.original} onChange={number("original")}/></div>
              <div className="form-group"><label>공동구매 시작가</label><input className="field" type="number" value={values.start} onChange={number("start")}/></div>
              <div className="form-group"><label>최저 판매가</label><input className="field" type="number" value={values.min} onChange={number("min")}/></div>
              <div className="form-group"><label>최대 참여 인원</label><input className="field" type="number" value={values.maxPeople} onChange={number("maxPeople")}/></div>
              <div className="form-group"><label>몇 명마다 가격 하락</label><input className="field" type="number" value={values.stepPeople} onChange={number("stepPeople")}/></div>
              <div className="form-group"><label>단계당 할인 금액</label><input className="field" type="number" value={values.stepAmount} onChange={number("stepAmount")}/></div>
              <div className="form-group"><label>총 재고 수량</label><input className="field" type="number" defaultValue="50"/></div>
              <div className="form-group"><label>최소 참여 인원</label><input className="field" type="number" defaultValue="15"/></div>
              <div className="form-group full"><label>적용 중개수수료율</label><div className="fixed-fee-field"><b>{commissionPercent}%</b><span>모든 상품에 동일하게 적용되는 플랫폼 고정 수수료입니다.</span></div></div>
              {type === "CLEARANCE" && <div className="form-group full"><label><input type="checkbox"/> 재고떨이 랜덤 50% 쿠폰 이벤트 사용</label></div>}
            </div>
            <button className="btn btn-primary" style={{ marginTop:20, width:"100%" }}>{saved ? "Mock 상품 등록 완료" : "공동구매 등록하기"}</button>
          </div>

          <aside className="policy-preview">
            <span className="eyebrow" style={{ color:"var(--lime)" }}>Price policy preview</span>
            <h3>가격 단계 미리보기</h3>
            {steps.map((step) => <div className="policy-step" key={step.people}><span>{step.people}명 참여</span><b>{won(step.price)}</b></div>)}
            <div className="policy-step"><span>최저 판매가</span><b style={{ color:"var(--lime)" }}>{won(values.min)}</b></div>
            <div className="estimate-box">
              <span className="eyebrow" style={{ color:"var(--lime)" }}>Settlement preview</span>
              <h3>예상 정산금</h3>
              <div className="policy-step"><span>예상 최종 판매금액</span><b>{won(estimate.grossAmount)}</b></div>
              <div className="policy-step"><span>플랫폼 고정 수수료 ({commissionPercent}%)</span><b>-{won(estimate.platformFee)}</b></div>
              <div className="policy-step"><span>예상 PG 수수료 (3%)</span><b>-{won(estimate.pgFee)}</b></div>
              <div className="policy-step estimate-total"><span>예상 판매자 정산금</span><b>{won(estimate.settlementAmount)}</b></div>
              <p>실제 정산금은 공동구매 종료, 환불, 배송, 할인 분담금에 따라 달라질 수 있습니다.</p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
