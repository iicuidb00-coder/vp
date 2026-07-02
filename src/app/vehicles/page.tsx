"use client";

import { useEffect, useState } from "react";
import { listVehicles, listAllViolations } from "@/lib/firestore";
import { Vehicle, Violation } from "@/lib/types";
import { LinkCard } from "@/components/ui/Card";
import Link from "next/link";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [v, vi] = await Promise.all([listVehicles(), listAllViolations()]);
        setVehicles(v);
        setViolations(vi);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const countFor = (vehicleId: string) => violations.filter((v) => v.vehicleId === vehicleId).length;

  if (loading) return <p className="py-20 text-center text-sm text-ink/50">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-600">차량 목록</h1>
          <p className="mt-1 text-sm text-ink/50">차량을 선택하면 누적 위반 이력을 확인할 수 있습니다.</p>
        </div>
        <Link
          href="/vehicles/new"
          className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          + 차량 등록
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <p className="rounded-card border border-dashed border-line py-16 text-center text-sm text-ink/40">
          등록된 차량이 없습니다. Firestore에 vehicles 컬렉션 데이터를 추가해주세요.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {vehicles.map((v) => (
            <LinkCard key={v.id} href={`/vehicles/${v.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-bold text-ink">{v.name}</p>
                  <p className="text-xs text-ink/50">{v.plateNumber}{v.department ? ` · ${v.department}` : ""}</p>
                </div>
                <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-600">
                  누적 {countFor(v.id)}건
                </span>
              </div>
            </LinkCard>
          ))}
        </div>
      )}
    </div>
  );
}
