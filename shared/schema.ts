import { pgTable, varchar, integer, timestamp, boolean, jsonb, numeric, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User & Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  specialty: varchar("specialty", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Patients
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: varchar("patient_id", { length: 50 }).notNull().unique().default(() => `P-${Math.floor(Math.random() * 90000) + 10000}`),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: varchar("address", { length: 512 }),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 20 }),
  bloodType: varchar("blood_type", { length: 10 }),
  status: varchar("status", { length: 20 }).notNull().default("active"),
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
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"),
  notes: varchar("notes", { length: 1000 }),
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
  bedNumber: varchar("bed_number", { length: 50 }).notNull().unique(),
  wardId: integer("ward_id").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("available"), // available, occupied, maintenance
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBedSchema = createInsertSchema(beds).omit({
  id: true,
  createdAt: true,
});

// Wards
export const wards = pgTable("wards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // general, intensive care, pediatric, etc.
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
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, discharged
  deposit: numeric("deposit", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdmissionSchema = createInsertSchema(admissions).omit({
  id: true,
  createdAt: true,
});

// Pharmacy Stores
export const pharmacyStores = pgTable("pharmacy_stores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  location: varchar("location", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // main, satellite, emergency, outpatient
  manager: integer("manager").notNull(), // user ID of the pharmacy manager
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, inactive, under maintenance
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPharmacyStoreSchema = createInsertSchema(pharmacyStores).omit({
  id: true,
  createdAt: true,
});

// Inventory Items
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // medicine, equipment, supplies
  storeId: integer("store_id"), // optional relation to pharmacy store
  quantity: integer("quantity").notNull().default(0),
  unit: varchar("unit", { length: 50 }).notNull(), // box, piece, bottle, etc.
  reorderLevel: integer("reorder_level").notNull(),
  location: varchar("location", { length: 255 }).notNull(), // warehouse, pharmacy, etc.
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  expiryDate: timestamp("expiry_date"), // for medicines
  batchNumber: varchar("batch_number", { length: 100 }), // for medicines
  manufacturer: varchar("manufacturer", { length: 255 }),
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
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, completed, cancelled
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
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, paid, partial
  billDate: timestamp("bill_date").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  paymentMethod: varchar("payment_method", { length: 100 }), // cash, card, insurance
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }), // Stripe payment intent ID
  stripePaymentStatus: varchar("stripe_payment_status", { length: 100 }), // Stripe payment status
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
  description: varchar("description", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
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
  todayRevenue: numeric("today_revenue", { precision: 10, scale: 2 }).notNull(),
  patientGrowth: numeric("patient_growth", { precision: 10, scale: 2 }).notNull(),
  appointmentChange: numeric("appointment_change", { precision: 10, scale: 2 }).notNull(),
  revenueGrowth: numeric("revenue_growth", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertDashboardStatSchema = createInsertSchema(dashboardStats).omit({
  id: true,
});

// Resource Utilization
export const resourceUtilization = pgTable("resource_utilization", {
  id: serial("id").primaryKey(),
  bedUtilization: numeric("bed_utilization", { precision: 10, scale: 2 }).notNull(),
  staffAllocation: numeric("staff_allocation", { precision: 10, scale: 2 }).notNull(),
  emergencyCapacity: numeric("emergency_capacity", { precision: 10, scale: 2 }).notNull(),
  operatingRoomUsage: numeric("operating_room_usage", { precision: 10, scale: 2 }).notNull(),
  pharmacyInventory: numeric("pharmacy_inventory", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertResourceUtilizationSchema = createInsertSchema(resourceUtilization).omit({
  id: true,
});

// Service Management
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // consultation, procedure, test, etc.
  description: text("description"),
  duration: integer("duration"), // in minutes
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, inactive
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
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
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
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, inactive
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
  vehicleNumber: varchar("vehicle_number", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // ambulance, delivery, staff transport
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  capacity: integer("capacity"), // number of passengers
  status: varchar("status", { length: 50 }).notNull().default("available"), // available, in-use, maintenance
  fuelType: varchar("fuel_type", { length: 50 }).notNull(),
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
  purpose: varchar("purpose", { length: 255 }).notNull(),
  patientId: integer("patient_id"), // optional, for ambulance services
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, in-progress, completed, cancelled
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
  accountNumber: varchar("account_number", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // asset, liability, equity, revenue, expense
  category: varchar("category", { length: 100 }).notNull(), // cash, bank, receivable, payable, etc.
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
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
  reference: varchar("reference", { length: 100 }).notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // debit, credit
  accountId: integer("account_id").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
  createdBy: integer("created_by").notNull(), // user ID
  approvedBy: integer("approved_by"), // user ID
  relatedEntityType: varchar("related_entity_type", { length: 100 }), // bill, service_order, etc.
  relatedEntityId: integer("related_entity_id"), // the ID of the related entity
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Service Orders
export const serviceOrders = pgTable("service_orders", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id"), // optional for self-service orders
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, cancelled
  notes: text("notes"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }),
  billId: integer("bill_id"), // link to the bill
  createdBy: integer("created_by").notNull(), // user ID who created the order
  orderDate: timestamp("order_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({
  id: true,
  createdAt: true,
});

// Service Order Items
export const serviceOrderItems = pgTable("service_order_items", {
  id: serial("id").primaryKey(),
  serviceOrderId: integer("service_order_id").notNull(),
  serviceId: integer("service_id").notNull(),
  servicePriceVersionId: integer("service_price_version_id").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, cancelled
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceOrderItemSchema = createInsertSchema(serviceOrderItems).omit({
  id: true,
  createdAt: true,
});

// POS Terminals
export const posTerminals = pgTable("pos_terminals", {
  id: serial("id").primaryKey(),
  terminalId: varchar("terminal_id", { length: 100 }).notNull().unique(),
  location: varchar("location", { length: 255 }).notNull(),
  assignedTo: integer("assigned_to").notNull(), // user ID
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, inactive, maintenance
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPosTerminalSchema = createInsertSchema(posTerminals).omit({
  id: true,
  createdAt: true,
});

// POS Transactions
export const posTransactions = pgTable("pos_transactions", {
  id: serial("id").primaryKey(),
  transactionNumber: varchar("transaction_number", { length: 100 }).notNull().unique(),
  terminalId: integer("terminal_id").notNull(),
  cashierId: integer("cashier_id").notNull(), // user ID of cashier
  patientId: integer("patient_id"), // optional patient reference
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }),
  netAmount: numeric("net_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }).notNull(), // cash, card, insurance
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("completed"), // completed, refunded, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPosTransactionSchema = createInsertSchema(posTransactions).omit({
  id: true,
  createdAt: true,
});

// POS Transaction Items
export const posTransactionItems = pgTable("pos_transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  itemId: integer("item_id").notNull(), // inventory item or service ID
  itemType: varchar("item_type", { length: 50 }).notNull(), // inventory_item, service
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPosTransactionItemSchema = createInsertSchema(posTransactionItems).omit({
  id: true,
  createdAt: true,
});

// Clinical Guidelines
export const clinicalGuidelines = pgTable("clinical_guidelines", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  condition: varchar("condition", { length: 255 }).notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  assessment: text("assessment").notNull(),
  recommendedActions: jsonb("recommended_actions").notNull(),
  evidenceLevel: varchar("evidence_level", { length: 50 }).notNull(),
  publishDate: timestamp("publish_date").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClinicalGuidelineSchema = createInsertSchema(clinicalGuidelines).omit({
  id: true,
  createdAt: true,
});

// Diagnostic Sessions
export const diagnosticSessions = pgTable("diagnostic_sessions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  symptoms: jsonb("symptoms").notNull(),
  suggestedDiagnosis: jsonb("suggested_diagnosis").notNull(),
  confidence: varchar("confidence", { length: 50 }).notNull(),
  guidelineId: integer("guideline_id"), // reference to the clinical guideline
  doctorFeedback: text("doctor_feedback"),
  finalDiagnosis: text("final_diagnosis"),
  wasHelpful: boolean("was_helpful"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDiagnosticSessionSchema = createInsertSchema(diagnosticSessions).omit({
  id: true,
  createdAt: true,
});

// Report Templates
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  config: jsonb("config").notNull(), // JSON configuration for the report
  createdBy: integer("created_by").notNull(),
  isSystem: boolean("is_system").default(false),
  updatedAt: timestamp("updated_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Report Executions
export const reportExecutions = pgTable("report_executions", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  executedBy: integer("executed_by").notNull(),
  executedAt: timestamp("executed_at").notNull(),
  resultData: jsonb("result_data"),
  parameters: jsonb("parameters"),
  status: varchar("status", { length: 50 }).notNull(),
});

export const insertReportExecutionSchema = createInsertSchema(reportExecutions).omit({
  id: true,
});

// Treatment Plans
export const treatmentPlans = pgTable("treatment_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  notes: text("notes"),
  admissionId: integer("admission_id"), // optional link to admission
  frequency: varchar("frequency", { length: 100 }), // daily, weekly, monthly, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTreatmentPlanSchema = createInsertSchema(treatmentPlans).omit({
  id: true,
  createdAt: true,
});

// Medical Orders
export const medicalOrders = pgTable("medical_orders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  orderType: varchar("order_type", { length: 100 }).notNull(), // medication, lab, radiology, procedure
  itemId: integer("item_id"), // link to inventory item for medication
  orderDate: timestamp("order_date").defaultNow().notNull(),
  startDate: timestamp("start_date").notNull(),
  duration: integer("duration"), // in days
  status: varchar("status", { length: 50 }).notNull().default("ordered"),
  notes: text("notes"),
  instructions: text("instructions"),
  dosage: varchar("dosage", { length: 100 }),
  route: varchar("route", { length: 100 }),
  frequency: varchar("frequency", { length: 100 }),
  priority: varchar("priority", { length: 50 }).notNull().default("routine"), // STAT, routine, urgent
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicalOrderSchema = createInsertSchema(medicalOrders).omit({
  id: true,
  createdAt: true,
});

// Order Results
export const orderResults = pgTable("order_results", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  performedBy: integer("performed_by").notNull(),
  resultDate: timestamp("result_date"),
  resultText: text("result_text"),
  resultData: jsonb("result_data"),
  reviewedBy: integer("reviewed_by"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderResultSchema = createInsertSchema(orderResults).omit({
  id: true,
  createdAt: true,
});

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

export type DashboardStat = typeof dashboardStats.$inferSelect;
export type InsertDashboardStat = z.infer<typeof insertDashboardStatSchema>;

export type ResourceUtilization = typeof resourceUtilization.$inferSelect;
export type InsertResourceUtilization = z.infer<typeof insertResourceUtilizationSchema>;

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

export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;

export type ServiceOrderItem = typeof serviceOrderItems.$inferSelect;
export type InsertServiceOrderItem = z.infer<typeof insertServiceOrderItemSchema>;

export type PosTerminal = typeof posTerminals.$inferSelect;
export type InsertPosTerminal = z.infer<typeof insertPosTerminalSchema>;

export type PosTransaction = typeof posTransactions.$inferSelect;
export type InsertPosTransaction = z.infer<typeof insertPosTransactionSchema>;

export type PosTransactionItem = typeof posTransactionItems.$inferSelect;
export type InsertPosTransactionItem = z.infer<typeof insertPosTransactionItemSchema>;

export type ClinicalGuideline = typeof clinicalGuidelines.$inferSelect;
export type InsertClinicalGuideline = z.infer<typeof insertClinicalGuidelineSchema>;

export type DiagnosticSession = typeof diagnosticSessions.$inferSelect;
export type InsertDiagnosticSession = z.infer<typeof insertDiagnosticSessionSchema>;

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;

export type ReportExecution = typeof reportExecutions.$inferSelect;
export type InsertReportExecution = z.infer<typeof insertReportExecutionSchema>;

export type TreatmentPlan = typeof treatmentPlans.$inferSelect;
export type InsertTreatmentPlan = z.infer<typeof insertTreatmentPlanSchema>;

export type MedicalOrder = typeof medicalOrders.$inferSelect;
export type InsertMedicalOrder = z.infer<typeof insertMedicalOrderSchema>;

export type OrderResult = typeof orderResults.$inferSelect;
export type InsertOrderResult = z.infer<typeof insertOrderResultSchema>;

// Laboratory Systems Integration
export const labSystems = pgTable("lab_systems", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  apiUrl: varchar("api_url", { length: 512 }).notNull(),
  apiKey: varchar("api_key", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  connectionType: varchar("connection_type", { length: 50 }).notNull(), // REST, HL7, FHIR, etc.
  lastSyncAt: timestamp("last_sync_at"),
  syncFrequency: integer("sync_frequency").default(60), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  configuration: jsonb("configuration"), // Additional configuration options
  notes: text("notes"),
});

export const insertLabSystemSchema = createInsertSchema(labSystems).omit({
  id: true,
  createdAt: true,
  lastSyncAt: true,
});

export type LabSystem = typeof labSystems.$inferSelect;
export type InsertLabSystem = z.infer<typeof insertLabSystemSchema>;

// Lab Results
export const labResults = pgTable("lab_results", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  orderId: integer("order_id"),
  labSystemId: integer("lab_system_id").notNull(),
  externalId: varchar("external_id", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  resultData: jsonb("result_data"),
  resultDate: timestamp("result_date"),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),
  testType: varchar("test_type", { length: 255 }).notNull(),
  testName: varchar("test_name", { length: 255 }).notNull(),
  normalRanges: jsonb("normal_ranges"),
  criticalFlag: boolean("critical_flag").default(false),
  pdfUrl: varchar("pdf_url", { length: 512 }),
});

export const insertLabResultSchema = createInsertSchema(labResults).omit({
  id: true,
  receivedAt: true,
});

export type LabResult = typeof labResults.$inferSelect;
export type InsertLabResult = z.infer<typeof insertLabResultSchema>;

// Lab Result Sync Logs
export const labSyncLogs = pgTable("lab_sync_logs", {
  id: serial("id").primaryKey(),
  labSystemId: integer("lab_system_id").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  status: varchar("status", { length: 20 }).notNull().default("in_progress"),
  totalRecords: integer("total_records").default(0),
  successCount: integer("success_count").default(0),
  errorCount: integer("error_count").default(0),
  errorDetails: jsonb("error_details"),
  notes: text("notes"),
});

export const insertLabSyncLogSchema = createInsertSchema(labSyncLogs).omit({
  id: true,
  startedAt: true,
});

export type LabSyncLog = typeof labSyncLogs.$inferSelect;
export type InsertLabSyncLog = z.infer<typeof insertLabSyncLogSchema>;

// Credit Companies
export const creditCompanies = pgTable("credit_companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: varchar("address", { length: 512 }),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  discountPercentage: numeric("discount_percentage"),
  paymentTerms: varchar("payment_terms", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCreditCompanySchema = createInsertSchema(creditCompanies).omit({
  id: true,
  createdAt: true,
});

export type CreditCompany = typeof creditCompanies.$inferSelect;
export type InsertCreditCompany = z.infer<typeof insertCreditCompanySchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
// Dialysis Units
export const dialysisUnits = pgTable("dialysis_units", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  capacity: integer("capacity").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDialysisUnitSchema = createInsertSchema(dialysisUnits).omit({
  id: true,
  createdAt: true,
});

// Dialysis Sessions
export const dialysisSessions = pgTable("dialysis_sessions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  unitId: integer("unit_id").notNull(),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  type: varchar("type", { length: 50 }).notNull(), // inpatient, outpatient
  status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, in-progress, completed, cancelled
  nurseNotes: text("nurse_notes"),
  preWeight: numeric("pre_weight", { precision: 5, scale: 2 }),
  postWeight: numeric("post_weight", { precision: 5, scale: 2 }),
  bpBefore: varchar("bp_before", { length: 20 }),
  bpAfter: varchar("bp_after", { length: 20 }),
  complications: text("complications"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDialysisSessionSchema = createInsertSchema(dialysisSessions).omit({
  id: true,
  createdAt: true,
});

// Emergency Cases
export const emergencyCases = pgTable("emergency_cases", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  triageLevel: varchar("triage_level", { length: 50 }).notNull(), // red, yellow, green
  chiefComplaint: text("chief_complaint").notNull(),
  arrivalMode: varchar("arrival_mode", { length: 50 }).notNull(), // ambulance, walk-in, transfer
  assignedDoctorId: integer("assigned_doctor_id"),
  status: varchar("status", { length: 50 }).notNull().default("waiting"), // waiting, in-progress, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmergencyCaseSchema = createInsertSchema(emergencyCases).omit({
  id: true,
  createdAt: true,
});

export type EmergencyCase = typeof emergencyCases.$inferSelect;
export type InsertEmergencyCase = z.infer<typeof insertEmergencyCaseSchema>;



// HR Management
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  joinDate: timestamp("join_date").notNull(),
  salary: numeric("salary", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  emergencyPhone: varchar("emergency_phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // sick, vacation, personal
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  reason: text("reason"),
  approvedBy: integer("approved_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeaveSchema = createInsertSchema(leaves).omit({
  id: true,
  createdAt: true,
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
