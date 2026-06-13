import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropDeal | 모이면 가격이 내려갑니다",
  description: "참여자가 늘수록 모두의 가격이 내려가는 실시간 공동구매",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="footer">
          <div className="shell footer-inner">
            <div>
              <strong>DropDeal</strong>
              <p>모이면 가격이 내려갑니다.</p>
              <p className="footer-credit">
                © 2026 DropDeal. Created by{" "}
                <a href="https://github.com/Leeka99" target="_blank" rel="noreferrer">
                  Leeka99
                </a>
                .
              </p>
            </div>
            <div className="footer-links"><span>이용안내</span><span>환불정책</span><span>판매자센터</span></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
