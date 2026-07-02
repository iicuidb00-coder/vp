"use client";

import { useState } from "react";
import { Violation } from "@/lib/types";
import { updateViolation, deleteViolation } from "@/lib/firestore";
import { CATEGORY_LABEL, getDetailLabel } from "@/lib/penaltyRules";

function toDateInputValue(ms: number) {
  const d = new Date(ms);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(ms - tzOffset).toISOString().slice(0, 10);
}

export function ViolationEditModal({
  violation,
  onClose,
  onSaved,
}: {
  violation: Violation;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(toDateInputValue(violation.createdAt));
  const [description, setDescription] = useState(violation.description ?? "");
  const [educationDone, setEducationDone] = useState(violation.educationDone);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      const newMillis = new Date(`${date}T00:00:00`).getTime();
      await updateViolation(violation.id, {
        createdAt: newMillis,
        description,
        educationDone,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("이 위반 기록을 삭제할까요? 이미 반영된 경고 차수/정지 상태는 자동으로 되돌아가지 않습니다.")) return;
    setSaving(true);
    try {
      await deleteViolation(violation.id);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-ink">위반 상세 · 수정</h3>
        <p className="mt-1 text-sm text-ink/50">
          {CATEGORY_LABEL[violation.category]} · {getDetailLabel(violation.category, violation.detailType)}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">위반 날짜</label>
            <input
              type="date"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">메모</label>
            <textarea
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {violation.educationRequired && (
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={educationDone}
                onChange={(e) => setEducationDone(e.target.checked)}
                className="h-4 w-4 rounded border-line text-navy-600 focus:ring-navy-400"
              />
              교육 이수 완료
            </label>
          )}

          <p className="rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-600">{violation.penaltyResult}</p>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 rounded-lg bg-navy-600 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
          <button
            onClick={onDelete}
            disabled={saving}
            className="rounded-lg border border-danger-400 px-4 py-2 text-sm font-semibold text-danger-600 transition hover:bg-danger-50 disabled:opacity-50"
          >
            삭제
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink/60 transition hover:bg-navy-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
