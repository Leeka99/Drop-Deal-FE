import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
import { MockProvider } from "@/components/MockProvider";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dropdealkr.com"),
  applicationName: "DropDeal",
  title: "DropDeal | 모이면 가격이 내려갑니다",
  description: "참여자가 늘수록 모두의 가격이 내려가는 실시간 공동구매",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DropDeal",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#514b4d",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <PwaRegister />
        <Header />
        <MockProvider><main>{children}</main></MockProvider>
        <footer className="footer">
          <div className="shell footer-inner">
            <div>
              <div className="footer-brand"><span className="footer-brand-mark"><Image src="/brand/mainlogo.png" alt="" fill sizes="42px"/></span><strong>DropDeal</strong></div>
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
