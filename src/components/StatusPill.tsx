import { DriverStatus } from "@/lib/types";

export function StatusPill({ status, suspendedUntil }: { status: DriverStatus; suspendedUntil?: number | null }) {
  if (status === "suspended") {
    const days =
      suspendedUntil != null
        ? Math.max(0, Math.ceil((suspendedUntil - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-50 px-3 py-1 text-xs font-semibold text-danger-600">
        <span className="h-1.5 w-1.5 rounded-full bg-danger-600" />
        사용정지{days != null ? ` · D-${days}` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-50 px-3 py-1 text-xs font-semibold text-ok-600">
      <span className="h-1.5 w-1.5 rounded-full bg-ok-600" />
      정상
    </span>
  );
}
