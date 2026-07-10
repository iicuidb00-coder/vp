import { ViolationCategory } from "./types";

// 봉교부 교회차량 운전자 벌칙 규정 (원본 슬라이드 기준)
export const CATEGORY_LABEL: Record<ViolationCategory, string> = {
  unreported: "① 미보고 건",
  negligence: "② 부주의 건",
  severe: "③ 중대과실",
};

export const CATEGORY_COLOR: Record<ViolationCategory, string> = {
  unreported: "bg-amber-100 text-amber-600",
  negligence: "bg-navy-100 text-navy-600",
  severe: "bg-danger-50 text-danger-600",
};

export interface DetailOption {
  value: string;
  label: string;
  threshold: number; // 이 차수에 도달하면 정지
  needsEducation: boolean;
  needsBranchReport: boolean; // 지파보고 필요 여부
}

export const DETAIL_OPTIONS: Record<ViolationCategory, DetailOption[]> = {
  unreported: [
    { value: "no_fuel", label: "미주유", threshold: 3, needsEducation: false, needsBranchReport: false },
    { value: "no_hipass_charge", label: "하이패스 미충전", threshold: 3, needsEducation: false, needsBranchReport: false },
    { value: "unreported_extension", label: "사전 소통 없이 연장 사용", threshold: 3, needsEducation: false, needsBranchReport: false },
    { value: "unreported_use", label: "차량 미보고 사용", threshold: 3, needsEducation: false, needsBranchReport: false },
  ],
  negligence: [
    { value: "hipass_unpaid", label: "하이패스 미납", threshold: 2, needsEducation: true, needsBranchReport: false },
    { value: "fine", label: "벌칙금", threshold: 2, needsEducation: true, needsBranchReport: false },
    { value: "speeding", label: "과태료(과속)", threshold: 2, needsEducation: true, needsBranchReport: false },
    { value: "parking_complaint", label: "주차민원", threshold: 2, needsEducation: true, needsBranchReport: false },
    { value: "maintenance_issue", label: "차량관리건(경고,수리비)", threshold: 2, needsEducation: true, needsBranchReport: false },
    { value: "key_or_location", label: "키 개인소지 및 위치보고 안함", threshold: 2, needsEducation: true, needsBranchReport: false },
    { value: "accident_unreported", label: "차량 사고 및 파손 미보고", threshold: 2, needsEducation: true, needsBranchReport: true },
    { value: "item_loss_damage", label: "차량물품 분실 및 파손", threshold: 3, needsEducation: false, needsBranchReport: false },
    { value: "dirty_return", label: "정리정돈(위생) 불량 반납", threshold: 3, needsEducation: false, needsBranchReport: false },
  ],
  severe: [
    { value: "hit_and_run", label: "뺑소니", threshold: 1, needsEducation: false, needsBranchReport: true },
    { value: "major_fault_fine", label: "8대 중과실 범칙금 발생", threshold: 1, needsEducation: false, needsBranchReport: true },
    { value: "casualty", label: "인명사고 발생", threshold: 1, needsEducation: false, needsBranchReport: true },
  ],
};

export function getDetailOption(category: ViolationCategory, value: string): DetailOption | undefined {
  return DETAIL_OPTIONS[category].find((d) => d.value === value);
}

export function getDetailLabel(category: ViolationCategory, value: string): string {
  return getDetailOption(category, value)?.label ?? value;
}

/**
 * 카테고리 + 세부항목 + 현재까지의 누적 경고 수(등록 전 기준)를 받아
 * 이번 위반 등록으로 인한 결과(새 경고 차수, 정지 여부, 벌칙 문구)를 계산한다.
 */
export function calculatePenalty(
  category: ViolationCategory,
  detailValue: string,
  priorWarningCount: number
) {
  const detail = getDetailOption(category, detailValue);
  const newWarningCount = priorWarningCount + 1;

  if (category === "severe") {
    return {
      newWarningCount,
      suspends: true,
      educationRequired: false,
      penaltyResult: "중대과실 — 지파 논의 후 개인 및 부서 단위 벌칙 결정 필요",
    };
  }

  if (!detail) {
    return {
      newWarningCount,
      suspends: false,
      educationRequired: false,
      penaltyResult: "세부 항목을 확인해주세요",
    };
  }

  const suspends = newWarningCount >= detail.threshold;
  const parts: string[] = [];
  parts.push(`경고 ${newWarningCount}/${detail.threshold}회`);
  if (suspends) {
    parts.push("→ 교회차량 한 달간 사용 금지");
  }
  if (detail.needsEducation) parts.push("교육 1회 필요");
  if (detail.needsBranchReport) parts.push("지파보고 필요");

  return {
    newWarningCount,
    suspends,
    educationRequired: detail.needsEducation,
    penaltyResult: parts.join(" / "),
  };
}

export function addOneMonth(fromMs: number): number {
  const d = new Date(fromMs);
  d.setMonth(d.getMonth() + 1);
  return d.getTime();
}
