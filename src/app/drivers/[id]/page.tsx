"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getDriver,
  listViolationsByDriver,
  listViolationsByDepartment,
  listDriversByDepartment,
  listVehicles,
  resolveDriverStatus,
} from "@/lib/firestore";
import { Driver, Violation, ViolationCategory, Vehicle } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { ViolationList } from "@/components/ViolationList";
import { StatusPill } from "@/components/StatusPill";
import { CATEGORY_LABEL } from "@/lib/penaltyRules";
import { violationsToRows, downloadViolationsExcel } from "@/lib/exportExcel";

const TABS: (ViolationCategory | "all")[] = ["all", "unreported", "negligence", "severe"];

export default function DriverDetailPage() {
  const params = useParams<{ id: string }>();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [deptViolations, setDeptViolations] = useState<Violation[]>([]);
  const [deptDrivers, setDeptDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tab, setTab] = useState<ViolationCategory | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await getDriver(params.id);
        setDriver(d ? resolveDriverStatus(d) : null);
        if (d) {
          const [vi, deptVi, deptDr, veh] = await Promise.all([
            listViolationsByDriver(params.id),
            listViolationsByDepartment(d.department),
            listDriversByDepartment(d.department),
            listVehicles(),
          ]);
          setViolations(vi);
          setDeptViolations(deptVi);
          setDeptDrivers(deptDr.map(resolveDriverStatus));
          setVehicles(veh);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <p className="py-20 text-center text-sm text-ink/50">불러오는 중...</p>;
  if (!driver) return <p className="py-20 text-center text-sm text-ink/50">운전자를 찾을 수 없습니다.</p>;

  const filtered = tab === "all" ? violations : violations.filter((v) => v.category === tab);
  const deptCountFor = (id: string) => deptViolations.filter((v) => v.driverId === id).length;

  const vehicleNameOf = (id: string) => vehicles.find((v) => v.id === id)?.name ?? "알 수 없음";
  const deptDriverNameOf = (id: string) => deptDrivers.find((d) => d.id === id)?.name ?? "알 수 없음";

  const onExportPersonal = () => {
    const rows = violationsToRows(violations, vehicleNameOf, () => driver.name);
    downloadViolationsExcel(rows, `${driver.name}_위반이력`);
  };

  const onExportDepartment = () => {
    const rows = violationsToRows(deptViolations, vehicleNameOf, deptDriverNameOf);
    downloadViolationsExcel(rows, `${driver.department}_부서위반이력`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-600">{driver.name}</h1>
          <p className="mt-1 text-sm text-ink/50">{driver.department}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={driver.status} suspendedUntil={driver.suspendedUntil} />
          <Link
            href={`/drivers/${driver.id}/edit`}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-navy-400 hover:text-navy-600"
          >
            수정
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
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
          <button
            onClick={onExportPersonal}
            disabled={violations.length === 0}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-navy-400 hover:text-navy-600 disabled:opacity-40"
          >
            엑셀 다운로드
          </button>
        </div>
        <ViolationList violations={filtered} />
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">같은 부서({driver.department}) 위반 현황</h2>
          <button
            onClick={onExportDepartment}
            disabled={deptViolations.length === 0}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-navy-400 hover:text-navy-600 disabled:opacity-40"
          >
            부서 전체 엑셀 다운로드
          </button>
        </div>
        <ul className="divide-y divide-line">
          {deptDrivers.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-3 text-sm">
              <Link
                href={`/drivers/${d.id}`}
                className={`font-medium hover:text-navy-600 ${d.id === driver.id ? "text-navy-600" : "text-ink"}`}
              >
                {d.name}{d.id === driver.id ? " (본인)" : ""}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink/50">누적 {deptCountFor(d.id)}건</span>
                <StatusPill status={d.status} suspendedUntil={d.suspendedUntil} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
