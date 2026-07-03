"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDriver, updateDriver, deleteDriver, liftSuspension } from "@/lib/firestore";
import { Driver } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/StatusPill";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100";

export default function EditDriverPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const d = await getDriver(params.id);
    setDriver(d);
    if (d) {
      setName(d.name);
      setPosition(d.position ?? "");
      setDepartment(d.department);
      setPhone(d.phone ?? "");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateDriver(params.id, { name, position: position || undefined, department, phone: phone || undefined });
      router.push(`/drivers/${params.id}`);
    } catch (err: any) {
      setError(err?.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("이 운전자를 삭제할까요? 기존 위반 이력은 삭제되지 않고 남아있습니다.")) return;
    setSubmitting(true);
    try {
      await deleteDriver(params.id);
      router.push("/drivers");
    } finally {
      setSubmitting(false);
    }
  };

  const onLiftSuspension = async () => {
    if (!confirm("사용정지를 즉시 해제할까요?")) return;
    setSubmitting(true);
    try {
      await liftSuspension(params.id);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="py-20 text-center text-sm text-ink/50">불러오는 중...</p>;
  if (!driver) return <p className="py-20 text-center text-sm text-ink/50">운전자를 찾을 수 없습니다.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-600">운전자 정보 수정</h1>
          <p className="mt-1 text-sm text-ink/50">{driver.name}</p>
        </div>
        <StatusPill status={driver.status} suspendedUntil={driver.suspendedUntil} />
      </div>

      {driver.status === "suspended" && (
        <Card className="border-danger-400 bg-danger-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-danger-600">현재 사용정지 상태입니다.</p>
            <button
              type="button"
              onClick={onLiftSuspension}
              disabled={submitting}
              className="rounded-lg bg-danger-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-danger-600/90 disabled:opacity-50"
            >
              정지 즉시 해제
            </button>
          </div>
        </Card>
      )}

      <Card>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/60">이름</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/60">
                직책 <span className="font-normal text-ink/40">(선택)</span>
              </label>
              <input className={inputClass} value={position} onChange={(e) => setPosition(e.target.value)} placeholder="예: 부장, 총무" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">소속 부서(지파)</label>
            <input className={inputClass} value={department} onChange={(e) => setDepartment(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">연락처 (선택)</label>
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
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
