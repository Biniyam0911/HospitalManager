import {
  users,
  patients,
  appointments,
  medicalRecords,
  beds,
  wards,
  admissions,
  inventoryItems,
  bills,
  billItems,
  dashboardStats,
  resourceUtilization,
  type User,
  type InsertUser,
  type Patient,
  type InsertPatient,
  type Appointment,
  type InsertAppointment,
  type MedicalRecord,
  type InsertMedicalRecord,
  type Bed,
  type InsertBed,
  type Ward,
  type InsertWard,
  type Admission,
  type InsertAdmission,
  type InventoryItem,
  type InsertInventoryItem,
  type Bill,
  type InsertBill,
  type BillItem,
  type InsertBillItem,
  type DashboardStat,
  type InsertDashboardStat,
  type ResourceUtilization,
  type InsertResourceUtilization,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Patients
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  getRecentPatients(limit: number): Promise<Patient[]>;
  
  // Appointments
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getTodayAppointments(): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  
  // Medical Records
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]>;
  
  // Beds
  getBed(id: number): Promise<Bed | undefined>;
  createBed(bed: InsertBed): Promise<Bed>;
  updateBed(id: number, bed: Partial<InsertBed>): Promise<Bed | undefined>;
  getAllBeds(): Promise<Bed[]>;
  getAvailableBeds(): Promise<Bed[]>;
  getBedsByWard(wardId: number): Promise<Bed[]>;
  
  // Wards
  getWard(id: number): Promise<Ward | undefined>;
  createWard(ward: InsertWard): Promise<Ward>;
  getAllWards(): Promise<Ward[]>;
  
  // Admissions
  getAdmission(id: number): Promise<Admission | undefined>;
  createAdmission(admission: InsertAdmission): Promise<Admission>;
  updateAdmission(id: number, admission: Partial<InsertAdmission>): Promise<Admission | undefined>;
  getActiveAdmissions(): Promise<Admission[]>;
  getAdmissionsByPatient(patientId: number): Promise<Admission[]>;
  
  // Inventory
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  getAllInventoryItems(): Promise<InventoryItem[]>;
  getLowStockItems(): Promise<InventoryItem[]>;
  
  // Billing
  getBill(id: number): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined>;
  getBillsByPatient(patientId: number): Promise<Bill[]>;
  getPendingBills(): Promise<Bill[]>;
  
  // Bill Items
  getBillItem(id: number): Promise<BillItem | undefined>;
  createBillItem(item: InsertBillItem): Promise<BillItem>;
  getBillItemsByBill(billId: number): Promise<BillItem[]>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<DashboardStat | undefined>;
  createOrUpdateDashboardStats(stats: InsertDashboardStat): Promise<DashboardStat>;
  
  // Resource Utilization
  getResourceUtilization(): Promise<ResourceUtilization | undefined>;
  createOrUpdateResourceUtilization(utilization: InsertResourceUtilization): Promise<ResourceUtilization>;
}

