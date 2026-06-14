import Link from "next/link";
import { SellerNav } from "@/components/SellerNav";
import { settlementService } from "@/services/settlementService";
import { SettlementStatus } from "@/types/settlement";
import { won } from "@/utils/format";

const statusLabel: Record<SettlementStatus, string> = {
  PENDING: "집계 중",
  CALCULATED: "계산 완료",
  ON_HOLD: "정산 보류",
  READY: "지급 예정",
  REQUESTED: "지급 요청",
  PAID: "지급 완료",
  FAILED: "지급 실패",
  CANCELED: "정산 취소",
};

export default async function SellerSettlementsPage() {
  const settlements = await settlementService.getSettlements();
  const totals = settlements.reduce((sum, settlement) => ({
    gross: sum.gross + settlement.grossAmount,
    fee: sum.fee + settlement.platformFee,
    settlement: sum.settlement + settlement.settlementAmount,
  }), { gross:0, fee:0, settlement:0 });

  return (
    <div className="seller-shell">
      <SellerNav/>
      <div className="seller-content">
        <div className="section-head">
          <div><span className="eyebrow">Seller settlement</span><h1 className="page-title">정산 내역</h1><p className="page-lead">최종 판매금액에서 환불과 수수료를 반영한 지급 예정금액입니다.</p></div>
          <span className="badge badge-event">주 1회 정산</span>
        </div>
        <div className="settlement-stats">
          <div className="stat-card"><span>누적 최종 판매금액</span><strong>{won(totals.gross)}</strong><small>차액 환불 반영 후 기준</small></div>
          <div className="stat-card"><span>누적 플랫폼 수수료</span><strong>{won(totals.fee)}</strong><small>플랫폼 고정 수수료 10% 적용</small></div>
          <div className="stat-card stat-card-dark"><span>누적 판매자 정산금</span><strong>{won(totals.settlement)}</strong><small>PG 수수료 및 할인 분담금 차감</small></div>
        </div>
        <div className="notice settlement-notice">정산은 차액 환불, 배송 완료, 반품 가능 기간 종료 후 지급됩니다. 보류된 건은 상세 페이지에서 사유를 확인할 수 있습니다.</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>정산 기간</th><th>최종 판매금액</th><th>환불액</th><th>플랫폼 수수료</th><th>정산 예정금</th><th>상태</th><th>지급일</th><th>상세</th></tr></thead>
            <tbody>{settlements.map((settlement) => <tr key={settlement.id}>
              <td><b>{settlement.periodStart}</b><br/><span className="seller">~ {settlement.periodEnd}</span></td>
              <td>{won(settlement.grossAmount)}</td>
              <td className="discount">-{won(settlement.refundAmount)}</td>
              <td>{won(settlement.platformFee)}</td>
              <td><b>{won(settlement.settlementAmount)}</b></td>
              <td><span className={`settlement-badge status-${settlement.status.toLowerCase()}`}>{statusLabel[settlement.status]}</span></td>
              <td>{settlement.paidAt ?? settlement.scheduledAt ?? "-"}</td>
              <td><Link className="btn btn-soft" href={`/seller/settlements/${settlement.id}`}>내역 보기</Link></td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
