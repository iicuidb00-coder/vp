"use client";

import { useEffect, useState } from "react";
import { listDrivers, listAllViolations, resolveDriverStatus } from "@/lib/firestore";
import { Driver, Violation } from "@/lib/types";
import { LinkCard } from "@/components/ui/Card";
import { StatusPill } from "@/components/StatusPill";
import Link from "next/link";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d, v] = await Promise.all([listDrivers(), listAllViolations()]);
        setDrivers(d.map(resolveDriverStatus));
        setViolations(v);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const countFor = (driverId: string) => violations.filter((v) => v.driverId === driverId).length;

  if (loading) return <p className="py-20 text-center text-sm text-ink/50">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-600">운전자 목록</h1>
          <p className="mt-1 text-sm text-ink/50">운전자를 선택하면 개인 및 부서 위반 현황을 확인할 수 있습니다.</p>
        </div>
        <Link
          href="/drivers/new"
          className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          + 운전자 등록
        </Link>
      </div>

      {drivers.length === 0 ? (
        <p className="rounded-card border border-dashed border-line py-16 text-center text-sm text-ink/40">
          등록된 운전자가 없습니다. Firestore에 drivers 컬렉션 데이터를 추가해주세요.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {drivers.map((d) => (
            <LinkCard key={d.id} href={`/drivers/${d.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-bold text-ink">{d.name}</p>
                  <p className="text-xs text-ink/50">{d.department} · 누적 {countFor(d.id)}건</p>
                </div>
                <StatusPill status={d.status} suspendedUntil={d.suspendedUntil} />
              </div>
            </LinkCard>
          ))}
        </div>
      )}
    </div>
  );
}
