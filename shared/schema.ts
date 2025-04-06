import { pgTable, text, serial, integer, timestamp, boolean, json, numeric, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User & Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  specialty: text("specialty"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Patients
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  bloodType: text("blood_type"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  type: text("type").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

// Medical Records (SOAP format)
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  subjective: text("subjective"), // Patient's symptoms and concerns
  objective: text("objective"), // Clinical observations
  assessment: text("assessment"), // Diagnosis
  plan: text("plan"), // Treatment plan
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  createdAt: true,
});

// Beds
export const beds = pgTable("beds", {
  id: serial("id").primaryKey(),
  bedNumber: text("bed_number").notNull().unique(),
  wardId: integer("ward_id").notNull(),
  status: text("status").notNull().default("available"), // available, occupied, maintenance
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBedSchema = createInsertSchema(beds).omit({
  id: true,
  createdAt: true,
});

// Wards
export const wards = pgTable("wards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // general, intensive care, pediatric, etc.
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWardSchema = createInsertSchema(wards).omit({
  id: true,
  createdAt: true,
});

// Admissions
export const admissions = pgTable("admissions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  bedId: integer("bed_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  admissionDate: timestamp("admission_date").notNull(),
  dischargeDate: timestamp("discharge_date"),
  diagnosis: text("diagnosis"),
  status: text("status").notNull().default("active"), // active, discharged
  deposit: numeric("deposit").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdmissionSchema = createInsertSchema(admissions).omit({
  id: true,
  createdAt: true,
});

// Pharmacy Stores
export const pharmacyStores = pgTable("pharmacy_stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  location: text("location").notNull(),
  type: text("type").notNull(), // main, satellite, emergency, outpatient
  manager: integer("manager").notNull(), // user ID of the pharmacy manager
  status: text("status").notNull().default("active"), // active, inactive, under maintenance
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPharmacyStoreSchema = createInsertSchema(pharmacyStores).omit({
  id: true,
  createdAt: true,
});

// Inventory Items
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // medicine, equipment, supplies
  storeId: integer("store_id"), // optional relation to pharmacy store
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull(), // box, piece, bottle, etc.
  reorderLevel: integer("reorder_level").notNull(),
  location: text("location").notNull(), // warehouse, pharmacy, etc.
  cost: numeric("cost").notNull(),
  expiryDate: timestamp("expiry_date"), // for medicines
  batchNumber: text("batch_number"), // for medicines
  manufacturer: text("manufacturer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
});

// Inventory Transfers (between stores)
export const inventoryTransfers = pgTable("inventory_transfers", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  sourceStoreId: integer("source_store_id").notNull(),
  destinationStoreId: integer("destination_store_id").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  transferDate: timestamp("transfer_date").defaultNow().notNull(),
  completedDate: timestamp("completed_date"),
  initiatedBy: integer("initiated_by").notNull(), // user ID
  approvedBy: integer("approved_by"), // user ID
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryTransferSchema = createInsertSchema(inventoryTransfers).omit({
  id: true,
  createdAt: true,
});

// Billing
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  paidAmount: numeric("paid_amount").notNull().default("0"),
  status: text("status").notNull().default("pending"), // pending, paid, partial
  billDate: timestamp("bill_date").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  paymentMethod: text("payment_method"), // cash, card, insurance
  stripePaymentIntentId: text("stripe_payment_intent_id"), // Stripe payment intent ID
  stripePaymentStatus: text("stripe_payment_status"), // Stripe payment status
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
});

// Bill Items
export const billItems = pgTable("bill_items", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price").notNull(),
  totalPrice: numeric("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBillItemSchema = createInsertSchema(billItems).omit({
  id: true,
  createdAt: true,
});

// Dashboard Stats
export const dashboardStats = pgTable("dashboard_stats", {
  id: serial("id").primaryKey(),
  totalPatients: integer("total_patients").notNull(),
  todayAppointments: integer("today_appointments").notNull(),
  availableBeds: integer("available_beds").notNull(),
  totalBeds: integer("total_beds").notNull(),
  todayRevenue: numeric("today_revenue").notNull(),
  patientGrowth: numeric("patient_growth").notNull(),
  appointmentChange: numeric("appointment_change").notNull(),
  revenueGrowth: numeric("revenue_growth").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertDashboardStatSchema = createInsertSchema(dashboardStats).omit({
  id: true,
});

// Resource Utilization
export const resourceUtilization = pgTable("resource_utilization", {
  id: serial("id").primaryKey(),
  bedUtilization: numeric("bed_utilization").notNull(),
  staffAllocation: numeric("staff_allocation").notNull(),
  emergencyCapacity: numeric("emergency_capacity").notNull(),
  operatingRoomUsage: numeric("operating_room_usage").notNull(),
  pharmacyInventory: numeric("pharmacy_inventory").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertResourceUtilizationSchema = createInsertSchema(resourceUtilization).omit({
  id: true,
});

// Service Management
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // consultation, procedure, test, etc.
  description: text("description"),
  duration: integer("duration"), // in minutes
  status: text("status").notNull().default("active"), // active, inactive
  requiresDoctor: boolean("requires_doctor").default(false),
  requiresAppointment: boolean("requires_appointment").default(false),
  taxable: boolean("taxable").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

// Service Price Versions - to track price changes over time
export const servicePriceVersions = pgTable("service_price_versions", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  price: numeric("price").notNull(),
  effectiveDate: timestamp("effective_date").notNull(), // When this price becomes effective
  expiryDate: timestamp("expiry_date"), // When this price expires (null if current)
  year: integer("year").notNull(), // The year this price is for
  notes: text("notes"), // Any notes about this price change
  createdBy: integer("created_by").notNull(), // User who created this price version
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServicePriceVersionSchema = createInsertSchema(servicePriceVersions).omit({
  id: true,
  createdAt: true,
});

// Service Packages
export const servicePackages = pgTable("service_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  discountPercentage: numeric("discount_percentage").default("0"),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServicePackageSchema = createInsertSchema(servicePackages).omit({
  id: true,
  createdAt: true,
});

// Service Package Items
export const servicePackageItems = pgTable("service_package_items", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id").notNull(),
  serviceId: integer("service_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServicePackageItemSchema = createInsertSchema(servicePackageItems).omit({
  id: true,
  createdAt: true,
});

// Fleet Management
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  type: text("type").notNull(), // ambulance, delivery, staff transport
  model: text("model").notNull(),
  year: integer("year").notNull(),
  capacity: integer("capacity"), // number of passengers
  status: text("status").notNull().default("available"), // available, in-use, maintenance
  fuelType: text("fuel_type").notNull(),
  lastMaintenance: timestamp("last_maintenance"),
  nextMaintenance: timestamp("next_maintenance"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

// Vehicle Assignments
export const vehicleAssignments = pgTable("vehicle_assignments", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  assignedTo: integer("assigned_to").notNull(), // user ID of driver
  purpose: text("purpose").notNull(),
  patientId: integer("patient_id"), // optional, for ambulance services
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("scheduled"), // scheduled, in-progress, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVehicleAssignmentSchema = createInsertSchema(vehicleAssignments).omit({
  id: true,
  createdAt: true,
});

// Accounting Module
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  accountNumber: text("account_number").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // asset, liability, equity, revenue, expense
  category: text("category").notNull(), // cash, bank, receivable, payable, etc.
  balance: numeric("balance").notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionDate: timestamp("transaction_date").notNull(),
  reference: text("reference").notNull(),
  description: text("description"),
  amount: numeric("amount").notNull(),
  type: text("type").notNull(), // debit, credit
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: integer("approved_by"), // user ID
  createdBy: integer("created_by").notNull(), // user ID
  accountId: integer("account_id").notNull(),
  relatedEntityType: text("related_entity_type"), // patient, supplier, etc.
  relatedEntityId: integer("related_entity_id"), // ID of the related entity
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Point of Sale
export const pos_terminals = pgTable("pos_terminals", {
  id: serial("id").primaryKey(),
  terminalId: text("terminal_id").notNull().unique(),
  location: text("location").notNull(), // pharmacy, cafeteria, etc.
  assignedTo: integer("assigned_to").notNull(), // user ID
  status: text("status").notNull().default("active"), // active, inactive, maintenance
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPosTerminalSchema = createInsertSchema(pos_terminals).omit({
  id: true,
  createdAt: true,
});

// POS Transactions
export const pos_transactions = pgTable("pos_transactions", {
  id: serial("id").primaryKey(),
  terminalId: integer("terminal_id").notNull(),
  transactionNumber: text("transaction_number").notNull().unique(),
  cashierId: integer("cashier_id").notNull(), // user ID
  patientId: integer("patient_id"), // optional
  totalAmount: numeric("total_amount").notNull(),
  discountAmount: numeric("discount_amount").default("0"),
  taxAmount: numeric("tax_amount").default("0"),
  netAmount: numeric("net_amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, card, insurance
  paymentStatus: text("payment_status").notNull().default("completed"), // completed, refunded, voided
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPosTransactionSchema = createInsertSchema(pos_transactions).omit({
  id: true,
  createdAt: true,
});

// POS Items
export const pos_items = pgTable("pos_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  itemId: integer("item_id").notNull(), // inventory item ID or service ID
  itemType: text("item_type").notNull(), // product, service
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  discount: numeric("discount").default("0"),
  taxRate: numeric("tax_rate").default("0"),
  subtotal: numeric("subtotal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPosItemSchema = createInsertSchema(pos_items).omit({
  id: true,
  createdAt: true,
});

// Treatments
export const treatments = pgTable("treatments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  admissionId: integer("admission_id"), // Optional, linked to inpatient admission
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  frequency: text("frequency"), // daily, twice daily, every 8 hours, etc.
  status: text("status").notNull().default("active"), // active, completed, discontinued
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTreatmentSchema = createInsertSchema(treatments).omit({
  id: true,
  createdAt: true,
});

// Medical Orders
export const medicalOrders = pgTable("medical_orders", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  admissionId: integer("admission_id"), // Optional, linked to inpatient admission
  orderType: text("order_type").notNull(), // medication, lab, imaging, procedure
  itemId: integer("item_id"), // ID of medication, lab test, etc.
  name: text("name").notNull(), // Name of the medication, test, etc.
  instructions: text("instructions"),
  dosage: text("dosage"), // For medications
  route: text("route"), // For medications: oral, IV, etc.
  orderDate: timestamp("order_date").defaultNow().notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("pending"), // pending, active, completed, cancelled
  priority: text("priority").notNull().default("routine"), // stat, urgent, routine
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicalOrderSchema = createInsertSchema(medicalOrders).omit({
  id: true,
  createdAt: true,
});

// Order Results (Lab/Imaging)
export const orderResults = pgTable("order_results", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  resultDate: timestamp("result_date").defaultNow().notNull(),
  resultText: text("result_text"),
  resultData: json("result_data"), // For structured results
  performedBy: integer("performed_by").notNull(), // user ID
  reviewedBy: integer("reviewed_by"), // user ID
  status: text("status").notNull().default("completed"), // completed, pending review, amended
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderResultSchema = createInsertSchema(orderResults).omit({
  id: true,
  createdAt: true,
});

// Decision Support System
export const clinical_guidelines = pgTable("clinical_guidelines", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  condition: text("condition").notNull(),
  assessment: text("assessment").notNull(),
  recommendedActions: json("recommended_actions").notNull(), // structured steps
  evidenceLevel: text("evidence_level").notNull(), // A, B, C, etc.
  source: text("source").notNull(),
  publishDate: timestamp("publish_date").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
  status: text("status").notNull().default("active"), // active, archived, draft
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClinicalGuidelineSchema = createInsertSchema(clinical_guidelines).omit({
  id: true,
  createdAt: true,
});

// AI-based decision support logs
export const decision_support_logs = pgTable("decision_support_logs", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  symptoms: json("symptoms").notNull(),
  suggestedDiagnosis: json("suggested_diagnosis").notNull(),
  confidence: numeric("confidence").notNull(), // 0-100
  guidelineId: integer("guideline_id"), // optional reference to clinical guidelines
  doctorFeedback: text("doctor_feedback"), // doctor's feedback on the suggestion
  finalDiagnosis: text("final_diagnosis"), // what the doctor actually diagnosed
  wasHelpful: boolean("was_helpful"), // if the suggestion was helpful to the doctor
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDecisionSupportLogSchema = createInsertSchema(decision_support_logs).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;

export type Bed = typeof beds.$inferSelect;
export type InsertBed = z.infer<typeof insertBedSchema>;

export type Ward = typeof wards.$inferSelect;
export type InsertWard = z.infer<typeof insertWardSchema>;

export type Admission = typeof admissions.$inferSelect;
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;

export type PharmacyStore = typeof pharmacyStores.$inferSelect;
export type InsertPharmacyStore = z.infer<typeof insertPharmacyStoreSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type InventoryTransfer = typeof inventoryTransfers.$inferSelect;
export type InsertInventoryTransfer = z.infer<typeof insertInventoryTransferSchema>;

export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;

export type BillItem = typeof billItems.$inferSelect;
export type InsertBillItem = z.infer<typeof insertBillItemSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type ServicePriceVersion = typeof servicePriceVersions.$inferSelect;
export type InsertServicePriceVersion = z.infer<typeof insertServicePriceVersionSchema>;

export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;

export type ServicePackageItem = typeof servicePackageItems.$inferSelect;
export type InsertServicePackageItem = z.infer<typeof insertServicePackageItemSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type VehicleAssignment = typeof vehicleAssignments.$inferSelect;
export type InsertVehicleAssignment = z.infer<typeof insertVehicleAssignmentSchema>;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type PosTerminal = typeof pos_terminals.$inferSelect;
export type InsertPosTerminal = z.infer<typeof insertPosTerminalSchema>;

export type PosTransaction = typeof pos_transactions.$inferSelect;
export type InsertPosTransaction = z.infer<typeof insertPosTransactionSchema>;

export type PosItem = typeof pos_items.$inferSelect;
export type InsertPosItem = z.infer<typeof insertPosItemSchema>;

export type ClinicalGuideline = typeof clinical_guidelines.$inferSelect;
export type InsertClinicalGuideline = z.infer<typeof insertClinicalGuidelineSchema>;

export type DecisionSupportLog = typeof decision_support_logs.$inferSelect;
export type InsertDecisionSupportLog = z.infer<typeof insertDecisionSupportLogSchema>;

export type DashboardStat = typeof dashboardStats.$inferSelect;
export type InsertDashboardStat = z.infer<typeof insertDashboardStatSchema>;

export type ResourceUtilization = typeof resourceUtilization.$inferSelect;
export type InsertResourceUtilization = z.infer<typeof insertResourceUtilizationSchema>;

// Custom Reports
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // financial, operational, clinical, inventory
  createdBy: integer("created_by").notNull(),
  isSystem: boolean("is_system").default(false),
  config: json("config").notNull(), // stores the report configuration (fields, filters, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const reportExecutions = pgTable("report_executions", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  executedBy: integer("executed_by").notNull(),
  parameters: json("parameters"), // stores the parameters used for this execution
  status: text("status").notNull().default("completed"), // in-progress, completed, failed
  resultData: json("result_data"), // stores the actual report data
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

export const insertReportExecutionSchema = createInsertSchema(reportExecutions).omit({
  id: true,
  executedAt: true,
});

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;

export type ReportExecution = typeof reportExecutions.$inferSelect;
export type InsertReportExecution = z.infer<typeof insertReportExecutionSchema>;

export type Treatment = typeof treatments.$inferSelect;
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;

export type MedicalOrder = typeof medicalOrders.$inferSelect;
export type InsertMedicalOrder = z.infer<typeof insertMedicalOrderSchema>;

export type OrderResult = typeof orderResults.$inferSelect;
export type InsertOrderResult = z.infer<typeof insertOrderResultSchema>;
