"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVehicle } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100";

export default function NewVehiclePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plateNumber) return;
    setSubmitting(true);
    setError(null);
    try {
      await createVehicle({ name, plateNumber, department: department || undefined });
      router.push("/vehicles");
    } catch (err: any) {
      setError(err?.message ?? "등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-600">차량 등록</h1>
        <p className="mt-1 text-sm text-ink/50">새 교회차량을 등록합니다.</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">차량 이름</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 그레이스카니발"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">차량 번호</label>
            <input
              className={inputClass}
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="예: 12가 3456"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">소속 부서 (선택)</label>
            <input
              className={inputClass}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="예: 광복부"
            />
          </div>

          {error && <p className="text-sm text-danger-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-navy-600 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "차량 등록"}
          </button>
        </form>
      </Card>
    </div>
  );
}
