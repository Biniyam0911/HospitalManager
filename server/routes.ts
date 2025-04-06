import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertUserSchema,
  insertPatientSchema,
  insertAppointmentSchema,
  insertMedicalRecordSchema,
  insertBedSchema,
  insertWardSchema,
  insertAdmissionSchema,
  insertInventoryItemSchema,
  insertBillSchema,
  insertBillItemSchema,
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup session
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: "hospital-erp-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }
        
        // In a real app, you would hash and compare passwords
        if (user.password !== password) {
          return done(null, false, { message: "Invalid credentials" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Helper function for error handling
  const handleZodError = (error: any) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return { message: validationError.message };
    }
    return { message: error.message || "Internal server error" };
  };

  // Auth Routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      // Don't send the password to the client
      const { password, ...user } = req.user as any;
      res.json({ authenticated: true, user });
    } else {
      res.json({ authenticated: false });
    }
  });

  // User Routes
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords to client
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Patient Routes
  app.get("/api/patients", requireAuth, async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/patients/recent", requireAuth, async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 5;
      const patients = await storage.getRecentPatients(limit);
      res.json(patients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/patients", requireAuth, async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.patch("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const patientData = req.body;
      const patient = await storage.updatePatient(id, patientData);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Appointment Routes
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/appointments/today", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getTodayAppointments();
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.patch("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const appointmentData = req.body;
      const appointment = await storage.updateAppointment(id, appointmentData);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Medical Record Routes
  app.get("/api/medical-records/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);
      const records = await storage.getMedicalRecordsByPatient(patientId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/medical-records", requireAuth, async (req, res) => {
    try {
      const recordData = insertMedicalRecordSchema.parse(req.body);
      const record = await storage.createMedicalRecord(recordData);
      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Bed Routes
  app.get("/api/beds", requireAuth, async (req, res) => {
    try {
      const beds = await storage.getAllBeds();
      res.json(beds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/beds/available", requireAuth, async (req, res) => {
    try {
      const beds = await storage.getAvailableBeds();
      res.json(beds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/beds/ward/:wardId", requireAuth, async (req, res) => {
    try {
      const wardId = Number(req.params.wardId);
      const beds = await storage.getBedsByWard(wardId);
      res.json(beds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/beds", requireAuth, async (req, res) => {
    try {
      const bedData = insertBedSchema.parse(req.body);
      const bed = await storage.createBed(bedData);
      res.status(201).json(bed);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.patch("/api/beds/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const bedData = req.body;
      const bed = await storage.updateBed(id, bedData);
      if (!bed) {
        return res.status(404).json({ message: "Bed not found" });
      }
      res.json(bed);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Ward Routes
  app.get("/api/wards", requireAuth, async (req, res) => {
    try {
      const wards = await storage.getAllWards();
      res.json(wards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wards", requireAuth, async (req, res) => {
    try {
      const wardData = insertWardSchema.parse(req.body);
      const ward = await storage.createWard(wardData);
      res.status(201).json(ward);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Admission Routes
  app.get("/api/admissions", requireAuth, async (req, res) => {
    try {
      const admissions = await storage.getActiveAdmissions();
      res.json(admissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admissions/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);
      const admissions = await storage.getAdmissionsByPatient(patientId);
      res.json(admissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admissions", requireAuth, async (req, res) => {
    try {
      const admissionData = insertAdmissionSchema.parse(req.body);
      const admission = await storage.createAdmission(admissionData);
      res.status(201).json(admission);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.patch("/api/admissions/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const admissionData = req.body;
      const admission = await storage.updateAdmission(id, admissionData);
      if (!admission) {
        return res.status(404).json({ message: "Admission not found" });
      }
      res.json(admission);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Inventory Routes
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const items = await storage.getAllInventoryItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/low-stock", requireAuth, async (req, res) => {
    try {
      const items = await storage.getLowStockItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/inventory", requireAuth, async (req, res) => {
    try {
      const itemData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.patch("/api/inventory/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const itemData = req.body;
      const item = await storage.updateInventoryItem(id, itemData);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Billing Routes
  app.get("/api/bills", requireAuth, async (req, res) => {
    try {
      const bills = await storage.getPendingBills();
      res.json(bills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bills/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);
      const bills = await storage.getBillsByPatient(patientId);
      res.json(bills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bills/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const bill = await storage.getBill(id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      // Get the bill items
      const items = await storage.getBillItemsByBill(id);
      
      res.json({ ...bill, items });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bills", requireAuth, async (req, res) => {
    try {
      const billData = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(billData);
      res.status(201).json(bill);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.patch("/api/bills/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const billData = req.body;
      const bill = await storage.updateBill(id, billData);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json(bill);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Bill Items Routes
  app.post("/api/bill-items", requireAuth, async (req, res) => {
    try {
      const itemData = insertBillItemSchema.parse(req.body);
      const item = await storage.createBillItem(itemData);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.get("/api/bill-items/:billId", requireAuth, async (req, res) => {
    try {
      const billId = Number(req.params.billId);
      const items = await storage.getBillItemsByBill(billId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard Stats
  app.get("/api/dashboard-stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Resource Utilization
  app.get("/api/resource-utilization", requireAuth, async (req, res) => {
    try {
      const utilization = await storage.getResourceUtilization();
      res.json(utilization);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
