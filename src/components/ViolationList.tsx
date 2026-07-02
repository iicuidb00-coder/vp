"use client";

import { Violation } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";
import { getDetailLabel } from "@/lib/penaltyRules";

function formatDateTime(ms: number) {
  return new Date(ms).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ViolationList({
  violations,
  onSelect,
  extraInfo,
}: {
  violations: Violation[];
  onSelect?: (v: Violation) => void;
  /** 추가로 보여줄 컨텍스트 (예: 차량 상세에서는 운전자/부서, 운전자 상세에서는 차량) */
  extraInfo?: (v: Violation) => string;
}) {
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
        <li
          key={v.id}
          onClick={() => onSelect?.(v)}
          className={`flex flex-col gap-2 rounded-lg py-4 sm:flex-row sm:items-start sm:justify-between ${
            onSelect ? "cursor-pointer px-2 transition hover:bg-navy-50" : ""
          }`}
        >
          <div className="flex flex-wrap items-start gap-3">
            <CategoryBadge category={v.category} />
            <div>
              <p className="text-sm font-medium text-ink">{getDetailLabel(v.category, v.detailType)}</p>
              <p className="text-xs text-ink/50">{formatDateTime(v.createdAt)} · 경고 {v.warningCount}회차</p>
              {extraInfo && <p className="text-xs text-ink/50">{extraInfo(v)}</p>}
              {v.location && <p className="text-xs text-ink/40">장소: {v.location}</p>}
              {v.educationRequired && (
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    v.educationDone ? "bg-ok-50 text-ok-600" : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {v.educationDone ? "교육 완료" : "교육 미이수"}
                </span>
              )}
            </div>
          </div>
          <div className="text-sm font-medium text-navy-600 sm:text-right">{v.penaltyResult}</div>
        </li>
      ))}
    </ul>
  );
}
