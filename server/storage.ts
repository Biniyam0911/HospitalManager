import {
  users,
  patients,
  appointments,
  medicalRecords,
  beds,
  wards,
  admissions,
  pharmacyStores,
  inventoryItems,
  inventoryTransfers,
  services,
  servicePriceVersions,
  serviceOrders,
  serviceOrderItems,
  servicePackages,
  servicePackageItems,
  vehicles,
  vehicleAssignments,
  accounts,
  transactions,
  posTerminals,
  posTransactions,
  posTransactionItems,
  clinicalGuidelines,
  diagnosticSessions,
  bills,
  billItems,
  dashboardStats,
  resourceUtilization,
  reportTemplates,
  reportExecutions,
  treatmentPlans,
  medicalOrders,
  orderResults,
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
  type PharmacyStore,
  type InsertPharmacyStore,
  type InventoryItem,
  type InsertInventoryItem,
  type InventoryTransfer,
  type InsertInventoryTransfer,
  type Service,
  type InsertService,
  type ServicePriceVersion,
  type InsertServicePriceVersion,
  type ServicePackage,
  type InsertServicePackage,
  type ServicePackageItem,
  type InsertServicePackageItem,
  type Vehicle,
  type InsertVehicle,
  type VehicleAssignment,
  type InsertVehicleAssignment,
  type Account,
  type InsertAccount,
  type Transaction,
  type InsertTransaction,
  type PosTerminal,
  type InsertPosTerminal,
  type PosTransaction,
  type InsertPosTransaction,
  type PosTransactionItem,
  type InsertPosTransactionItem,
  type ClinicalGuideline,
  type InsertClinicalGuideline,
  type DiagnosticSession,
  type InsertDiagnosticSession,
  type Bill,
  type InsertBill,
  type BillItem,
  type InsertBillItem,
  type DashboardStat,
  type InsertDashboardStat,
  type ResourceUtilization,
  type InsertResourceUtilization,
  type ReportTemplate,
  type InsertReportTemplate,
  type ReportExecution,
  type InsertReportExecution,
  type TreatmentPlan as Treatment,
  type InsertTreatmentPlan as InsertTreatment,
  type MedicalOrder,
  type InsertMedicalOrder,
  type OrderResult,
  type InsertOrderResult,
  type ServiceOrder,
  type InsertServiceOrder,
  type ServiceOrderItem,
  type InsertServiceOrderItem,
} from "@shared/schema.pg";

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
  
  // Pharmacy Stores
  getPharmacyStore(id: number): Promise<PharmacyStore | undefined>;
  createPharmacyStore(store: InsertPharmacyStore): Promise<PharmacyStore>;
  updatePharmacyStore(id: number, store: Partial<InsertPharmacyStore>): Promise<PharmacyStore | undefined>;
  getAllPharmacyStores(): Promise<PharmacyStore[]>;
  getActivePharmacyStores(): Promise<PharmacyStore[]>;
  
  // Inventory Transfers
  getInventoryTransfer(id: number): Promise<InventoryTransfer | undefined>;
  createInventoryTransfer(transfer: InsertInventoryTransfer): Promise<InventoryTransfer>;
  updateInventoryTransfer(id: number, transfer: Partial<InsertInventoryTransfer>): Promise<InventoryTransfer | undefined>;
  getInventoryTransfersByStore(storeId: number, isSource: boolean): Promise<InventoryTransfer[]>;
  getPendingInventoryTransfers(): Promise<InventoryTransfer[]>;
  
  // Services
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  
  // Service Price Versions
  getServicePriceVersion(id: number): Promise<ServicePriceVersion | undefined>;
  createServicePriceVersion(priceVersion: InsertServicePriceVersion): Promise<ServicePriceVersion>;
  getServicePriceVersionsByService(serviceId: number): Promise<ServicePriceVersion[]>;
  getServicePriceVersionsByYear(year: number): Promise<ServicePriceVersion[]>;
  getCurrentServicePriceVersion(serviceId: number): Promise<ServicePriceVersion | undefined>;
  getServicePrices(serviceId: number): Promise<ServicePriceVersion[]>;
  
  // Service Orders
  getServiceOrder(id: number): Promise<ServiceOrder | undefined>;
  createServiceOrder(insertOrder: InsertServiceOrder): Promise<ServiceOrder>;
  updateServiceOrder(id: number, orderData: Partial<InsertServiceOrder>): Promise<ServiceOrder | undefined>;
  getServiceOrdersByPatient(patientId: number): Promise<ServiceOrder[]>;
  getServiceOrdersByBill(billId: number): Promise<ServiceOrder[]>;
  getPendingServiceOrders(): Promise<ServiceOrder[]>;
  getAllServiceOrders(): Promise<ServiceOrder[]>;
  
  // Service Order Items
  getServiceOrderItem(id: number): Promise<ServiceOrderItem | undefined>;
  createServiceOrderItem(insertItem: InsertServiceOrderItem): Promise<ServiceOrderItem>;
  updateServiceOrderItem(id: number, itemData: Partial<InsertServiceOrderItem>): Promise<ServiceOrderItem | undefined>;
  getServiceOrderItemsByOrder(serviceOrderId: number): Promise<ServiceOrderItem[]>;
  getServiceOrderItemsByService(serviceId: number): Promise<ServiceOrderItem[]>;
  
  // Service Packages
  getServicePackage(id: number): Promise<ServicePackage | undefined>;
  createServicePackage(pkg: InsertServicePackage): Promise<ServicePackage>;
  updateServicePackage(id: number, pkg: Partial<InsertServicePackage>): Promise<ServicePackage | undefined>;
  getAllServicePackages(): Promise<ServicePackage[]>;
  getActiveServicePackages(): Promise<ServicePackage[]>;
  
  // Service Package Items
  getServicePackageItem(id: number): Promise<ServicePackageItem | undefined>;
  createServicePackageItem(item: InsertServicePackageItem): Promise<ServicePackageItem>;
  getServicePackageItemsByPackage(packageId: number): Promise<ServicePackageItem[]>;
  
  // Vehicles
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicleByVehicleNumber(vehicleNumber: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  getAllVehicles(): Promise<Vehicle[]>;
  getAvailableVehicles(): Promise<Vehicle[]>;
  
  // Vehicle Assignments
  getVehicleAssignment(id: number): Promise<VehicleAssignment | undefined>;
  createVehicleAssignment(assignment: InsertVehicleAssignment): Promise<VehicleAssignment>;
  updateVehicleAssignment(id: number, assignment: Partial<InsertVehicleAssignment>): Promise<VehicleAssignment | undefined>;
  getVehicleAssignmentsByVehicle(vehicleId: number): Promise<VehicleAssignment[]>;
  getActiveVehicleAssignments(): Promise<VehicleAssignment[]>;
  
  // Accounts
  getAccount(id: number): Promise<Account | undefined>;
  getAccountByAccountNumber(accountNumber: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  getAllAccounts(): Promise<Account[]>;
  getActiveAccounts(): Promise<Account[]>;
  
  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  getTransactionsByAccount(accountId: number): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  
  // POS Terminals
  getPosTerminal(id: number): Promise<PosTerminal | undefined>;
  getPosTerminalByTerminalId(terminalId: string): Promise<PosTerminal | undefined>;
  createPosTerminal(terminal: InsertPosTerminal): Promise<PosTerminal>;
  updatePosTerminal(id: number, terminal: Partial<InsertPosTerminal>): Promise<PosTerminal | undefined>;
  getAllPosTerminals(): Promise<PosTerminal[]>;
  getActivePosTerminals(): Promise<PosTerminal[]>;
  
  // POS Transactions
  getPosTransaction(id: number): Promise<PosTransaction | undefined>;
  getPosTransactionByTransactionNumber(transactionNumber: string): Promise<PosTransaction | undefined>;
  createPosTransaction(transaction: InsertPosTransaction): Promise<PosTransaction>;
  updatePosTransaction(id: number, transaction: Partial<InsertPosTransaction>): Promise<PosTransaction | undefined>;
  getPosTransactionsByTerminal(terminalId: number): Promise<PosTransaction[]>;
  getTodayPosTransactions(): Promise<PosTransaction[]>;
  
  // POS Items
  getPosItem(id: number): Promise<PosTransactionItem | undefined>;
  createPosItem(item: InsertPosTransactionItem): Promise<PosTransactionItem>;
  getPosItemsByTransaction(transactionId: number): Promise<PosTransactionItem[]>;
  
  // Clinical Guidelines
  getClinicalGuideline(id: number): Promise<ClinicalGuideline | undefined>;
  createClinicalGuideline(guideline: InsertClinicalGuideline): Promise<ClinicalGuideline>;
  updateClinicalGuideline(id: number, guideline: Partial<InsertClinicalGuideline>): Promise<ClinicalGuideline | undefined>;
  getAllClinicalGuidelines(): Promise<ClinicalGuideline[]>;
  getActiveClinicalGuidelines(): Promise<ClinicalGuideline[]>;
  
  // Diagnostic Sessions
  getDecisionSupportLog(id: number): Promise<DiagnosticSession | undefined>;
  createDecisionSupportLog(log: InsertDiagnosticSession): Promise<DiagnosticSession>;
  getDecisionSupportLogsByPatient(patientId: number): Promise<DiagnosticSession[]>;
  getDecisionSupportLogsByDoctor(doctorId: number): Promise<DiagnosticSession[]>;
  
  // Report Templates
  getReportTemplate(id: number): Promise<ReportTemplate | undefined>;
  createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate>;
  updateReportTemplate(id: number, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined>;
  getAllReportTemplates(): Promise<ReportTemplate[]>;
  getReportTemplatesByCategory(category: string): Promise<ReportTemplate[]>;
  getReportTemplatesByUser(userId: number): Promise<ReportTemplate[]>;
  getSystemReportTemplates(): Promise<ReportTemplate[]>;
  
  // Report Executions
  getReportExecution(id: number): Promise<ReportExecution | undefined>;
  createReportExecution(execution: InsertReportExecution): Promise<ReportExecution>;
  updateReportExecution(id: number, execution: Partial<InsertReportExecution>): Promise<ReportExecution | undefined>;
  getReportExecutionsByTemplate(templateId: number): Promise<ReportExecution[]>;
  getReportExecutionsByUser(userId: number): Promise<ReportExecution[]>;
  getRecentReportExecutions(limit: number): Promise<ReportExecution[]>;
  
  // Treatments
  getTreatment(id: number): Promise<Treatment | undefined>;
  createTreatment(treatment: InsertTreatment): Promise<Treatment>;
  updateTreatment(id: number, treatment: Partial<InsertTreatment>): Promise<Treatment | undefined>;
  getTreatmentsByPatient(patientId: number): Promise<Treatment[]>;
  getTreatmentsByAdmission(admissionId: number): Promise<Treatment[]>;
  getActiveTreatments(): Promise<Treatment[]>;
  
  // Medical Orders
  getMedicalOrder(id: number): Promise<MedicalOrder | undefined>;
  createMedicalOrder(order: InsertMedicalOrder): Promise<MedicalOrder>;
  updateMedicalOrder(id: number, order: Partial<InsertMedicalOrder>): Promise<MedicalOrder | undefined>;
  getMedicalOrdersByPatient(patientId: number): Promise<MedicalOrder[]>;
  getMedicalOrdersByAdmission(admissionId: number): Promise<MedicalOrder[]>;
  getActiveMedicalOrders(): Promise<MedicalOrder[]>;
  
  // Order Results
  getOrderResult(id: number): Promise<OrderResult | undefined>;
  createOrderResult(result: InsertOrderResult): Promise<OrderResult>;
  updateOrderResult(id: number, result: Partial<InsertOrderResult>): Promise<OrderResult | undefined>;
  getOrderResultsByOrder(orderId: number): Promise<OrderResult[]>;
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
  private pharmacyStores: Map<number, PharmacyStore>;
  private inventoryItems: Map<number, InventoryItem>;
  private inventoryTransfers: Map<number, InventoryTransfer>;
  private services: Map<number, Service>;
  private servicePriceVersions: Map<number, ServicePriceVersion>;
  private serviceOrders: Map<number, ServiceOrder>;
  private serviceOrderItems: Map<number, ServiceOrderItem>;
  private servicePackages: Map<number, ServicePackage>;
  private servicePackageItems: Map<number, ServicePackageItem>;
  private vehicles: Map<number, Vehicle>;
  private vehicleAssignments: Map<number, VehicleAssignment>;
  private accounts: Map<number, Account>;
  private transactions: Map<number, Transaction>;
  private posTerminals: Map<number, PosTerminal>;
  private posTransactions: Map<number, PosTransaction>;
  private posItems: Map<number, PosTransactionItem>;
  private clinicalGuidelines: Map<number, ClinicalGuideline>;
  private decisionSupportLogs: Map<number, DiagnosticSession>;
  private bills: Map<number, Bill>;
  private billItems: Map<number, BillItem>;
  private dashboardStats: DashboardStat | undefined;
  private resourceUtil: ResourceUtilization | undefined;
  private reportTemplates: Map<number, ReportTemplate>;
  private reportExecutions: Map<number, ReportExecution>;
  private treatments: Map<number, Treatment>;
  private medicalOrders: Map<number, MedicalOrder>;
  private orderResults: Map<number, OrderResult>;

  private currentIds: {
    users: number;
    patients: number;
    appointments: number;
    medicalRecords: number;
    beds: number;
    wards: number;
    admissions: number;
    pharmacyStores: number;
    inventoryItems: number;
    inventoryTransfers: number;
    services: number;
    servicePriceVersions: number;
    serviceOrders: number;
    serviceOrderItems: number;
    servicePackages: number;
    servicePackageItems: number;
    vehicles: number;
    vehicleAssignments: number;
    accounts: number;
    transactions: number;
    posTerminals: number;
    posTransactions: number;
    posItems: number;
    clinicalGuidelines: number;
    decisionSupportLogs: number;
    bills: number;
    billItems: number;
    dashboardStats: number;
    resourceUtil: number;
    reportTemplates: number;
    reportExecutions: number;
    treatments: number;
    medicalOrders: number;
    orderResults: number;
  };

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.medicalRecords = new Map();
    this.beds = new Map();
    this.wards = new Map();
    this.admissions = new Map();
    this.pharmacyStores = new Map();
    this.inventoryItems = new Map();
    this.inventoryTransfers = new Map();
    this.services = new Map();
    this.servicePriceVersions = new Map();
    this.serviceOrders = new Map();
    this.serviceOrderItems = new Map();
    this.servicePackages = new Map();
    this.servicePackageItems = new Map();
    this.vehicles = new Map();
    this.vehicleAssignments = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
    this.posTerminals = new Map();
    this.posTransactions = new Map();
    this.posItems = new Map();
    this.clinicalGuidelines = new Map();
    this.decisionSupportLogs = new Map();
    this.bills = new Map();
    this.billItems = new Map();
    this.reportTemplates = new Map();
    this.reportExecutions = new Map();
    this.treatments = new Map();
    this.medicalOrders = new Map();
    this.orderResults = new Map();

    this.currentIds = {
      users: 1,
      patients: 1,
      appointments: 1,
      medicalRecords: 1,
      beds: 1,
      wards: 1,
      admissions: 1,
      pharmacyStores: 1,
      inventoryItems: 1,
      inventoryTransfers: 1,
      services: 1,
      servicePriceVersions: 1,
      serviceOrders: 1,
      serviceOrderItems: 1,
      servicePackages: 1,
      servicePackageItems: 1,
      vehicles: 1,
      vehicleAssignments: 1,
      accounts: 1,
      transactions: 1,
      posTerminals: 1,
      posTransactions: 1,
      posItems: 1,
      clinicalGuidelines: 1,
      decisionSupportLogs: 1,
      bills: 1,
      billItems: 1,
      dashboardStats: 1,
      resourceUtil: 1,
      reportTemplates: 1,
      reportExecutions: 1,
      treatments: 1,
      medicalOrders: 1,
      orderResults: 1,
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
    
    // Update status based on Stripe payment status
    if (billData.stripePaymentStatus === "succeeded") {
      updatedBill.status = "paid";
      updatedBill.paidAmount = updatedBill.totalAmount;
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
  
  // Pharmacy Stores
  async getPharmacyStore(id: number): Promise<PharmacyStore | undefined> {
    return this.pharmacyStores.get(id);
  }

  async createPharmacyStore(store: InsertPharmacyStore): Promise<PharmacyStore> {
    const id = this.currentIds.pharmacyStores++;
    const createdAt = new Date();
    const newStore: PharmacyStore = { ...store, id, createdAt };
    this.pharmacyStores.set(id, newStore);
    return newStore;
  }

  async updatePharmacyStore(id: number, storeData: Partial<InsertPharmacyStore>): Promise<PharmacyStore | undefined> {
    const store = await this.getPharmacyStore(id);
    if (!store) return undefined;

    const updatedStore = { ...store, ...storeData };
    this.pharmacyStores.set(id, updatedStore);
    return updatedStore;
  }

  async getAllPharmacyStores(): Promise<PharmacyStore[]> {
    return Array.from(this.pharmacyStores.values());
  }

  async getActivePharmacyStores(): Promise<PharmacyStore[]> {
    return Array.from(this.pharmacyStores.values()).filter(
      (store) => store.status === "active"
    );
  }
  
  // Inventory Transfers
  async getInventoryTransfer(id: number): Promise<InventoryTransfer | undefined> {
    return this.inventoryTransfers.get(id);
  }

  async createInventoryTransfer(transfer: InsertInventoryTransfer): Promise<InventoryTransfer> {
    const id = this.currentIds.inventoryTransfers++;
    const createdAt = new Date();
    const newTransfer: InventoryTransfer = { ...transfer, id, createdAt };
    this.inventoryTransfers.set(id, newTransfer);
    
    // If status is completed, update the inventory quantities
    if (transfer.status === "completed" && transfer.completedDate) {
      const sourceItem = await this.getInventoryItem(transfer.itemId);
      
      if (sourceItem && sourceItem.storeId === transfer.sourceStoreId) {
        // Decrease quantity from source store
        await this.updateInventoryItem(sourceItem.id, {
          quantity: Math.max(0, sourceItem.quantity - transfer.quantity)
        });
        
        // Find or create the same item in the destination store
        const destItems = Array.from(this.inventoryItems.values()).filter(
          item => item.name === sourceItem.name && 
                 item.storeId === transfer.destinationStoreId
        );
        
        if (destItems.length > 0) {
          // Update existing item in destination store
          const destItem = destItems[0];
          await this.updateInventoryItem(destItem.id, {
            quantity: destItem.quantity + transfer.quantity
          });
        } else {
          // Create new item in destination store
          await this.createInventoryItem({
            name: sourceItem.name,
            category: sourceItem.category,
            storeId: transfer.destinationStoreId,
            quantity: transfer.quantity,
            unit: sourceItem.unit,
            reorderLevel: sourceItem.reorderLevel,
            location: "Transferred",
            cost: sourceItem.cost,
            expiryDate: sourceItem.expiryDate,
            batchNumber: sourceItem.batchNumber,
            manufacturer: sourceItem.manufacturer
          });
        }
      }
    }
    
    return newTransfer;
  }

  async updateInventoryTransfer(id: number, transferData: Partial<InsertInventoryTransfer>): Promise<InventoryTransfer | undefined> {
    const transfer = await this.getInventoryTransfer(id);
    if (!transfer) return undefined;

    const prevStatus = transfer.status;
    const updatedTransfer = { ...transfer, ...transferData };
    this.inventoryTransfers.set(id, updatedTransfer);
    
    // If status changed to completed, update the inventory quantities
    if (prevStatus !== "completed" && updatedTransfer.status === "completed" && updatedTransfer.completedDate) {
      const sourceItem = await this.getInventoryItem(updatedTransfer.itemId);
      
      if (sourceItem && sourceItem.storeId === updatedTransfer.sourceStoreId) {
        // Decrease quantity from source store
        await this.updateInventoryItem(sourceItem.id, {
          quantity: Math.max(0, sourceItem.quantity - updatedTransfer.quantity)
        });
        
        // Find or create the same item in the destination store
        const destItems = Array.from(this.inventoryItems.values()).filter(
          item => item.name === sourceItem.name && 
                 item.storeId === updatedTransfer.destinationStoreId
        );
        
        if (destItems.length > 0) {
          // Update existing item in destination store
          const destItem = destItems[0];
          await this.updateInventoryItem(destItem.id, {
            quantity: destItem.quantity + updatedTransfer.quantity
          });
        } else {
          // Create new item in destination store
          await this.createInventoryItem({
            name: sourceItem.name,
            category: sourceItem.category,
            storeId: updatedTransfer.destinationStoreId,
            quantity: updatedTransfer.quantity,
            unit: sourceItem.unit,
            reorderLevel: sourceItem.reorderLevel,
            location: "Transferred",
            cost: sourceItem.cost,
            expiryDate: sourceItem.expiryDate,
            batchNumber: sourceItem.batchNumber,
            manufacturer: sourceItem.manufacturer
          });
        }
      }
    }
    
    return updatedTransfer;
  }

  async getInventoryTransfersByStore(storeId: number, isSource: boolean): Promise<InventoryTransfer[]> {
    return Array.from(this.inventoryTransfers.values()).filter(
      (transfer) => isSource ? 
        transfer.sourceStoreId === storeId : 
        transfer.destinationStoreId === storeId
    );
  }

  async getPendingInventoryTransfers(): Promise<InventoryTransfer[]> {
    return Array.from(this.inventoryTransfers.values()).filter(
      (transfer) => transfer.status === "pending"
    );
  }
  
  // Services
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.currentIds.services++;
    const createdAt = new Date();
    const newService: Service = { ...service, id, createdAt };
    this.services.set(id, newService);
    return newService;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const service = await this.getService(id);
    if (!service) return undefined;

    const updatedService = { ...service, ...serviceData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getActiveServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.status === "active"
    );
  }
  
  // Service Price Versions
  async getServicePriceVersion(id: number): Promise<ServicePriceVersion | undefined> {
    return this.servicePriceVersions.get(id);
  }

  async createServicePriceVersion(priceVersion: InsertServicePriceVersion): Promise<ServicePriceVersion> {
    const id = this.currentIds.servicePriceVersions++;
    const createdAt = new Date();
    const newPriceVersion: ServicePriceVersion = { ...priceVersion, id, createdAt };
    
    // If this is a new current price version, expire the old ones
    if (!priceVersion.expiryDate) {
      // Find all current price versions for this service (those without expiry date)
      const currentVersions = Array.from(this.servicePriceVersions.values()).filter(
        pv => pv.serviceId === priceVersion.serviceId && !pv.expiryDate
      );
      
      // Expire them as of yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      for (const version of currentVersions) {
        this.servicePriceVersions.set(version.id, {
          ...version,
          expiryDate: yesterday
        });
      }
    }
    
    this.servicePriceVersions.set(id, newPriceVersion);
    return newPriceVersion;
  }

  async getServicePriceVersionsByService(serviceId: number): Promise<ServicePriceVersion[]> {
    return Array.from(this.servicePriceVersions.values()).filter(
      pv => pv.serviceId === serviceId
    ).sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());
  }
  
  // Service Orders
  async getServiceOrder(id: number): Promise<ServiceOrder | undefined> {
    return this.serviceOrders.get(id);
  }
  
  async createServiceOrder(insertOrder: InsertServiceOrder): Promise<ServiceOrder> {
    const id = this.currentIds.serviceOrders++;
    const createdAt = new Date();
    const serviceOrder: ServiceOrder = { ...insertOrder, id, createdAt };
    this.serviceOrders.set(id, serviceOrder);
    return serviceOrder;
  }
  
  async updateServiceOrder(id: number, orderData: Partial<InsertServiceOrder>): Promise<ServiceOrder | undefined> {
    const order = await this.getServiceOrder(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...orderData };
    this.serviceOrders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async getServiceOrdersByPatient(patientId: number): Promise<ServiceOrder[]> {
    return Array.from(this.serviceOrders.values()).filter(
      order => order.patientId === patientId
    );
  }
  
  async getServiceOrdersByBill(billId: number): Promise<ServiceOrder[]> {
    return Array.from(this.serviceOrders.values()).filter(
      order => order.billId === billId
    );
  }
  
  async getPendingServiceOrders(): Promise<ServiceOrder[]> {
    return Array.from(this.serviceOrders.values()).filter(
      order => order.status === "pending"
    );
  }
  
  async getAllServiceOrders(): Promise<ServiceOrder[]> {
    return Array.from(this.serviceOrders.values());
  }
  
  // Service Order Items
  async getServiceOrderItem(id: number): Promise<ServiceOrderItem | undefined> {
    return this.serviceOrderItems.get(id);
  }
  
  async createServiceOrderItem(insertItem: InsertServiceOrderItem): Promise<ServiceOrderItem> {
    const id = this.currentIds.serviceOrderItems++;
    const createdAt = new Date();
    const orderItem: ServiceOrderItem = { ...insertItem, id, createdAt };
    this.serviceOrderItems.set(id, orderItem);
    
    // Update the order total amount
    const order = await this.getServiceOrder(orderItem.serviceOrderId);
    if (order) {
      const currentTotal = parseFloat(order.totalAmount);
      const itemTotal = parseFloat(orderItem.totalPrice);
      const newTotal = (currentTotal + itemTotal).toFixed(2);
      await this.updateServiceOrder(order.id, { totalAmount: newTotal });
    }
    
    return orderItem;
  }
  
  async updateServiceOrderItem(id: number, itemData: Partial<InsertServiceOrderItem>): Promise<ServiceOrderItem | undefined> {
    const item = await this.getServiceOrderItem(id);
    if (!item) return undefined;
    
    const oldTotal = parseFloat(item.totalPrice);
    const updatedItem = { ...item, ...itemData };
    this.serviceOrderItems.set(id, updatedItem);
    
    // If price changed, update order total
    if (itemData.totalPrice) {
      const order = await this.getServiceOrder(item.serviceOrderId);
      if (order) {
        const currentOrderTotal = parseFloat(order.totalAmount);
        const newItemTotal = parseFloat(updatedItem.totalPrice);
        const newOrderTotal = (currentOrderTotal - oldTotal + newItemTotal).toFixed(2);
        await this.updateServiceOrder(order.id, { totalAmount: newOrderTotal });
      }
    }
    
    return updatedItem;
  }
  
  async getServiceOrderItemsByOrder(serviceOrderId: number): Promise<ServiceOrderItem[]> {
    return Array.from(this.serviceOrderItems.values()).filter(
      item => item.serviceOrderId === serviceOrderId
    );
  }
  
  async getServiceOrderItemsByService(serviceId: number): Promise<ServiceOrderItem[]> {
    return Array.from(this.serviceOrderItems.values()).filter(
      item => item.serviceId === serviceId
    );
  }

  async getServicePriceVersionsByYear(year: number): Promise<ServicePriceVersion[]> {
    return Array.from(this.servicePriceVersions.values()).filter(
      pv => pv.year === year
    );
  }

  async getCurrentServicePriceVersion(serviceId: number): Promise<ServicePriceVersion | undefined> {
    const today = new Date();
    
    // Find price versions that are effective today (effectiveDate <= today && (expiryDate == null || expiryDate >= today))
    const currentVersions = Array.from(this.servicePriceVersions.values()).filter(
      pv => pv.serviceId === serviceId && 
            pv.effectiveDate <= today && 
            (!pv.expiryDate || pv.expiryDate >= today)
    );
    
    // Sort by effectiveDate descending and return the most recent
    return currentVersions.sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime())[0];
  }
  
  async getServicePrices(serviceId: number): Promise<ServicePriceVersion[]> {
    // Get all price versions for a specific service
    return Array.from(this.servicePriceVersions.values())
      .filter(pv => pv.serviceId === serviceId)
      .sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());
  }
  
  // Service Packages
  async getServicePackage(id: number): Promise<ServicePackage | undefined> {
    return this.servicePackages.get(id);
  }

  async createServicePackage(pkg: InsertServicePackage): Promise<ServicePackage> {
    const id = this.currentIds.servicePackages++;
    const createdAt = new Date();
    const newPackage: ServicePackage = { ...pkg, id, createdAt };
    this.servicePackages.set(id, newPackage);
    return newPackage;
  }

  async updateServicePackage(id: number, pkgData: Partial<InsertServicePackage>): Promise<ServicePackage | undefined> {
    const pkg = await this.getServicePackage(id);
    if (!pkg) return undefined;

    const updatedPackage = { ...pkg, ...pkgData };
    this.servicePackages.set(id, updatedPackage);
    return updatedPackage;
  }

  async getAllServicePackages(): Promise<ServicePackage[]> {
    return Array.from(this.servicePackages.values());
  }

  async getActiveServicePackages(): Promise<ServicePackage[]> {
    return Array.from(this.servicePackages.values()).filter(
      (pkg) => pkg.status === "active"
    );
  }
  
  // Service Package Items
  async getServicePackageItem(id: number): Promise<ServicePackageItem | undefined> {
    return this.servicePackageItems.get(id);
  }

  async createServicePackageItem(item: InsertServicePackageItem): Promise<ServicePackageItem> {
    const id = this.currentIds.servicePackageItems++;
    const createdAt = new Date();
    const newItem: ServicePackageItem = { ...item, id, createdAt };
    this.servicePackageItems.set(id, newItem);
    return newItem;
  }

  async getServicePackageItemsByPackage(packageId: number): Promise<ServicePackageItem[]> {
    return Array.from(this.servicePackageItems.values()).filter(
      (item) => item.packageId === packageId
    );
  }
  
  // Vehicles
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehicleByVehicleNumber(vehicleNumber: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(
      (vehicle) => vehicle.vehicleNumber === vehicleNumber
    );
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentIds.vehicles++;
    const createdAt = new Date();
    const newVehicle: Vehicle = { ...vehicle, id, createdAt };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: number, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = await this.getVehicle(id);
    if (!vehicle) return undefined;

    const updatedVehicle = { ...vehicle, ...vehicleData };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(
      (vehicle) => vehicle.status === "available"
    );
  }
  
  // Vehicle Assignments
  async getVehicleAssignment(id: number): Promise<VehicleAssignment | undefined> {
    return this.vehicleAssignments.get(id);
  }

  async createVehicleAssignment(assignment: InsertVehicleAssignment): Promise<VehicleAssignment> {
    const id = this.currentIds.vehicleAssignments++;
    const createdAt = new Date();
    const newAssignment: VehicleAssignment = { ...assignment, id, createdAt };
    this.vehicleAssignments.set(id, newAssignment);
    
    // Update vehicle status to in-use
    if (assignment.status === "in-progress") {
      const vehicle = await this.getVehicle(assignment.vehicleId);
      if (vehicle) {
        await this.updateVehicle(vehicle.id, { status: "in-use" });
      }
    }
    
    return newAssignment;
  }

  async updateVehicleAssignment(id: number, assignmentData: Partial<InsertVehicleAssignment>): Promise<VehicleAssignment | undefined> {
    const assignment = await this.getVehicleAssignment(id);
    if (!assignment) return undefined;

    const prevStatus = assignment.status;
    const updatedAssignment = { ...assignment, ...assignmentData };
    this.vehicleAssignments.set(id, updatedAssignment);
    
    // Update vehicle status based on assignment status changes
    if (prevStatus !== updatedAssignment.status) {
      const vehicle = await this.getVehicle(updatedAssignment.vehicleId);
      if (vehicle) {
        if (updatedAssignment.status === "in-progress") {
          await this.updateVehicle(vehicle.id, { status: "in-use" });
        } else if (updatedAssignment.status === "completed" || updatedAssignment.status === "cancelled") {
          // Check if there are any other active assignments for this vehicle
          const activeAssignments = Array.from(this.vehicleAssignments.values()).filter(
            a => a.id !== id && 
                a.vehicleId === vehicle.id && 
                a.status === "in-progress"
          );
          
          if (activeAssignments.length === 0) {
            await this.updateVehicle(vehicle.id, { status: "available" });
          }
        }
      }
    }
    
    return updatedAssignment;
  }

  async getVehicleAssignmentsByVehicle(vehicleId: number): Promise<VehicleAssignment[]> {
    return Array.from(this.vehicleAssignments.values()).filter(
      (assignment) => assignment.vehicleId === vehicleId
    );
  }

  async getActiveVehicleAssignments(): Promise<VehicleAssignment[]> {
    return Array.from(this.vehicleAssignments.values()).filter(
      (assignment) => assignment.status === "scheduled" || assignment.status === "in-progress"
    );
  }
  
  // Accounts
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async getAccountByAccountNumber(accountNumber: string): Promise<Account | undefined> {
    return Array.from(this.accounts.values()).find(
      (account) => account.accountNumber === accountNumber
    );
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const id = this.currentIds.accounts++;
    const createdAt = new Date();
    const newAccount: Account = { ...account, id, createdAt };
    this.accounts.set(id, newAccount);
    return newAccount;
  }

  async updateAccount(id: number, accountData: Partial<InsertAccount>): Promise<Account | undefined> {
    const account = await this.getAccount(id);
    if (!account) return undefined;

    const updatedAccount = { ...account, ...accountData };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async getAllAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async getActiveAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(
      (account) => account.status === "active"
    );
  }
  
  // Transactions
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentIds.transactions++;
    const createdAt = new Date();
    const newTransaction: Transaction = { ...transaction, id, createdAt };
    this.transactions.set(id, newTransaction);
    
    // Update account balance based on transaction type
    const account = await this.getAccount(transaction.accountId);
    if (account) {
      let newBalance = parseFloat(account.balance);
      const amount = parseFloat(transaction.amount);
      
      if (transaction.type === "credit") {
        newBalance += amount;
      } else if (transaction.type === "debit") {
        newBalance -= amount;
      }
      
      await this.updateAccount(account.id, {
        balance: newBalance.toFixed(2)
      });
    }
    
    return newTransaction;
  }

  async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.accountId === accountId
    );
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate >= startDate && transactionDate <= endDate;
      }
    );
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.type === type
    );
  }
  
  async updateTransaction(id: number, transactionData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = await this.getTransaction(id);
    if (!transaction) return undefined;

    const updatedTransaction = { ...transaction, ...transactionData };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.status === "pending"
    );
  }
  
  // Point of Sale Terminals
  async getPosTerminal(id: number): Promise<PosTerminal | undefined> {
    return this.posTerminals.get(id);
  }

  async createPosTerminal(terminal: InsertPosTerminal): Promise<PosTerminal> {
    const id = this.currentIds.posTerminals++;
    const createdAt = new Date();
    const newTerminal: PosTerminal = { ...terminal, id, createdAt };
    this.posTerminals.set(id, newTerminal);
    return newTerminal;
  }

  async updatePosTerminal(id: number, terminalData: Partial<InsertPosTerminal>): Promise<PosTerminal | undefined> {
    const terminal = await this.getPosTerminal(id);
    if (!terminal) return undefined;

    const updatedTerminal = { ...terminal, ...terminalData };
    this.posTerminals.set(id, updatedTerminal);
    return updatedTerminal;
  }

  async getAllPosTerminals(): Promise<PosTerminal[]> {
    return Array.from(this.posTerminals.values());
  }

  async getActivePosTerminals(): Promise<PosTerminal[]> {
    return Array.from(this.posTerminals.values()).filter(
      (terminal) => terminal.status === "active"
    );
  }
  
  async getPosTerminalByTerminalId(terminalId: string): Promise<PosTerminal | undefined> {
    return Array.from(this.posTerminals.values()).find(
      (terminal) => terminal.terminalNumber === terminalId
    );
  }
  
  // Point of Sale Transactions
  async getPosTransaction(id: number): Promise<PosTransaction | undefined> {
    return this.posTransactions.get(id);
  }

  async createPosTransaction(transaction: InsertPosTransaction): Promise<PosTransaction> {
    const id = this.currentIds.posTransactions++;
    const createdAt = new Date();
    const newTransaction: PosTransaction = { ...transaction, id, createdAt };
    this.posTransactions.set(id, newTransaction);
    
    // Create accounting transaction if payment was received
    if (transaction.status === "completed" && transaction.paymentMethod !== "none") {
      // Find the accounting account for this payment method
      const accountType = transaction.paymentMethod === "cash" ? "cash" : 
                          transaction.paymentMethod === "card" ? "bank" : "accounts_receivable";
                          
      const accounts = Array.from(this.accounts.values()).filter(
        account => account.type === accountType && account.status === "active"
      );
      
      if (accounts.length > 0) {
        const account = accounts[0];
        await this.createTransaction({
          accountId: account.id,
          transactionDate: new Date(),
          description: `POS Sale ID: ${id}`,
          amount: transaction.totalAmount,
          type: "credit",
          categoryId: 1, // Sales
          reference: `POS-${id}`,
          notes: `Point of sale transaction from terminal ${transaction.terminalId}`
        });
      }
    }
    
    return newTransaction;
  }

  async updatePosTransaction(id: number, transactionData: Partial<InsertPosTransaction>): Promise<PosTransaction | undefined> {
    const transaction = await this.getPosTransaction(id);
    if (!transaction) return undefined;

    const prevStatus = transaction.status;
    const updatedTransaction = { ...transaction, ...transactionData };
    this.posTransactions.set(id, updatedTransaction);
    
    // Create accounting transaction if status changed to completed
    if (prevStatus !== "completed" && updatedTransaction.status === "completed" && updatedTransaction.paymentMethod !== "none") {
      // Find the accounting account for this payment method
      const accountType = updatedTransaction.paymentMethod === "cash" ? "cash" : 
                          updatedTransaction.paymentMethod === "card" ? "bank" : "accounts_receivable";
                          
      const accounts = Array.from(this.accounts.values()).filter(
        account => account.type === accountType && account.status === "active"
      );
      
      if (accounts.length > 0) {
        const account = accounts[0];
        await this.createTransaction({
          accountId: account.id,
          transactionDate: new Date(),
          description: `POS Sale ID: ${id}`,
          amount: updatedTransaction.totalAmount,
          type: "credit",
          categoryId: 1, // Sales
          reference: `POS-${id}`,
          notes: `Point of sale transaction from terminal ${updatedTransaction.terminalId}`
        });
      }
    }
    
    return updatedTransaction;
  }

  async getPosTransactionsByTerminal(terminalId: number): Promise<PosTransaction[]> {
    return Array.from(this.posTransactions.values()).filter(
      (transaction) => transaction.terminalId === terminalId
    );
  }

  async getPosTransactionsByDateRange(startDate: Date, endDate: Date): Promise<PosTransaction[]> {
    return Array.from(this.posTransactions.values()).filter(
      (transaction) => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate >= startDate && transactionDate <= endDate;
      }
    );
  }
  
  async getPosTransactionByTransactionNumber(transactionNumber: string): Promise<PosTransaction | undefined> {
    return Array.from(this.posTransactions.values()).find(
      (transaction) => transaction.transactionNumber === transactionNumber
    );
  }
  
  async getTodayPosTransactions(): Promise<PosTransaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.getPosTransactionsByDateRange(today, tomorrow);
  }
  
  // Point of Sale Items
  async getPosItem(id: number): Promise<PosTransactionItem | undefined> {
    return this.posItems.get(id);
  }

  async createPosItem(item: InsertPosTransactionItem): Promise<PosTransactionItem> {
    const id = this.currentIds.posItems++;
    const createdAt = new Date();
    const newItem: PosTransactionItem = { ...item, id, createdAt };
    this.posItems.set(id, newItem);
    
    // Update inventory if inventory tracking is enabled
    if (item.inventoryItemId && item.quantity) {
      const inventoryItem = await this.getInventoryItem(item.inventoryItemId);
      if (inventoryItem) {
        // Decrease quantity from inventory
        await this.updateInventoryItem(inventoryItem.id, {
          quantity: Math.max(0, inventoryItem.quantity - item.quantity)
        });
      }
    }
    
    return newItem;
  }

  async getPosItemsByTransaction(posTransactionId: number): Promise<PosTransactionItem[]> {
    return Array.from(this.posItems.values()).filter(
      (item) => item.transactionId === posTransactionId
    );
  }
  
  // Clinical Guidelines
  async getClinicalGuideline(id: number): Promise<ClinicalGuideline | undefined> {
    return this.clinicalGuidelines.get(id);
  }

  async createClinicalGuideline(guideline: InsertClinicalGuideline): Promise<ClinicalGuideline> {
    const id = this.currentIds.clinicalGuidelines++;
    const createdAt = new Date();
    const newGuideline: ClinicalGuideline = { ...guideline, id, createdAt };
    this.clinicalGuidelines.set(id, newGuideline);
    return newGuideline;
  }

  async updateClinicalGuideline(id: number, guidelineData: Partial<InsertClinicalGuideline>): Promise<ClinicalGuideline | undefined> {
    const guideline = await this.getClinicalGuideline(id);
    if (!guideline) return undefined;

    const updatedGuideline = { ...guideline, ...guidelineData };
    this.clinicalGuidelines.set(id, updatedGuideline);
    return updatedGuideline;
  }

  async getAllClinicalGuidelines(): Promise<ClinicalGuideline[]> {
    return Array.from(this.clinicalGuidelines.values());
  }

  async getClinicalGuidelinesByCategory(category: string): Promise<ClinicalGuideline[]> {
    return Array.from(this.clinicalGuidelines.values()).filter(
      (guideline) => guideline.category === category
    );
  }
  
  async getActiveClinicalGuidelines(): Promise<ClinicalGuideline[]> {
    return Array.from(this.clinicalGuidelines.values()).filter(
      (guideline) => guideline.status === "active"
    );
  }
  
  // Diagnostic Sessions
  async getDecisionSupportLog(id: number): Promise<DiagnosticSession | undefined> {
    return this.decisionSupportLogs.get(id);
  }

  async createDecisionSupportLog(log: InsertDiagnosticSession): Promise<DiagnosticSession> {
    const id = this.currentIds.decisionSupportLogs++;
    const createdAt = new Date();
    const newLog: DiagnosticSession = { ...log, id, createdAt };
    this.decisionSupportLogs.set(id, newLog);
    return newLog;
  }

  async getDecisionSupportLogsByPatient(patientId: number): Promise<DiagnosticSession[]> {
    return Array.from(this.decisionSupportLogs.values()).filter(
      (log) => log.patientId === patientId
    );
  }

  async getDecisionSupportLogsByDoctor(doctorId: number): Promise<DiagnosticSession[]> {
    return Array.from(this.decisionSupportLogs.values()).filter(
      (log) => log.doctorId === doctorId
    );
  }
  
  // Report Templates
  async getReportTemplate(id: number): Promise<ReportTemplate | undefined> {
    return this.reportTemplates.get(id);
  }

  async createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate> {
    const id = this.currentIds.reportTemplates++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newTemplate: ReportTemplate = { 
      ...template, 
      id, 
      createdAt,
      updatedAt
    };
    this.reportTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async updateReportTemplate(id: number, templateData: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined> {
    const template = await this.getReportTemplate(id);
    if (!template) return undefined;

    const updatedTemplate = { ...template, ...templateData };
    this.reportTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async getAllReportTemplates(): Promise<ReportTemplate[]> {
    return Array.from(this.reportTemplates.values());
  }

  async getReportTemplatesByCategory(category: string): Promise<ReportTemplate[]> {
    return Array.from(this.reportTemplates.values()).filter(
      (template) => template.category === category
    );
  }

  async getReportTemplatesByUser(userId: number): Promise<ReportTemplate[]> {
    return Array.from(this.reportTemplates.values()).filter(
      (template) => template.createdBy === userId
    );
  }

  async getSystemReportTemplates(): Promise<ReportTemplate[]> {
    return Array.from(this.reportTemplates.values()).filter(
      (template) => template.isSystem === true
    );
  }

  // Report Executions
  async getReportExecution(id: number): Promise<ReportExecution | undefined> {
    return this.reportExecutions.get(id);
  }
  
  // Treatments
  async getTreatment(id: number): Promise<Treatment | undefined> {
    return this.treatments.get(id);
  }

  async createTreatment(treatment: InsertTreatment): Promise<Treatment> {
    const id = this.currentIds.treatments++;
    const createdAt = new Date();
    const newTreatment: Treatment = { ...treatment, id, createdAt };
    this.treatments.set(id, newTreatment);
    return newTreatment;
  }

  async updateTreatment(id: number, treatmentData: Partial<InsertTreatment>): Promise<Treatment | undefined> {
    const treatment = await this.getTreatment(id);
    if (!treatment) return undefined;

    const updatedTreatment = { ...treatment, ...treatmentData };
    this.treatments.set(id, updatedTreatment);
    return updatedTreatment;
  }

  async getTreatmentsByPatient(patientId: number): Promise<Treatment[]> {
    return Array.from(this.treatments.values()).filter(
      (treatment) => treatment.patientId === patientId
    );
  }

  async getTreatmentsByAdmission(admissionId: number): Promise<Treatment[]> {
    return Array.from(this.treatments.values()).filter(
      (treatment) => treatment.admissionId === admissionId
    );
  }

  async getActiveTreatments(): Promise<Treatment[]> {
    return Array.from(this.treatments.values()).filter(
      (treatment) => treatment.status === "active"
    );
  }
  
  // Medical Orders
  async getMedicalOrder(id: number): Promise<MedicalOrder | undefined> {
    return this.medicalOrders.get(id);
  }

  async createMedicalOrder(order: InsertMedicalOrder): Promise<MedicalOrder> {
    const id = this.currentIds.medicalOrders++;
    const createdAt = new Date();
    const newOrder: MedicalOrder = { ...order, id, createdAt };
    this.medicalOrders.set(id, newOrder);
    return newOrder;
  }

  async updateMedicalOrder(id: number, orderData: Partial<InsertMedicalOrder>): Promise<MedicalOrder | undefined> {
    const order = await this.getMedicalOrder(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, ...orderData };
    this.medicalOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getMedicalOrdersByPatient(patientId: number): Promise<MedicalOrder[]> {
    return Array.from(this.medicalOrders.values()).filter(
      (order) => order.patientId === patientId
    );
  }

  async getMedicalOrdersByAdmission(admissionId: number): Promise<MedicalOrder[]> {
    return Array.from(this.medicalOrders.values()).filter(
      (order) => order.admissionId === admissionId
    );
  }

  async getActiveMedicalOrders(): Promise<MedicalOrder[]> {
    return Array.from(this.medicalOrders.values()).filter(
      (order) => order.status === "active"
    );
  }
  
  // Order Results
  async getOrderResult(id: number): Promise<OrderResult | undefined> {
    return this.orderResults.get(id);
  }

  async createOrderResult(result: InsertOrderResult): Promise<OrderResult> {
    const id = this.currentIds.orderResults++;
    const createdAt = new Date();
    const newResult: OrderResult = { ...result, id, createdAt };
    this.orderResults.set(id, newResult);
    return newResult;
  }

  async updateOrderResult(id: number, resultData: Partial<InsertOrderResult>): Promise<OrderResult | undefined> {
    const result = await this.getOrderResult(id);
    if (!result) return undefined;

    const updatedResult = { ...result, ...resultData };
    this.orderResults.set(id, updatedResult);
    return updatedResult;
  }

  async getOrderResultsByOrder(orderId: number): Promise<OrderResult[]> {
    return Array.from(this.orderResults.values()).filter(
      (result) => result.orderId === orderId
    );
  }

  async createReportExecution(execution: InsertReportExecution): Promise<ReportExecution> {
    const id = this.currentIds.reportExecutions++;
    const executedAt = new Date();
    const status = execution.status || "completed";
    
    const newExecution: ReportExecution = { 
      ...execution,
      id,
      executedAt,
      status
    };
    
    this.reportExecutions.set(id, newExecution);
    return newExecution;
  }

  async updateReportExecution(id: number, executionData: Partial<InsertReportExecution>): Promise<ReportExecution | undefined> {
    const execution = await this.getReportExecution(id);
    if (!execution) return undefined;

    const updatedExecution = { ...execution, ...executionData };
    this.reportExecutions.set(id, updatedExecution);
    return updatedExecution;
  }

  async getReportExecutionsByTemplate(templateId: number): Promise<ReportExecution[]> {
    return Array.from(this.reportExecutions.values()).filter(
      (execution) => execution.templateId === templateId
    );
  }

  async getReportExecutionsByUser(userId: number): Promise<ReportExecution[]> {
    return Array.from(this.reportExecutions.values()).filter(
      (execution) => execution.executedBy === userId
    );
  }

  async getRecentReportExecutions(limit: number): Promise<ReportExecution[]> {
    return Array.from(this.reportExecutions.values())
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
      .slice(0, limit);
  }

  // Initialize sample data
  private async initializeData() {
    // Create pharmacy stores
    const mainPharmacy = await this.createPharmacyStore({
      name: "Main Pharmacy",
      type: "central",
      location: "Main Building, Floor 1",
      manager: 1,
      status: "active"
    });
    
    const wardPharmacy = await this.createPharmacyStore({
      name: "Ward Dispensary",
      type: "ward",
      location: "General Ward",
      manager: 3,
      status: "active"
    });
    
    const emergencyPharmacy = await this.createPharmacyStore({
      name: "Emergency Pharmacy",
      type: "emergency",
      location: "Emergency Department",
      manager: 1,
      status: "active"
    });
    
    // Create clinical guidelines
    await this.createClinicalGuideline({
      title: "Hypertension Management",
      category: "cardiology",
      content: "1. Initial evaluation includes BP measurement, medical history...\n2. First-line therapy includes thiazide diuretics...",
      version: "2.1",
      lastUpdated: new Date(),
      status: "active"
    });
    
    await this.createClinicalGuideline({
      title: "Diabetes Management",
      category: "endocrinology",
      content: "1. Initial evaluation includes blood glucose, HbA1c...\n2. First-line therapy includes metformin...",
      version: "3.0",
      lastUpdated: new Date(),
      status: "active"
    });
    
    // Create services
    const consultation = await this.createService({
      name: "General Consultation",
      category: "consultation",
      price: "150.00",
      duration: 30,
      requiresDoctor: true,
      requiresAppointment: true,
      status: "active",
      description: "Initial consultation with a general physician"
    });
    
    const labTest = await this.createService({
      name: "Complete Blood Count",
      category: "laboratory",
      price: "75.00",
      duration: 60,
      requiresDoctor: false,
      requiresAppointment: false,
      status: "active",
      description: "Complete blood count analysis"
    });
    
    const xray = await this.createService({
      name: "Chest X-Ray",
      category: "radiology",
      price: "250.00",
      duration: 30,
      requiresDoctor: false,
      requiresAppointment: true,
      status: "active",
      description: "Single view chest x-ray"
    });
    
    // Create service packages
    const checkupPackage = await this.createServicePackage({
      name: "Basic Health Checkup",
      description: "Complete health screening package including consultation and basic tests",
      discountPercentage: "10",
      status: "active"
    });
    
    // Add items to the package
    await this.createServicePackageItem({
      packageId: checkupPackage.id,
      serviceId: consultation.id,
      quantity: 1
    });
    
    await this.createServicePackageItem({
      packageId: checkupPackage.id,
      serviceId: labTest.id,
      quantity: 1
    });
    
    // Create vehicles
    const ambulance = await this.createVehicle({
      type: "ambulance",
      vehicleNumber: "AMB-001",
      model: "Toyota HiAce",
      year: 2022,
      fuelType: "diesel",
      capacity: 4,
      status: "available"
    });
    
    const patientTransport = await this.createVehicle({
      type: "transport",
      vehicleNumber: "PTU-001",
      model: "Honda Odyssey",
      year: 2021,
      fuelType: "petrol",
      capacity: 6,
      status: "available"
    });
    
    // Create accounting accounts
    const cashAccount = await this.createAccount({
      name: "Cash",
      type: "cash",
      category: "asset",
      accountNumber: "1001",
      balance: "10000.00",
      isActive: true
    });
    
    const bankAccount = await this.createAccount({
      name: "Bank Account",
      type: "bank",
      category: "asset",
      accountNumber: "1002",
      balance: "50000.00",
      isActive: true
    });
    
    const accountsReceivable = await this.createAccount({
      name: "Accounts Receivable",
      type: "accounts_receivable",
      category: "asset",
      accountNumber: "1200",
      balance: "25000.00",
      isActive: true
    });
    
    // Create POS terminals
    const mainCashier = await this.createPosTerminal({
      name: "Main Reception",
      location: "Main Building",
      terminalNumber: "POS-001",
      assignedTo: 1,
      status: "active"
    });
    
    const pharmacyPos = await this.createPosTerminal({
      name: "Pharmacy Counter",
      location: "Pharmacy",
      terminalNumber: "POS-002",
      assignedTo: 3,
      status: "active"
    });
    
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
