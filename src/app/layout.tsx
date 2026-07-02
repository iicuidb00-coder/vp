import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "봉교부 차량 벌칙 관리",
  description: "교회차량 운전자 벌칙제 관리 시스템",
};

const nav = [
  { href: "/", label: "대시보드" },
  { href: "/vehicles", label: "차량" },
  { href: "/drivers", label: "운전자" },
  { href: "/violations/new", label: "위반 등록" },
  { href: "/reports", label: "리포트" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-sm font-bold text-white">
                02
              </span>
              <span className="text-base font-bold text-navy-600">봉교부 · 운전자 벌칙제</span>
            </Link>
            <nav className="flex gap-1 text-sm font-medium">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-ink/70 transition hover:bg-navy-50 hover:text-navy-600"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
