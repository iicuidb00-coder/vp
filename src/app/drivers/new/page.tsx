"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDriver } from "@/lib/firestore";
import { Card } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100";

export default function NewDriverPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department) return;
    setSubmitting(true);
    setError(null);
    try {
      await createDriver({ name, department, phone: phone || undefined });
      router.push("/drivers");
    } catch (err: any) {
      setError(err?.message ?? "등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-600">운전자 등록</h1>
        <p className="mt-1 text-sm text-ink/50">새 운전자를 등록합니다. 등록 직후 상태는 자동으로 &apos;정상&apos;입니다.</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">이름</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">소속 부서(지파)</label>
            <input
              className={inputClass}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="예: 광복부"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">연락처 (선택)</label>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="예: 010-1234-5678"
            />
          </div>

          {error && <p className="text-sm text-danger-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-navy-600 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "운전자 등록"}
          </button>
        </form>
      </Card>
    </div>
  );
}
