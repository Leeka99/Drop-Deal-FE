import Link from "next/link";
import { SellerNav } from "@/components/SellerNav";
import { products } from "@/mocks/products";
import { calculateSettlement, platformCommissionRate } from "@/utils/settlement";
import { won } from "@/utils/format";

const sales = products.slice(0, 6).map((product, index) => {
  const grossAmount = product.currentPrice * product.currentParticipants;
  const commissionRate = product.type === "FREE_GIVEAWAY" ? 0 : platformCommissionRate(grossAmount);
  const settlement = calculateSettlement(grossAmount, commissionRate);
  const recentOrders = Math.max(1, Math.round(product.currentParticipants * 0.62));

  return {
    id: `SA-${String(260601 + index)}`,
    product,
    grossAmount,
    commissionRate,
    settlement,
    recentOrders,
    channel: product.type === "FREE_GIVEAWAY" ? "완전무료! 상품" : product.type === "CLEARANCE" ? "재고떨이" : "일반 공동구매",
  };
});

export default function SellerSalesPage() {
  const totalGross = sales.reduce((sum, item) => sum + item.grossAmount, 0);
  const totalCommission = sales.reduce((sum, item) => sum + item.settlement.platformFee, 0);
  const totalSettlement = sales.reduce((sum, item) => sum + item.settlement.settlementAmount, 0);

  return (
    <div className="seller-shell">
      <SellerNav />
      <div className="seller-content">
        <div className="section-head">
          <div>
            <span className="eyebrow">Seller sales</span>
            <h1 className="page-title">판매 내역</h1>
            <p className="page-lead">상품별 참여 현황과 예상 정산금을 한 번에 확인할 수 있습니다.</p>
          </div>
          <Link className="btn btn-primary" href="/seller/products">상품 관리로 이동</Link>
        </div>

        <div className="settlement-stats">
          <div className="stat-card"><span>총 판매금액</span><strong>{won(totalGross)}</strong><small>최근 등록 상품 기준</small></div>
          <div className="stat-card"><span>플랫폼 수수료</span><strong>{won(totalCommission)}</strong><small>적용 중개수수료율 반영</small></div>
          <div className="stat-card stat-card-dark"><span>예상 정산금</span><strong>{won(totalSettlement)}</strong><small>환불·수수료 차감 후 기준</small></div>
        </div>

        <div className="notice settlement-notice">
          판매자는 상품을 둘러볼 수 있지만 구매는 할 수 없습니다. 이 페이지는 판매 흐름, 참여 현황, 정산 상태를 보는 용도입니다.
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>판매 번호</th>
                <th>상품</th>
                <th>유형</th>
                <th>판매 금액</th>
                <th>수수료율</th>
                <th>예상 정산금</th>
                <th>참여 인원</th>
                <th>최근 주문</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((item) => (
                <tr key={item.id}>
                  <td><b>{item.id}</b></td>
                  <td>
                    <b>{item.product.name}</b>
                    <br />
                    <span className="seller">{item.product.sellerName}</span>
                  </td>
                  <td>{item.channel}</td>
                  <td>{won(item.grossAmount)}</td>
                  <td>{Math.round(item.commissionRate * 100)}%</td>
                  <td><b>{won(item.settlement.settlementAmount)}</b></td>
                  <td>{item.product.currentParticipants} / {item.product.maxParticipants}명</td>
                  <td>{item.recentOrders}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
