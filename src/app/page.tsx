"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listAllViolations, listDrivers, resolveDriverStatus } from "@/lib/firestore";
import { Driver, Violation } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusPill } from "@/components/StatusPill";
import { CATEGORY_LABEL } from "@/lib/penaltyRules";

export default function DashboardPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [v, d] = await Promise.all([listAllViolations(), listDrivers()]);
        setViolations(v);
        setDrivers(d.map(resolveDriverStatus));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const suspended = drivers.filter((d) => d.status === "suspended");

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return violations.filter((v) => {
      const d = new Date(v.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [violations]);

  const byCategory = useMemo(() => {
    const now = new Date();
    const thisMonth = violations.filter((v) => {
      const d = new Date(v.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    return {
      unreported: thisMonth.filter((v) => v.category === "unreported").length,
      negligence: thisMonth.filter((v) => v.category === "negligence").length,
      severe: thisMonth.filter((v) => v.category === "severe").length,
    };
  }, [violations]);

  const departmentRanking = useMemo(() => {
    const map = new Map<string, number>();
    violations.forEach((v) => map.set(v.department, (map.get(v.department) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [violations]);

  const recent = violations.slice(0, 8);

  if (loading) {
    return <p className="py-20 text-center text-sm text-ink/50">불러오는 중...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-600">대시보드</h1>
        <p className="mt-1 text-sm text-ink/50">교회차량 운전자 벌칙 현황을 한눈에 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium text-ink/50">이번 달 위반 건수</p>
          <p className="mt-2 text-3xl font-bold text-navy-600">{thisMonthCount}</p>
          <div className="mt-3 space-y-1 text-xs text-ink/60">
            <p>{CATEGORY_LABEL.unreported}: {byCategory.unreported}건</p>
            <p>{CATEGORY_LABEL.negligence}: {byCategory.negligence}건</p>
            <p>{CATEGORY_LABEL.severe}: {byCategory.severe}건</p>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium text-ink/50">현재 사용정지 중</p>
          <p className="mt-2 text-3xl font-bold text-danger-600">{suspended.length}명</p>
          <p className="mt-3 text-xs text-ink/60">전체 운전자 {drivers.length}명 중</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-ink/50">부서(지파)별 위반 랭킹</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {departmentRanking.length === 0 && <li className="text-ink/40">데이터 없음</li>}
            {departmentRanking.map(([dept, count], i) => (
              <li key={dept} className="flex items-center justify-between">
                <span className="text-ink/70">{i + 1}. {dept}</span>
                <span className="font-semibold text-navy-600">{count}건</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">사용정지 중인 운전자</h2>
          <Link href="/drivers" className="text-xs font-medium text-navy-600 hover:underline">전체 보기</Link>
        </div>
        {suspended.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink/40">현재 정지 중인 운전자가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {suspended.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <Link href={`/drivers/${d.id}`} className="text-sm font-medium text-ink hover:text-navy-600">
                  {d.name} <span className="text-ink/40">· {d.department}</span>
                </Link>
                <StatusPill status={d.status} suspendedUntil={d.suspendedUntil} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-ink">최근 등록된 위반</h2>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink/40">등록된 위반이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3">
                  <CategoryBadge category={v.category} />
                  <span className="text-ink/70">{v.detailType}</span>
                </div>
                <span className="text-xs text-ink/40">{new Date(v.createdAt).toLocaleDateString("ko-KR")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
