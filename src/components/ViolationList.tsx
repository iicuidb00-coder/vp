"use client";

import { Violation } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function ViolationList({ violations }: { violations: Violation[] }) {
  if (violations.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line py-12 text-center text-sm text-ink/50">
        등록된 위반 이력이 없습니다.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {violations.map((v) => (
        <li key={v.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CategoryBadge category={v.category} />
            <div>
              <p className="text-sm font-medium text-ink">{v.detailType}</p>
              <p className="text-xs text-ink/50">{formatDate(v.createdAt)} · 경고 {v.warningCount}회차</p>
            </div>
          </div>
          <div className="text-sm font-medium text-navy-600 sm:text-right">{v.penaltyResult}</div>
        </li>
      ))}
    </ul>
  );
}
