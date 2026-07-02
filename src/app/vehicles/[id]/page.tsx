"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getVehicle, listViolationsByVehicle, listDrivers } from "@/lib/firestore";
import { Vehicle, Violation, ViolationCategory, Driver } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { ViolationList } from "@/components/ViolationList";
import { CATEGORY_LABEL } from "@/lib/penaltyRules";
import { violationsToRows, downloadViolationsExcel } from "@/lib/exportExcel";

const TABS: (ViolationCategory | "all")[] = ["all", "unreported", "negligence", "severe"];

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tab, setTab] = useState<ViolationCategory | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [v, vi, d] = await Promise.all([
          getVehicle(params.id),
          listViolationsByVehicle(params.id),
          listDrivers(),
        ]);
        setVehicle(v);
        setViolations(vi);
        setDrivers(d);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <p className="py-20 text-center text-sm text-ink/50">불러오는 중...</p>;
  if (!vehicle) return <p className="py-20 text-center text-sm text-ink/50">차량을 찾을 수 없습니다.</p>;

  const filtered = tab === "all" ? violations : violations.filter((v) => v.category === tab);

  const driverNameOf = (id: string) => drivers.find((d) => d.id === id)?.name ?? "알 수 없음";

  const onExport = () => {
    const rows = violationsToRows(violations, () => vehicle.name, driverNameOf);
    downloadViolationsExcel(rows, `${vehicle.name}_위반이력`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-600">{vehicle.name}</h1>
          <p className="mt-1 text-sm text-ink/50">{vehicle.plateNumber}{vehicle.department ? ` · ${vehicle.department}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            disabled={violations.length === 0}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-navy-400 hover:text-navy-600 disabled:opacity-40"
          >
            엑셀 다운로드
          </button>
          <Link
            href={`/vehicles/${vehicle.id}/edit`}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-navy-400 hover:text-navy-600"
          >
            수정
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                tab === t ? "bg-navy-600 text-white" : "bg-navy-50 text-navy-600 hover:bg-navy-100"
              }`}
            >
              {t === "all" ? `전체 (${violations.length})` : CATEGORY_LABEL[t]}
            </button>
          ))}
        </div>
        <ViolationList violations={filtered} />
      </Card>
    </div>
  );
}
