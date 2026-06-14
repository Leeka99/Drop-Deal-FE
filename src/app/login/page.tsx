import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; reason?: string }>;
}) {
  const query = await searchParams;

  return (
    <div className="auth-page">
      <section className="auth-card">
        <span className="eyebrow">DropDeal account</span>
        <h1>로그인</h1>
        <p className="page-lead">승인된 판매자 계정만 판매자센터에 접근할 수 있습니다.</p>
        {query.reason === "seller" && <div className="auth-alert">판매자센터는 승인된 판매자 계정으로 로그인해야 합니다.</div>}
        {query.error === "credentials" && <div className="auth-alert">이메일 또는 비밀번호를 확인해주세요.</div>}
        <form action={login} className="auth-form">
          <input type="hidden" name="next" value={query.next ?? "/"} />
          <div className="form-group"><label htmlFor="email">이메일</label><input className="field" id="email" name="email" type="email" required /></div>
          <div className="form-group"><label htmlFor="password">비밀번호</label><input className="field" id="password" name="password" type="password" required /></div>
          <button className="btn btn-primary" type="submit">로그인</button>
        </form>
        <div className="demo-accounts">
          <b>목업 로그인 계정</b>
          <span>구매자: buyer@dropdeal.kr / buyer123</span>
          <span>승인 판매자: seller@dropdeal.kr / seller123</span>
        </div>
      </section>
    </div>
  );
}
