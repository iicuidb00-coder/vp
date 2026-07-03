import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Driver, Vehicle, Violation, ViolationCategory } from "./types";
import { calculatePenalty, addOneMonth } from "./penaltyRules";

const toMillis = (v: any): number => {
  if (!v) return Date.now();
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return Date.now();
};

// ---------- Vehicles ----------
export async function listVehicles(): Promise<Vehicle[]> {
  const snap = await getDocs(query(collection(db, "vehicles"), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const snap = await getDoc(doc(db, "vehicles", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any), createdAt: toMillis(snap.data().createdAt) };
}

export async function createVehicle(input: Omit<Vehicle, "id" | "createdAt">) {
  return addDoc(collection(db, "vehicles"), { ...input, createdAt: serverTimestamp() });
}

export async function updateVehicle(id: string, input: Partial<Omit<Vehicle, "id" | "createdAt">>) {
  return updateDoc(doc(db, "vehicles", id), input);
}

export async function deleteVehicle(id: string) {
  return deleteDoc(doc(db, "vehicles", id));
}

// ---------- Drivers ----------
export async function listDrivers(): Promise<Driver[]> {
  const snap = await getDocs(query(collection(db, "drivers"), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
}

export async function getDriver(id: string): Promise<Driver | null> {
  const snap = await getDoc(doc(db, "drivers", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any), createdAt: toMillis(snap.data().createdAt) };
}

export async function listDriversByDepartment(department: string): Promise<Driver[]> {
  const snap = await getDocs(query(collection(db, "drivers"), where("department", "==", department)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
}

export async function createDriver(input: Omit<Driver, "id" | "createdAt" | "status" | "suspendedUntil">) {
  return addDoc(collection(db, "drivers"), {
    ...input,
    status: "normal",
    suspendedUntil: null,
    createdAt: serverTimestamp(),
  });
}

export async function updateDriver(id: string, input: Partial<Omit<Driver, "id" | "createdAt">>) {
  // 부서(지파)가 변경되면, 이미 등록된 위반 기록들에 저장된 department 값도 함께 갱신합니다.
  // (위반 기록에는 조회 편의를 위해 부서명을 복사해서 저장하고 있어서, 그대로 두면
  //  대시보드/리포트의 부서별 집계가 예전 부서 기준으로 남아있게 됩니다.)
  if (input.department) {
    const existing = await listViolationsByDriver(id);
    await Promise.all(
      existing
        .filter((v) => v.department !== input.department)
        .map((v) => updateDoc(doc(db, "violations", v.id), { department: input.department }))
    );
  }
  return updateDoc(doc(db, "drivers", id), input);
}

export async function deleteDriver(id: string) {
  return deleteDoc(doc(db, "drivers", id));
}

// 정지 상태를 관리자가 수동으로 즉시 해제
export async function liftSuspension(id: string) {
  return updateDoc(doc(db, "drivers", id), { status: "normal", suspendedUntil: null });
}

// 정지 해제일이 지난 운전자는 조회 시점에 자동으로 정상 복귀 처리
export function resolveDriverStatus(d: Driver): Driver {
  if (d.status === "suspended" && d.suspendedUntil && d.suspendedUntil <= Date.now()) {
    return { ...d, status: "normal", suspendedUntil: null };
  }
  return d;
}

// ---------- Violations ----------
// where + orderBy 조합은 Firestore 복합 인덱스가 필요하므로,
// Firestore에서는 where만 사용하고 정렬은 클라이언트에서 처리합니다.
function sortByCreatedAtDesc(list: Violation[]): Violation[] {
  return list.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function listViolationsByVehicle(vehicleId: string): Promise<Violation[]> {
  const snap = await getDocs(query(collection(db, "violations"), where("vehicleId", "==", vehicleId)));
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
  return sortByCreatedAtDesc(list);
}

export async function listViolationsByDriver(driverId: string): Promise<Violation[]> {
  const snap = await getDocs(query(collection(db, "violations"), where("driverId", "==", driverId)));
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
  return sortByCreatedAtDesc(list);
}

export async function listViolationsByDepartment(department: string): Promise<Violation[]> {
  const snap = await getDocs(query(collection(db, "violations"), where("department", "==", department)));
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
  return sortByCreatedAtDesc(list);
}

export async function listAllViolations(): Promise<Violation[]> {
  const snap = await getDocs(query(collection(db, "violations"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
}

export async function deleteViolation(id: string) {
  return deleteDoc(doc(db, "violations", id));
}

export async function updateViolation(id: string, input: Partial<Omit<Violation, "id">>) {
  return updateDoc(doc(db, "violations", id), input as any);
}
export async function registerViolation(input: {
  vehicleId: string;
  driverId: string;
  department: string;
  category: ViolationCategory;
  detailType: string;
  description?: string;
  photoUrl?: string;
  reportedBy: string;
  occurredAt?: number; // 지정하지 않으면 현재 시각(serverTimestamp)으로 기록
  location?: string;
}) {
  const prior = await listViolationsByDriver(input.driverId);
  const priorCount = prior.filter((v) => v.category === input.category).length;

  const result = calculatePenalty(input.category, input.detailType, priorCount);

  const violationDoc = await addDoc(collection(db, "violations"), {
    vehicleId: input.vehicleId,
    driverId: input.driverId,
    department: input.department,
    category: input.category,
    detailType: input.detailType,
    description: input.description || "",
    photoUrl: input.photoUrl || "",
    warningCount: result.newWarningCount,
    penaltyResult: result.penaltyResult,
    educationRequired: result.educationRequired,
    educationDone: false,
    status: "active",
    reportedBy: input.reportedBy,
    location: input.location || "",
    createdAt: input.occurredAt ?? serverTimestamp(),
  });

  if (result.suspends) {
    const suspendedUntil = addOneMonth(Date.now());
    await updateDoc(doc(db, "drivers", input.driverId), {
      status: "suspended",
      suspendedUntil,
    });
  }

  return { id: violationDoc.id, ...result };
}
