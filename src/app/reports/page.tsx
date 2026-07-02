"use client";

import { useEffect, useMemo, useState } from "react";
import { listVehicles, listDrivers, listAllViolations } from "@/lib/firestore";
import { Vehicle, Driver, Violation } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { violationsToRows, downloadViolationsExcel } from "@/lib/exportExcel";

const selectClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100";

type Mode = "department" | "driver" | "vehicle";

export default function ReportsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<Mode>("department");
  const [department, setDepartment] = useState("");
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [v, d, vi] = await Promise.all([listVehicles(), listDrivers(), listAllViolations()]);
        setVehicles(v);
        setDrivers(d);
        setViolations(vi);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const departments = useMemo(() => Array.from(new Set(drivers.map((d) => d.department))).sort(), [drivers]);

  const vehicleNameOf = (id: string) => vehicles.find((v) => v.id === id)?.name ?? "알 수 없음";
  const driverNameOf = (id: string) => drivers.find((d) => d.id === id)?.name ?? "알 수 없음";

  const targetViolations = useMemo(() => {
    if (mode === "department") return department ? violations.filter((v) => v.department === department) : [];
    if (mode === "driver") return driverId ? violations.filter((v) => v.driverId === driverId) : [];
    if (mode === "vehicle") return vehicleId ? violations.filter((v) => v.vehicleId === vehicleId) : [];
    return [];
  }, [mode, department, driverId, vehicleId, violations]);

  const filenameLabel =
    mode === "department" ? department : mode === "driver" ? driverNameOf(driverId) : vehicleNameOf(vehicleId);

  const onExport = () => {
    if (targetViolations.length === 0) return;
    const rows = violationsToRows(targetViolations, vehicleNameOf, driverNameOf);
    const suffix = mode === "department" ? "부서" : mode === "driver" ? "운전자" : "차량";
    downloadViolationsExcel(rows, `${filenameLabel}_${suffix}_위반이력`);
  };

  const onExportAll = () => {
    if (violations.length === 0) return;
    const rows = violationsToRows(violations, vehicleNameOf, driverNameOf);
    downloadViolationsExcel(rows, "전체_위반이력");
  };

  if (loading) return <p className="py-20 text-center text-sm text-ink/50">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-600">엑셀 리포트</h1>
          <p className="mt-1 text-sm text-ink/50">부서별 · 운전자별 · 차량별로 위반 이력을 엑셀로 내보냅니다.</p>
        </div>
        <button
          onClick={onExportAll}
          disabled={violations.length === 0}
          className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-40"
        >
          전체 내보내기
        </button>
      </div>

      <Card>
        <div className="mb-5 flex flex-wrap gap-2">
          {(["department", "driver", "vehicle"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                mode === m ? "bg-navy-600 text-white" : "bg-navy-50 text-navy-600 hover:bg-navy-100"
              }`}
            >
              {m === "department" ? "부서별" : m === "driver" ? "운전자별" : "차량별"}
            </button>
          ))}
        </div>

        {mode === "department" && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">부서(지파) 선택</label>
            <select className={selectClass} value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">선택하세요</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        {mode === "driver" && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">운전자 선택</label>
            <select className={selectClass} value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="">선택하세요</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
              ))}
            </select>
          </div>
        )}

        {mode === "vehicle" && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">차량 선택</label>
            <select className={selectClass} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">선택하세요</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between rounded-lg bg-navy-50 px-4 py-3">
          <p className="text-sm text-ink/70">대상 위반 건수: <span className="font-semibold text-navy-600">{targetViolations.length}건</span></p>
          <button
            onClick={onExport}
            disabled={targetViolations.length === 0}
            className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-40"
          >
            엑셀 다운로드
          </button>
        </div>
      </Card>
    </div>
  );
}
