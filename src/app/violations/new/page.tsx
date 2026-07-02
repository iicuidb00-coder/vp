"use client";

import { useEffect, useMemo, useState } from "react";
import { listVehicles, listDrivers, registerViolation } from "@/lib/firestore";
import { Vehicle, Driver, ViolationCategory } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { CATEGORY_LABEL, DETAIL_OPTIONS } from "@/lib/penaltyRules";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100";

export default function NewViolationPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [category, setCategory] = useState<ViolationCategory>("unreported");
  const [detailType, setDetailType] = useState(DETAIL_OPTIONS.unreported[0]?.value ?? "");
  const [description, setDescription] = useState("");
  const [reportedBy, setReportedBy] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [v, d] = await Promise.all([listVehicles(), listDrivers()]);
        setVehicles(v);
        setDrivers(d);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const vehicleOptions = useMemo(
    () => vehicles.map((v) => ({ value: v.id, label: v.name, sublabel: v.plateNumber })),
    [vehicles]
  );
  const driverOptions = useMemo(
    () => drivers.map((d) => ({ value: d.id, label: d.name, sublabel: d.department })),
    [drivers]
  );

  const detailOptions = DETAIL_OPTIONS[category];

  const onCategoryChange = (c: ViolationCategory) => {
    setCategory(c);
    setDetailType(DETAIL_OPTIONS[c][0]?.value ?? "");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !driverId || !detailType || !reportedBy) return;
    setSubmitting(true);
    setResult(null);
    try {
      const driver = drivers.find((d) => d.id === driverId)!;
      const res = await registerViolation({
        vehicleId,
        driverId,
        department: driver.department,
        category,
        detailType,
        description,
        reportedBy,
      });
      setResult(res.penaltyResult);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="py-20 text-center text-sm text-ink/50">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-600">위반 등록</h1>
        <p className="mt-1 text-sm text-ink/50">등록 즉시 누적 경고 수와 정지 여부가 자동으로 계산됩니다.</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/60">차량</label>
              <Combobox
                options={vehicleOptions}
                value={vehicleId}
                onChange={setVehicleId}
                placeholder="차량 선택 또는 검색"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/60">운전자</label>
              <Combobox
                options={driverOptions}
                value={driverId}
                onChange={setDriverId}
                placeholder="운전자 선택 또는 검색"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABEL) as ViolationCategory[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => onCategoryChange(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    category === c ? "bg-navy-600 text-white" : "bg-navy-50 text-navy-600 hover:bg-navy-100"
                  }`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">세부 항목</label>
            <select className={inputClass} value={detailType} onChange={(e) => setDetailType(e.target.value)} required>
              {detailOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">메모 (선택)</label>
            <textarea
              className={inputClass}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 경위를 입력하세요"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">등록자</label>
            <input
              className={inputClass}
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              placeholder="관리자 이름"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !vehicleId || !driverId}
            className="w-full rounded-lg bg-navy-600 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "위반 등록"}
          </button>

          {result && (
            <div className="rounded-lg bg-amber-100 px-4 py-3 text-sm font-medium text-amber-600">
              등록 완료 — {result}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
