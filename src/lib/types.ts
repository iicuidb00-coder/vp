export type ViolationCategory = "unreported" | "negligence" | "severe";

export type DriverStatus = "normal" | "suspended";

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  department?: string;
  createdAt: number;
}

export interface Driver {
  id: string;
  name: string;
  department: string;
  phone?: string;
  status: DriverStatus;
  suspendedUntil?: number | null;
  createdAt: number;
}

export interface Violation {
  id: string;
  vehicleId: string;
  driverId: string;
  department: string;
  category: ViolationCategory;
  detailType: string;
  description?: string;
  photoUrl?: string;
  warningCount: number;
  penaltyResult: string;
  educationRequired: boolean;
  educationDone: boolean;
  status: "active" | "resolved";
  reportedBy: string;
  createdAt: number;   // 사건 발생/등록 일시 (등록 시 직접 시·분까지 지정 가능, 미지정 시 등록 시각)
  location?: string;   // 사건 발생 장소 (선택)
}
