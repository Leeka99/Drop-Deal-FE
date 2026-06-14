import Image from "next/image";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="status-page">
      <div className="status-card offline-card">
        <Image src="/icons/icon-192.png" alt="DropDeal 캐릭터" width={96} height={96}/>
        <span className="eyebrow">Offline</span>
        <h1>인터넷 연결을 확인해주세요.</h1>
        <p className="page-lead">연결이 복구되면 진행 중인 공동구매 가격과 참여 현황을 다시 확인할 수 있습니다.</p>
        <Link className="btn btn-primary" href="/">홈으로 돌아가기</Link>
      </div>
    </div>
  );
}
