import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import Stripe from "stripe";
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
  insertTreatmentPlanSchema,
  insertMedicalOrderSchema,
  insertOrderResultSchema,
} from "@shared/schema.pg";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2023-10-16"
  });

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

  // Service Routes
  app.get("/api/services", requireAuth, async (req, res) => {
    try {
      if (req.query.active === 'true') {
        const services = await storage.getActiveServices();
        return res.json(services);
      }
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/services/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Get current price version
      const currentPriceVersion = await storage.getCurrentServicePriceVersion(id);

      res.json({
        ...service,
        currentPrice: currentPriceVersion
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/services", requireAuth, async (req, res) => {
    try {
      const serviceData = req.body;

      // Extract price data for price version creation
      const { price, effectiveDate, year, ...serviceInsertData } = serviceData;

      // Create the service first
      const newService = await storage.createService(serviceInsertData);

      // If price data is provided, create initial price version
      if (price) {
        const priceVersionData = {
          serviceId: newService.id,
          price: price.toString(),
          effectiveDate: effectiveDate || new Date(),
          year: year || new Date().getFullYear()
        };

        await storage.createServicePriceVersion(priceVersionData);
      }

      // Get the current price version after creating
      const currentPriceVersion = await storage.getCurrentServicePriceVersion(newService.id);

      res.status(201).json({
        ...newService,
        currentPrice: currentPriceVersion
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/services/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const serviceData = req.body;

      // Extract price data for price version update if provided
      const { price, effectiveDate, year, expiryDate, ...serviceUpdateData } = serviceData;

      // Update the service
      const updatedService = await storage.updateService(id, serviceUpdateData);
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }

      // If price data is provided, create a new price version
      let currentPriceVersion;
      if (price) {
        const priceVersionData = {
          serviceId: id,
          price: price.toString(),
          effectiveDate: effectiveDate || new Date(),
          year: year || new Date().getFullYear(),
          expiryDate: expiryDate || null
        };

        await storage.createServicePriceVersion(priceVersionData);
        currentPriceVersion = await storage.getCurrentServicePriceVersion(id);
      } else {
        currentPriceVersion = await storage.getCurrentServicePriceVersion(id);
      }

      res.json({
        ...updatedService,
        currentPrice: currentPriceVersion
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Service Price Version Routes
  app.get("/api/service-price-versions/service/:serviceId", requireAuth, async (req, res) => {
    try {
      const serviceId = Number(req.params.serviceId);
      const priceVersions = await storage.getServicePriceVersionsByService(serviceId);
      res.json(priceVersions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-price-versions/year/:year", requireAuth, async (req, res) => {
    try {
      const year = Number(req.params.year);
      const priceVersions = await storage.getServicePriceVersionsByYear(year);
      res.json(priceVersions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-price-versions/current/:serviceId", requireAuth, async (req, res) => {
    try {
      const serviceId = Number(req.params.serviceId);
      const priceVersion = await storage.getCurrentServicePriceVersion(serviceId);

      if (!priceVersion) {
        return res.status(404).json({ message: "No current price version found for this service" });
      }

      res.json(priceVersion);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-prices/:serviceId", requireAuth, async (req, res) => {
    try {
      const serviceId = Number(req.params.serviceId);
      const prices = await storage.getServicePrices(serviceId);
      res.json(prices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/service-price-versions", requireAuth, async (req, res) => {
    try {
      const priceVersionData = req.body;
      const newPriceVersion = await storage.createServicePriceVersion(priceVersionData);
      res.status(201).json(newPriceVersion);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Service Orders Routes
  app.get("/api/service-orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getAllServiceOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-orders/pending", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getPendingServiceOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getServiceOrder(Number(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Service order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/service-orders", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const createdBy = req.user.id;
      const order = await storage.createServiceOrder({ 
        ...req.body, 
        createdBy, 
        status: req.body.status || "pending",
        orderDate: new Date()
      });
      res.status(201).json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/service-orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.updateServiceOrder(Number(req.params.id), req.body);
      if (!order) {
        return res.status(404).json({ message: "Service order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-orders/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);
      const orders = await storage.getServiceOrdersByPatient(patientId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-orders/bill/:billId", requireAuth, async (req, res) => {
    try {
      const billId = Number(req.params.billId);
      const orders = await storage.getServiceOrdersByBill(billId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Service Order Items Routes
  app.get("/api/service-order-items/order/:serviceOrderId", requireAuth, async (req, res) => {
    try {
      const serviceOrderId = Number(req.params.serviceOrderId);
      const items = await storage.getServiceOrderItemsByOrder(serviceOrderId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/service-order-items", requireAuth, async (req, res) => {
    try {
      const item = await storage.createServiceOrderItem({
        ...req.body,
        status: req.body.status || "pending"
      });
      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/service-order-items/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.updateServiceOrderItem(Number(req.params.id), req.body);
      if (!item) {
        return res.status(404).json({ message: "Service order item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-order-items/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.getServiceOrderItem(Number(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Service order item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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

  // Payment Routes
  app.post("/api/confirm-payment", requireAuth, async (req, res) => {
    try {
      const { billId, amount } = req.body;

      if (!billId) {
        return res.status(400).json({ message: "Bill ID is required" });
      }

      // Fetch the bill
      const bill = await storage.getBill(Number(billId));
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      // Verify the bill is not paid
      if (bill.status === "Paid") {
        return res.status(400).json({ message: "Bill is already paid" });
      }

      const totalAmount = parseFloat(bill.totalAmount);
      const currentPaidAmount = bill.paidAmount ? parseFloat(bill.paidAmount) : 0;
      const newPaidAmount = currentPaidAmount + parseFloat(amount);

      // Update the bill
      const updatedBill = await storage.updateBill(bill.id, {
        paidAmount: newPaidAmount.toFixed(2),
        status: Math.abs(newPaidAmount - totalAmount) < 0.01 ? "Paid" : "Partial",
        paymentMethod: "Direct Payment",
      });

      res.json(updatedBill);
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to process payment" });
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

  // POS Terminals
  app.get("/api/pos/terminals", requireAuth, async (req, res) => {
    try {
      const terminals = await storage.getAllPosTerminals();
      res.json(terminals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/pos/terminals/active", requireAuth, async (req, res) => {
    try {
      const terminals = await storage.getActivePosTerminals();
      res.json(terminals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/pos/terminals/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const terminal = await storage.getPosTerminal(id);

      if (!terminal) {
        return res.status(404).json({ message: "Terminal not found" });
      }

      res.json(terminal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pos/terminals", requireAuth, async (req, res) => {
    try {
      const terminalData = req.body;
      const newTerminal = await storage.createPosTerminal(terminalData);
      res.status(201).json(newTerminal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/pos/terminals/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const terminalData = req.body;
      const updatedTerminal = await storage.updatePosTerminal(id, terminalData);

      if (!updatedTerminal) {
        return res.status(404).json({ message: "Terminal not found" });
      }

      res.json(updatedTerminal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // POS Transactions
  app.get("/api/pos/transactions", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (startDate && endDate) {
        const transactions = await storage.getPosTransactionsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
        return res.json(transactions);
      }

      // If terminalId is provided, filter by terminal
      if (req.query.terminalId) {
        const terminalId = parseInt(req.query.terminalId as string);
        const transactions = await storage.getPosTransactionsByTerminal(terminalId);
        return res.json(transactions);
      }

      // Default: return all transactions
      // This might be a heavy operation, so in a real system we would paginate
      const transactions = [];
      for (let i = 1; i <= 100; i++) {
        const transaction = await storage.getPosTransaction(i);
        if (transaction) {
          transactions.push(transaction);
        }
      }
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/pos/transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getPosTransaction(id);

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Also get the transaction items
      const items = await storage.getPosItemsByTransaction(id);

      res.json({
        ...transaction,
        items
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pos/transactions", requireAuth, async (req, res) => {
    try {
      const transactionData = req.body;
      const items = transactionData.items || [];
      delete transactionData.items;

      // Create the transaction first
      const newTransaction = await storage.createPosTransaction(transactionData);

      // Then create all the associated items
      const createdItems = [];
      for (const item of items) {
        const newItem = await storage.createPosItem({
          ...item,
          posTransactionId: newTransaction.id
        });
        createdItems.push(newItem);
      }

      res.status(201).json({
        ...newTransaction,
        items: createdItems
      });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/pos/transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transactionData = req.body;
      const updatedTransaction = await storage.updatePosTransaction(id, transactionData);

      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Get the items for the response
      const items = await storage.getPosItemsByTransaction(id);

      res.json({
        ...updatedTransaction,
        items
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Clinical Guidelines
  app.get("/api/clinical-guidelines", requireAuth, async (req, res) => {
    try {
      if (req.query.category) {
        const guidelines = await storage.getClinicalGuidelinesByCategory(req.query.category as string);
        return res.json(guidelines);
      }

      const guidelines = await storage.getAllClinicalGuidelines();
      res.json(guidelines);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/clinical-guidelines/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const guideline = await storage.getClinicalGuideline(id);

      if (!guideline) {
        return res.status(404).json({ message: "Guideline not found" });
      }

      res.json(guideline);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clinical-guidelines", requireAuth, async (req, res) => {
    try {
      const guidelineData = req.body;
      const newGuideline = await storage.createClinicalGuideline(guidelineData);
      res.status(201).json(newGuideline);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/clinical-guidelines/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const guidelineData = req.body;
      const updatedGuideline = await storage.updateClinicalGuideline(id, guidelineData);

      if (!updatedGuideline) {
        return res.status(404).json({ message: "Guideline not found" });
      }

      res.json(updatedGuideline);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Decision Support Logs
  app.get("/api/decision-support-logs", requireAuth, async (req, res) => {
    try {
      if (req.query.patientId) {
        const logs = await storage.getDecisionSupportLogsByPatient(parseInt(req.query.patientId as string));
        return res.json(logs);
      }

      if (req.query.doctorId) {
        const logs = await storage.getDecisionSupportLogsByDoctor(parseInt(req.query.doctorId as string));
        return res.json(logs);
      }

      res.status(400).json({ message: "Missing required query parameter: patientId or doctorId" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/decision-support-logs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const log = await storage.getDecisionSupportLog(id);

      if (!log) {
        return res.status(404).json({ message: "Decision support log not found" });
      }

      res.json(log);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/decision-support-logs", requireAuth, async (req, res) => {
    try {
      const logData = req.body;
      const newLog = await storage.createDecisionSupportLog(logData);
      res.status(201).json(newLog);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Report Templates
  app.get("/api/report-templates", requireAuth, async (req, res) => {
    try {
      const templates = await storage.getAllReportTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/report-templates/system", requireAuth, async (req, res) => {
    try {
      const templates = await storage.getSystemReportTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/report-templates/category/:category", requireAuth, async (req, res) => {
    try {
      const { category } = req.params;
      const templates = await storage.getReportTemplatesByCategory(category);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/report-templates/user/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const templates = await storage.getReportTemplatesByUser(userId);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/report-templates/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      const template = await storage.getReportTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Report template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/report-templates", requireAuth, async (req, res) => {
    try {
      const templateData = req.body;
      // Set the user who created the template
      if (req.user) {
        templateData.createdBy = req.user.id;
      }
      const newTemplate = await storage.createReportTemplate(templateData);
      res.status(201).json(newTemplate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/report-templates/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      const templateData = req.body;
      const updatedTemplate = await storage.updateReportTemplate(id, templateData);
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Report template not found" });
      }
      res.json(updatedTemplate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Report Executions
  app.get("/api/report-executions", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const executions = await storage.getRecentReportExecutions(limit);
      res.json(executions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/report-executions/template/:templateId", requireAuth, async (req, res) => {
    try {
      const templateId = parseInt(req.params.templateId);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      const executions = await storage.getReportExecutionsByTemplate(templateId);
      res.json(executions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/report-executions/user/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const executions = await storage.getReportExecutionsByUser(userId);
      res.json(executions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/report-executions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid execution ID" });
      }
      const execution = await storage.getReportExecution(id);
      if (!execution) {
        return res.status(404).json({ message: "Report execution not found" });
      }
      res.json(execution);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/report-executions", requireAuth, async (req, res) => {
    try {
      const executionData = req.body;
      // Set the user who executed the report
      if (req.user) {
        executionData.executedBy = req.user.id;
      }
      const newExecution = await storage.createReportExecution(executionData);
      res.status(201).json(newExecution);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/report-executions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid execution ID" });
      }
      const executionData = req.body;
      const updatedExecution = await storage.updateReportExecution(id, executionData);
      if (!updatedExecution) {
        return res.status(404).json({ message: "Report execution not found" });
      }
      res.json(updatedExecution);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Service Order Routes
  app.get("/api/service-orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getAllServiceOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-orders/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const order = await storage.getServiceOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Service order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/service-orders/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);
      const orders = await storage.getServiceOrdersByPatient(patientId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/service-orders", requireAuth, async (req, res) => {
    try {
      const orderData = req.body;
      // Set default values if not provided
      if (!orderData.status) orderData.status = "pending";
      if (!orderData.totalAmount) orderData.totalAmount = "0.00";
      if (!orderData.orderDate) orderData.orderDate = new Date();
      if (req.user) {
        orderData.createdBy = req.user.id;
      }

      const newOrder = await storage.createServiceOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/service-orders/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const orderData = req.body;
      const updatedOrder = await storage.updateServiceOrder(id, orderData);

      if (!updatedOrder) {
        return res.status(404).json({ message: "Service order not found" });
      }

      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Service Order Items Routes
  app.get("/api/service-order-items/order/:orderId", requireAuth, async (req, res) => {
    try {
      const orderId = Number(req.params.orderId);
      const items = await storage.getServiceOrderItemsByOrder(orderId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/service-order-items", requireAuth, async (req, res) => {
    try {
      const itemData = req.body;
      // Set default values if not provided
      if (!itemData.status) itemData.status = "pending";
      if (!itemData.quantity) itemData.quantity = 1;

      const newItem = await storage.createServiceOrderItem(itemData);
      res.status(201).json(newItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/service-order-items/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const itemData = req.body;
      const updatedItem = await storage.updateServiceOrderItem(id, itemData);

      if (!updatedItem) {
        return res.status(404).json({ message: "Service order item not found" });
      }

      res.json(updatedItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Treatment Routes
  app.get("/api/treatments", requireAuth, async (req, res) => {
    try {
      const treatments = await storage.getActiveTreatments();
      res.json(treatments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/treatments/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);
      const treatments = await storage.getTreatmentsByPatient(patientId);
      res.json(treatments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/treatments/admission/:admissionId", requireAuth, async (req, res) => {
    try {
      const admissionId = Number(req.params.admissionId);
      const treatments = await storage.getTreatmentsByAdmission(admissionId);
      res.json(treatments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/treatments/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const treatment = await storage.getTreatment(id);
      if (!treatment) {
        return res.status(404).json({ message: "Treatment not found" });
      }
      res.json(treatment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/treatments", requireAuth, async (req, res) => {
    try {
      const treatmentData = insertTreatmentPlanSchema.parse(req.body);
      const treatment = await storage.createTreatment(treatmentData);
      res.status(201).json(treatment);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.patch("/api/treatments/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const treatmentData = req.body;
      const treatment = await storage.updateTreatment(id, treatmentData);
      if (!treatment) {
        return res.status(404).json({ message: "Treatment not found" });
      }
      res.json(treatment);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Medical Order Routes
  app.get("/api/medical-orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getActiveMedicalOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/medical-orders/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);
      const orders = await storage.getMedicalOrdersByPatient(patientId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/medical-orders/admission/:admissionId", requireAuth, async (req, res) => {
    try {
      const admissionId = Number(req.params.admissionId);
      const orders = await storage.getMedicalOrdersByAdmission(admissionId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/medical-orders/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const order = await storage.getMedicalOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Medical order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/medical-orders", requireAuth, async (req, res) => {
    try {
      const orderData = insertMedicalOrderSchema.parse(req.body);
      const order = await storage.createMedicalOrder(orderData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.patch("/api/medical-orders/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const orderData = req.body;
      const order = await storage.updateMedicalOrder(id, orderData);
      if (!order) {
        return res.status(404).json({ message: "Medical order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Order Results Routes
  app.get("/api/order-results/order/:orderId", requireAuth, async (req, res) => {
    try {
      const orderId = Number(req.params.orderId);
      const results = await storage.getOrderResultsByOrder(orderId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/order-results/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await storage.getOrderResult(id);
      if (!result) {
        return res.status(404).json({ message: "Order result not found" });
      }
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/order-results", requireAuth, async (req, res) => {
    try {
      const resultData = insertOrderResultSchema.parse(req.body);
      const result = await storage.createOrderResult(resultData);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.patch("/api/order-results/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const resultData = req.body;
      const result = await storage.updateOrderResult(id, resultData);
      if (!result) {
        return res.status(404).json({ message: "Order result not found" });
      }
      res.json(result);
    } catch (error: any) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Credit Company Routes
  app.get("/api/credit-companies", requireAuth, async (req, res) => {
    try {
      const companies = await storage.getAllCreditCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/active-credit-companies", requireAuth, async (req, res) => {
    try {
      const companies = await storage.getActiveCreditCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/credit-companies/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const company = await storage.getCreditCompany(id);

      if (!company) {
        return res.status(404).json({ message: "Credit company not found" });
      }

      res.json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/credit-companies", requireAuth, async (req, res) => {
    try {
      const companyData = req.body;
      const newCompany = await storage.createCreditCompany(companyData);
      res.status(201).json(newCompany);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/credit-companies/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const companyData = req.body;

      const updatedCompany = await storage.updateCreditCompany(id, companyData);

      if (!updatedCompany) {
        return res.status(404).json({ message: "Credit company not found" });
      }

      res.json(updatedCompany);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Lab Systems Routes
  app.get("/api/lab-systems", requireAuth, async (req, res) => {
    try {
      const systems = await storage.getAllLabSystems();
      res.json(systems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/active-lab-systems", requireAuth, async (req, res) => {
    try {
      const systems = await storage.getActiveLabSystems();
      res.json(systems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/lab-systems/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const system = await storage.getLabSystem(id);

      if (!system) {
        return res.status(404).json({ message: "Lab system not found" });
      }

      res.json(system);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/lab-systems", requireAuth, async (req, res) => {
    try {
      const systemData = req.body;
      const newSystem = await storage.createLabSystem(systemData);
      res.status(201).json(newSystem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/lab-systems/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const systemData = req.body;

      const updatedSystem = await storage.updateLabSystem(id, systemData);

      if (!updatedSystem) {
        return res.status(404).json({ message: "Lab system not found" });
      }

      res.json(updatedSystem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Lab Results Routes
  app.get("/api/lab-results", requireAuth, async (req, res) => {
    try {
      // Adding filtering options in the query
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string, 10) : undefined;
      const orderId = req.query.orderId ? parseInt(req.query.orderId as string, 10) : undefined;
      const labSystemId = req.query.labSystemId ? parseInt(req.query.labSystemId as string, 10) : undefined;

      let results;
      if (patientId) {
        results = await storage.getLabResultsByPatient(patientId);
      } else if (orderId) {
        results = await storage.getLabResultsByOrder(orderId);
      } else if (labSystemId) {
        results = await storage.getLabResultsBySystem(labSystemId);
      } else {
        // Default to getting pending results if no filter is specified
        results = await storage.getPendingLabResults();
      }

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/lab-results/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await storage.getLabResult(id);

      if (!result) {
        return res.status(404).json({ message: "Lab result not found" });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/lab-results", requireAuth, async (req, res) => {
    try {
      const resultData = req.body;
      const newResult = await storage.createLabResult(resultData);
      res.status(201).json(newResult);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/lab-results/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const resultData = req.body;

      const updatedResult = await storage.updateLabResult(id, resultData);

      if (!updatedResult) {
        return res.status(404).json({ message: "Lab result not found" });
      }

      res.json(updatedResult);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Lab Sync Logs Routes
  app.get("/api/lab-sync-logs", requireAuth, async (req, res) => {
    try {
      const labSystemId = req.query.labSystemId ? parseInt(req.query.labSystemId as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      let logs;
      if (labSystemId) {
        logs = await storage.getLabSyncLogsBySystem(labSystemId);
      } else {
        logs = await storage.getRecentLabSyncLogs(limit);
      }

      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/lab-sync-logs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const log = await storage.getLabSyncLog(id);

      if (!log) {
        return res.status(404).json({ message: "Lab sync log not found" });
      }

      res.json(log);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/lab-sync-logs", requireAuth, async (req, res) => {
    try {
      const logData = req.body;
      const newLog = await storage.createLabSyncLog(logData);
      res.status(201).json(newLog);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/lab-sync-logs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const logData = req.body;

      const updatedLog = await storage.updateLabSyncLog(id, logData);

      if (!updatedLog) {
        return res.status(404).json({ message: "Lab sync log not found" });
      }

      res.json(updatedLog);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // External Lab System Integration Route
  app.post("/api/lab-systems/:id/sync", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const labSystem = await storage.getLabSystem(id);

      if (!labSystem) {
        return res.status(404).json({ message: "Lab system not found" });
      }

      // Create a sync log record to track this sync operation
      const syncLog = await storage.createLabSyncLog({
        labSystemId: id,
        status: "in_progress"
      });

      // In a real implementation, this would make an API call to the external system
      // using the labSystem.apiUrl and labSystem.apiKey
      // For demo purposes, we'll simulate a successful sync

      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the sync log to show completion
      const updatedSyncLog = await storage.updateLabSyncLog(syncLog.id, {
        status: "completed",
        completedAt: new Date(),
        totalRecords: 5,
        successCount: 5,
        errorCount: 0
      });

      // Update the labSystem's lastSyncAt timestamp
      await storage.updateLabSystem(id, { 
        lastSyncAt: new Date() 
      });

      res.json({
        message: "Sync completed successfully",
        syncLog: updatedSyncLog
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}