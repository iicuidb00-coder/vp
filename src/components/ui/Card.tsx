import Link from "next/link";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-line bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function LinkCard({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-card border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-navy-400 hover:shadow-md ${className}`}
    >
      {children}
    </Link>
  );
}