// Memory Storage Implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private appointments: Map<number, Appointment>;
  private medicalRecords: Map<number, MedicalRecord>;
  private beds: Map<number, Bed>;
  private wards: Map<number, Ward>;
  private admissions: Map<number, Admission>;
  private inventoryItems: Map<number, InventoryItem>;
  private bills: Map<number, Bill>;
  private billItems: Map<number, BillItem>;
  private dashboardStats: DashboardStat | undefined;
  private resourceUtil: ResourceUtilization | undefined;

  private currentIds: {
    users: number;
    patients: number;
    appointments: number;
    medicalRecords: number;
    beds: number;
    wards: number;
    admissions: number;
    inventoryItems: number;
    bills: number;
    billItems: number;
    dashboardStats: number;
    resourceUtil: number;
  };

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.medicalRecords = new Map();
    this.beds = new Map();
    this.wards = new Map();
    this.admissions = new Map();
    this.inventoryItems = new Map();
    this.bills = new Map();
    this.billItems = new Map();

    this.currentIds = {
      users: 1,
      patients: 1,
      appointments: 1,
      medicalRecords: 1,
      beds: 1,
      wards: 1,
      admissions: 1,
      inventoryItems: 1,
      bills: 1,
      billItems: 1,
      dashboardStats: 1,
      resourceUtil: 1,
    };

    // Initialize with sample data
    this.initializeData();
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Patients
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.patientId === patientId,
    );
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentIds.patients++;
    const createdAt = new Date();
    const patient: Patient = { ...insertPatient, id, createdAt };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, patientData: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = await this.getPatient(id);
    if (!patient) return undefined;

    const updatedPatient = { ...patient, ...patientData };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getRecentPatients(limit: number): Promise<Patient[]> {
    return Array.from(this.patients.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Appointments
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentIds.appointments++;
    const createdAt = new Date();
    const appointment: Appointment = { ...insertAppointment, id, createdAt };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = await this.getAppointment(id);
    if (!appointment) return undefined;

    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.doctorId === doctorId,
    );
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId,
    );
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.appointments.values()).filter(
      (appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= today && appointmentDate < tomorrow;
      },
    );
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  // Medical Records
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecords.get(id);
  }

  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.currentIds.medicalRecords++;
    const createdAt = new Date();
    const record: MedicalRecord = { ...insertRecord, id, createdAt };
    this.medicalRecords.set(id, record);
    return record;
  }

  async getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(
      (record) => record.patientId === patientId,
    );
  }

  // Beds
  async getBed(id: number): Promise<Bed | undefined> {
    return this.beds.get(id);
  }

  async createBed(insertBed: InsertBed): Promise<Bed> {
    const id = this.currentIds.beds++;
    const createdAt = new Date();
    const bed: Bed = { ...insertBed, id, createdAt };
    this.beds.set(id, bed);
    return bed;
  }

  async updateBed(id: number, bedData: Partial<InsertBed>): Promise<Bed | undefined> {
    const bed = await this.getBed(id);
    if (!bed) return undefined;

    const updatedBed = { ...bed, ...bedData };
    this.beds.set(id, updatedBed);
    return updatedBed;
  }

  async getAllBeds(): Promise<Bed[]> {
    return Array.from(this.beds.values());
  }

  async getAvailableBeds(): Promise<Bed[]> {
    return Array.from(this.beds.values()).filter(
      (bed) => bed.status === "available",
    );
  }

  async getBedsByWard(wardId: number): Promise<Bed[]> {
    return Array.from(this.beds.values()).filter(
      (bed) => bed.wardId === wardId,
    );
  }

  // Wards
  async getWard(id: number): Promise<Ward | undefined> {
    return this.wards.get(id);
  }

  async createWard(insertWard: InsertWard): Promise<Ward> {
    const id = this.currentIds.wards++;
    const createdAt = new Date();
    const ward: Ward = { ...insertWard, id, createdAt };
    this.wards.set(id, ward);
    return ward;
  }

  async getAllWards(): Promise<Ward[]> {
    return Array.from(this.wards.values());
  }

  // Admissions
  async getAdmission(id: number): Promise<Admission | undefined> {
    return this.admissions.get(id);
  }

  async createAdmission(insertAdmission: InsertAdmission): Promise<Admission> {
    const id = this.currentIds.admissions++;
    const createdAt = new Date();
    const admission: Admission = { ...insertAdmission, id, createdAt };
    this.admissions.set(id, admission);
    
    // Update bed status to occupied
    const bed = await this.getBed(insertAdmission.bedId);
    if (bed) {
      await this.updateBed(bed.id, { status: "occupied" });
    }
    
    return admission;
  }

  async updateAdmission(id: number, admissionData: Partial<InsertAdmission>): Promise<Admission | undefined> {
    const admission = await this.getAdmission(id);
    if (!admission) return undefined;

    const updatedAdmission = { ...admission, ...admissionData };
    this.admissions.set(id, updatedAdmission);
    
    // If status changes to discharged, update bed status to available
    if (admissionData.status === "discharged" && admission.status !== "discharged") {
      const bed = await this.getBed(admission.bedId);
      if (bed) {
        await this.updateBed(bed.id, { status: "available" });
      }
    }
    
    return updatedAdmission;
  }

  async getActiveAdmissions(): Promise<Admission[]> {
    return Array.from(this.admissions.values()).filter(
      (admission) => admission.status === "active",
    );
  }

  async getAdmissionsByPatient(patientId: number): Promise<Admission[]> {
    return Array.from(this.admissions.values()).filter(
      (admission) => admission.patientId === patientId,
    );
  }

  // Inventory
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.currentIds.inventoryItems++;
    const createdAt = new Date();
    const item: InventoryItem = { ...insertItem, id, createdAt };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, itemData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const item = await this.getInventoryItem(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...itemData };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      (item) => item.quantity <= item.reorderLevel,
    );
  }

  // Billing
  async getBill(id: number): Promise<Bill | undefined> {
    return this.bills.get(id);
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const id = this.currentIds.bills++;
    const createdAt = new Date();
    const bill: Bill = { ...insertBill, id, createdAt };
    this.bills.set(id, bill);
    return bill;
  }

  async updateBill(id: number, billData: Partial<InsertBill>): Promise<Bill | undefined> {
    const bill = await this.getBill(id);
    if (!bill) return undefined;

    const updatedBill = { ...bill, ...billData };
    
    // Update status based on payment
    if (billData.paidAmount !== undefined) {
      if (updatedBill.paidAmount >= updatedBill.totalAmount) {
        updatedBill.status = "paid";
      } else if (updatedBill.paidAmount > 0) {
        updatedBill.status = "partial";
      }
    }
    
    this.bills.set(id, updatedBill);
    return updatedBill;
  }

  async getBillsByPatient(patientId: number): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(
      (bill) => bill.patientId === patientId,
    );
  }

  async getPendingBills(): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(
      (bill) => bill.status !== "paid",
    );
  }

  // Bill Items
  async getBillItem(id: number): Promise<BillItem | undefined> {
    return this.billItems.get(id);
  }

  async createBillItem(insertItem: InsertBillItem): Promise<BillItem> {
    const id = this.currentIds.billItems++;
    const createdAt = new Date();
    const item: BillItem = { ...insertItem, id, createdAt };
    this.billItems.set(id, item);
    return item;
  }

  async getBillItemsByBill(billId: number): Promise<BillItem[]> {
    return Array.from(this.billItems.values()).filter(
      (item) => item.billId === billId,
    );
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStat | undefined> {
    return this.dashboardStats;
  }

  async createOrUpdateDashboardStats(stats: InsertDashboardStat): Promise<DashboardStat> {
    const id = this.currentIds.dashboardStats;
    this.dashboardStats = { ...stats, id, date: new Date() };
    return this.dashboardStats;
  }

  // Resource Utilization
  async getResourceUtilization(): Promise<ResourceUtilization | undefined> {
    return this.resourceUtil;
  }

  async createOrUpdateResourceUtilization(utilization: InsertResourceUtilization): Promise<ResourceUtilization> {
    const id = this.currentIds.resourceUtil;
    this.resourceUtil = { ...utilization, id, date: new Date() };
    return this.resourceUtil;
  }

  // Initialize sample data
  private async initializeData() {
    // Create admin user
    await this.createUser({
      username: "admin",
      password: "admin123",
      name: "System Administrator",
      email: "admin@hospital.com",
      role: "admin",
    });

    // Create doctor user
    await this.createUser({
      username: "drjohn",
      password: "password123",
      name: "Dr. John Doe",
      email: "john.doe@hospital.com",
      role: "doctor",
      specialty: "General Physician",
    });

    // Create nurse user
    await this.createUser({
      username: "nurse1",
      password: "password123",
      name: "Jane Smith",
      email: "jane.smith@hospital.com",
      role: "nurse",
    });

    // Create wards
    const generalWard = await this.createWard({
      name: "General Ward",
      type: "general",
      capacity: 20,
    });

    const icuWard = await this.createWard({
      name: "ICU",
      type: "intensive care",
      capacity: 10,
    });

    const pediatricWard = await this.createWard({
      name: "Pediatric Ward",
      type: "pediatric",
      capacity: 15,
    });

    // Create beds
    for (let i = 1; i <= 20; i++) {
      await this.createBed({
        bedNumber: `GW-${i}`,
        wardId: generalWard.id,
        status: i <= 15 ? "occupied" : "available",
      });
    }

    for (let i = 1; i <= 10; i++) {
      await this.createBed({
        bedNumber: `ICU-${i}`,
        wardId: icuWard.id,
        status: i <= 7 ? "occupied" : "available",
      });
    }

    for (let i = 1; i <= 15; i++) {
      await this.createBed({
        bedNumber: `PED-${i}`,
        wardId: pediatricWard.id,
        status: i <= 10 ? "occupied" : "available",
      });
    }

    // Create patients
    const patients = [
      {
        patientId: "P-21503",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "555-1234",
        dateOfBirth: new Date("1985-05-15"),
        gender: "male",
        status: "active",
      },
      {
        patientId: "P-21504",
        firstName: "Maria",
        lastName: "Johnson",
        email: "maria.j@example.com",
        phone: "555-2345",
        dateOfBirth: new Date("1990-08-21"),
        gender: "female",
        status: "active",
      },
      {
        patientId: "P-21505",
        firstName: "Robert",
        lastName: "Williams",
        email: "r.williams@example.com",
        phone: "555-3456",
        dateOfBirth: new Date("1978-03-10"),
        gender: "male",
        status: "discharged",
      },
      {
        patientId: "P-21506",
        firstName: "Sophia",
        lastName: "Davis",
        email: "sophia.d@example.com",
        phone: "555-4567",
        dateOfBirth: new Date("1995-11-30"),
        gender: "female",
        status: "scheduled",
      },
    ];

    for (const patient of patients) {
      await this.createPatient(patient);
    }

    // Create today's appointments
    const today = new Date();
    const doctor = (await this.getUserByUsername("drjohn"))!;
    const patientsList = await this.getAllPatients();

    const appointmentTypes = ["Checkup", "Follow-up", "Emergency", "Consultation"];
    const appointmentTimes = [
      new Date(today.setHours(9, 15, 0, 0)),
      new Date(today.setHours(10, 30, 0, 0)),
      new Date(today.setHours(11, 45, 0, 0)),
      new Date(today.setHours(14, 15, 0, 0)),
    ];

    for (let i = 0; i < patientsList.length; i++) {
      await this.createAppointment({
        patientId: patientsList[i].id,
        doctorId: doctor.id,
        date: appointmentTimes[i],
        duration: 30,
        type: appointmentTypes[i],
        status: "scheduled",
        notes: `Regular ${appointmentTypes[i].toLowerCase()} appointment`,
      });
    }

    // Create inventory items
    const inventoryItems = [
      {
        name: "Paracetamol",
        category: "medicine",
        quantity: 500,
        unit: "tablet",
        reorderLevel: 100,
        location: "pharmacy",
        cost: 0.5,
      },
      {
        name: "Disposable Syringes",
        category: "supplies",
        quantity: 1000,
        unit: "piece",
        reorderLevel: 200,
        location: "central store",
        cost: 0.25,
      },
      {
        name: "Blood Pressure Monitor",
        category: "equipment",
        quantity: 15,
        unit: "piece",
        reorderLevel: 5,
        location: "medical equipment",
        cost: 75.00,
      },
      {
        name: "Surgical Masks",
        category: "supplies",
        quantity: 2000,
        unit: "piece",
        reorderLevel: 500,
        location: "central store",
        cost: 0.20,
      },
    ];

    for (const item of inventoryItems) {
      await this.createInventoryItem(item);
    }

    // Create dashboard stats
    await this.createOrUpdateDashboardStats({
      totalPatients: 1248,
      todayAppointments: 47,
      availableBeds: 23,
      totalBeds: 85,
      todayRevenue: 12458,
      patientGrowth: 8.2,
      appointmentChange: -3.5,
      revenueGrowth: 12.3,
      date: new Date(),
    });

    // Create resource utilization
    await this.createOrUpdateResourceUtilization({
      bedUtilization: 73,
      staffAllocation: 85,
      emergencyCapacity: 42,
      operatingRoomUsage: 91,
      pharmacyInventory: 67,
      date: new Date(),
    });
  }
}

export const storage = new MemStorage();
