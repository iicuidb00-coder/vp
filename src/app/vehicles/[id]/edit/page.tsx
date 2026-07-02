"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getVehicle, updateVehicle, deleteVehicle } from "@/lib/firestore";
import { Vehicle } from "@/lib/types";
import { Card } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100";

export default function EditVehiclePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [name, setName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const v = await getVehicle(params.id);
        setVehicle(v);
        if (v) {
          setName(v.name);
          setPlateNumber(v.plateNumber);
          setDepartment(v.department ?? "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plateNumber) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateVehicle(params.id, { name, plateNumber, department: department || undefined });
      router.push(`/vehicles/${params.id}`);
    } catch (err: any) {
      setError(err?.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("이 차량을 삭제할까요? 기존 위반 이력은 삭제되지 않고 남아있습니다.")) return;
    setSubmitting(true);
    try {
      await deleteVehicle(params.id);
      router.push("/vehicles");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="py-20 text-center text-sm text-ink/50">불러오는 중...</p>;
  if (!vehicle) return <p className="py-20 text-center text-sm text-ink/50">차량을 찾을 수 없습니다.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-600">차량 정보 수정</h1>
        <p className="mt-1 text-sm text-ink/50">{vehicle.name}</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">차량 이름</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">차량 번호</label>
            <input className={inputClass} value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">소속 부서 (선택)</label>
            <input className={inputClass} value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>

          {error && <p className="text-sm text-danger-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-navy-600 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
            >
              {submitting ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={submitting}
              className="rounded-lg border border-danger-400 px-5 py-2.5 text-sm font-semibold text-danger-600 transition hover:bg-danger-50 disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
