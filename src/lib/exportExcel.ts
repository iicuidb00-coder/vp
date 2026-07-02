import * as XLSX from "xlsx";
import { Violation } from "./types";
import { CATEGORY_LABEL, getDetailLabel } from "./penaltyRules";

export interface ExportRow {
  발생일시: string;
  발생장소: string;
  부서: string;
  운전자: string;
  차량: string;
  카테고리: string;
  세부항목: string;
  경고차수: number;
  벌칙결과: string;
  교육필요: string;
  교육이수: string;
  메모: string;
  등록자: string;
}

function formatDateTime(ms: number) {
  return new Date(ms).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function violationsToRows(
  violations: Violation[],
  vehicleNameOf: (id: string) => string,
  driverNameOf: (id: string) => string
): ExportRow[] {
  return violations
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((v) => ({
      발생일시: formatDateTime(v.createdAt),
      발생장소: v.location || "-",
      부서: v.department,
      운전자: driverNameOf(v.driverId),
      차량: vehicleNameOf(v.vehicleId),
      카테고리: CATEGORY_LABEL[v.category],
      세부항목: getDetailLabel(v.category, v.detailType),
      경고차수: v.warningCount,
      벌칙결과: v.penaltyResult,
      교육필요: v.educationRequired ? "필요" : "-",
      교육이수: v.educationRequired ? (v.educationDone ? "완료" : "미완료") : "-",
      메모: v.description || "-",
      등록자: v.reportedBy,
    }));
}

const COLUMN_WIDTHS = [17, 16, 12, 10, 14, 12, 26, 8, 32, 8, 8, 24, 10];

export function downloadViolationsExcel(rows: ExportRow[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = COLUMN_WIDTHS.map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "위반이력");
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
