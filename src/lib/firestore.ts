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
export async function listViolationsByVehicle(vehicleId: string): Promise<Violation[]> {
  const snap = await getDocs(
    query(collection(db, "violations"), where("vehicleId", "==", vehicleId), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
}

export async function listViolationsByDriver(driverId: string): Promise<Violation[]> {
  const snap = await getDocs(
    query(collection(db, "violations"), where("driverId", "==", driverId), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
}

export async function listViolationsByDepartment(department: string): Promise<Violation[]> {
  const snap = await getDocs(
    query(collection(db, "violations"), where("department", "==", department), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
}

export async function listAllViolations(): Promise<Violation[]> {
  const snap = await getDocs(query(collection(db, "violations"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: toMillis(d.data().createdAt) }));
}

export async function deleteViolation(id: string) {
  return deleteDoc(doc(db, "violations", id));
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
    createdAt: serverTimestamp(),
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
