import Link from "next/link";
import { SellerNav } from "@/components/SellerNav";
import { settlementService } from "@/services/settlementService";
import { SettlementStatus } from "@/types/settlement";
import { won } from "@/utils/format";

const statusLabel: Record<SettlementStatus, string> = {
  PENDING: "집계 중", CALCULATED: "계산 완료", ON_HOLD: "정산 보류", READY: "지급 예정",
  REQUESTED: "지급 요청", PAID: "지급 완료", FAILED: "지급 실패", CANCELED: "정산 취소",
};

export default async function SellerSettlementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settlement = await settlementService.getSettlementById(Number(id));

  return (
    <div className="seller-shell">
      <SellerNav/>
      <div className="seller-content">
        <Link className="seller back-link" href="/seller/settlements">← 정산 내역으로</Link>
        <div className="section-head">
          <div><span className="eyebrow">Settlement detail</span><h1 className="page-title">{settlement.periodStart} ~ {settlement.periodEnd}</h1><p className="page-lead">정산 번호 DD-ST-{settlement.id}</p></div>
          <span className={`settlement-badge status-${settlement.status.toLowerCase()}`}>{statusLabel[settlement.status]}</span>
        </div>
        {settlement.holdReason && <div className="hold-notice"><b>정산 보류 사유</b><span>{settlement.holdReason}</span></div>}
        <div className="settlement-detail-grid">
          <section className="panel">
            <h3>정산 계산 내역</h3>
            <div className="settlement-line"><span>총 최종 판매금액</span><b>{won(settlement.grossAmount)}</b></div>
            <div className="settlement-line"><span>차액 및 주문 환불액</span><b className="discount">-{won(settlement.refundAmount)}</b></div>
            <div className="settlement-line"><span>플랫폼 중개수수료</span><b>-{won(settlement.platformFee)}</b></div>
            <div className="settlement-line"><span>PG 수수료</span><b>-{won(settlement.pgFee)}</b></div>
            <div className="settlement-line"><span>판매자 할인 분담금</span><b>-{won(settlement.sellerDiscountShare)}</b></div>
            <div className="settlement-line"><span>추가 비용</span><b>-{won(settlement.additionalFee)}</b></div>
            <div className="settlement-line settlement-line-total"><span>최종 정산금</span><strong>{won(settlement.settlementAmount)}</strong></div>
          </section>
          <aside className="panel">
            <h3>지급 정보</h3>
            <div className="qa"><span className="seller">정산 상태</span><p><b>{statusLabel[settlement.status]}</b></p></div>
            <div className="qa"><span className="seller">지급 예정·완료일</span><p><b>{settlement.paidAt ?? settlement.scheduledAt ?? "확정 전"}</b></p></div>
            <div className="qa"><span className="seller">정산 계좌</span><p><b>신한은행 110-***-482910</b></p></div>
            <div className="notice">실제 지급금은 PG 파트너 정산 서비스의 최종 처리 결과를 기준으로 확정됩니다.</div>
          </aside>
        </div>
        <div className="section-head order-breakdown-head"><div><span className="eyebrow">Order breakdown</span><h2>주문별 계산 내역</h2></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>주문 번호</th><th>상품</th><th>최종 판매금액</th><th>환불액</th><th>플랫폼 수수료</th><th>PG 수수료</th><th>할인 분담금</th><th>정산금</th></tr></thead>
            <tbody>{settlement.orders.map((order) => <tr key={order.id}>
              <td><b>{order.id}</b></td><td>{order.productName}</td><td>{won(order.finalAmount)}</td><td className="discount">-{won(order.refundAmount)}</td><td>{won(order.platformFee)}</td><td>{won(order.pgFee)}</td><td>{won(order.sellerDiscountShare)}</td><td><b>{won(order.settlementAmount)}</b></td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
