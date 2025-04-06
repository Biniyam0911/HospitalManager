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

// Inventory Items
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // medicine, equipment, supplies
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull(), // box, piece, bottle, etc.
  reorderLevel: integer("reorder_level").notNull(),
  location: text("location").notNull(), // warehouse, pharmacy, etc.
  cost: numeric("cost").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
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

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;

export type BillItem = typeof billItems.$inferSelect;
export type InsertBillItem = z.infer<typeof insertBillItemSchema>;

export type DashboardStat = typeof dashboardStats.$inferSelect;
export type InsertDashboardStat = z.infer<typeof insertDashboardStatSchema>;

export type ResourceUtilization = typeof resourceUtilization.$inferSelect;
export type InsertResourceUtilization = z.infer<typeof insertResourceUtilizationSchema>;
