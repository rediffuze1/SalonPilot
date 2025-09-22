import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSalonSchema, insertServiceSchema, insertStylistSchema, insertClientSchema, insertAppointmentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Salon routes
  app.get('/api/salon', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const salon = await storage.getSalonByUserId(userId);
      res.json(salon);
    } catch (error) {
      console.error("Error fetching salon:", error);
      res.status(500).json({ message: "Failed to fetch salon" });
    }
  });

  app.post('/api/salon', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const salonData = insertSalonSchema.parse({ ...req.body, userId });
      const salon = await storage.createSalon(salonData);
      res.json(salon);
    } catch (error) {
      console.error("Error creating salon:", error);
      res.status(400).json({ message: "Failed to create salon" });
    }
  });

  // Services routes
  app.get('/api/salons/:salonId/services', async (req, res) => {
    try {
      const { salonId } = req.params;
      const services = await storage.getServicesBySalonId(salonId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post('/api/salons/:salonId/services', isAuthenticated, async (req, res) => {
    try {
      const { salonId } = req.params;
      const serviceData = insertServiceSchema.parse({ ...req.body, salonId });
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: "Failed to create service" });
    }
  });

  app.put('/api/services/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const serviceData = req.body;
      const service = await storage.updateService(id, serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(400).json({ message: "Failed to update service" });
    }
  });

  app.delete('/api/services/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteService(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(400).json({ message: "Failed to delete service" });
    }
  });

  // Stylists routes
  app.get('/api/salons/:salonId/stylists', async (req, res) => {
    try {
      const { salonId } = req.params;
      const stylists = await storage.getStylistsBySalonId(salonId);
      res.json(stylists);
    } catch (error) {
      console.error("Error fetching stylists:", error);
      res.status(500).json({ message: "Failed to fetch stylists" });
    }
  });

  app.post('/api/salons/:salonId/stylists', isAuthenticated, async (req, res) => {
    try {
      const { salonId } = req.params;
      const stylistData = insertStylistSchema.parse({ ...req.body, salonId });
      const stylist = await storage.createStylist(stylistData);
      res.json(stylist);
    } catch (error) {
      console.error("Error creating stylist:", error);
      res.status(400).json({ message: "Failed to create stylist" });
    }
  });

  app.put('/api/stylists/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const stylistData = req.body;
      const stylist = await storage.updateStylist(id, stylistData);
      res.json(stylist);
    } catch (error) {
      console.error("Error updating stylist:", error);
      res.status(400).json({ message: "Failed to update stylist" });
    }
  });

  app.delete('/api/stylists/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteStylist(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting stylist:", error);
      res.status(400).json({ message: "Failed to delete stylist" });
    }
  });

  // Clients routes
  app.get('/api/clients', async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post('/api/clients', async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      
      // Check if client already exists
      const existingClient = await storage.getClientByEmail(clientData.email);
      if (existingClient) {
        return res.json(existingClient);
      }
      
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Failed to create client" });
    }
  });

  // Appointments routes
  app.get('/api/salons/:salonId/appointments', async (req, res) => {
    try {
      const { salonId } = req.params;
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const appointments = await storage.getAppointmentsBySalonId(salonId, start, end);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post('/api/appointments', async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      // Check stylist availability
      const isAvailable = await storage.checkStylistAvailability(
        appointmentData.stylistId,
        appointmentData.startTime,
        appointmentData.endTime
      );
      
      if (!isAvailable) {
        return res.status(400).json({ message: "Stylist is not available at the selected time" });
      }
      
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(400).json({ message: "Failed to create appointment" });
    }
  });

  app.put('/api/appointments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const appointmentData = req.body;
      const appointment = await storage.updateAppointment(id, appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(400).json({ message: "Failed to update appointment" });
    }
  });

  app.delete('/api/appointments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAppointment(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(400).json({ message: "Failed to delete appointment" });
    }
  });

  // Availability routes
  app.get('/api/salons/:salonId/stylists/:stylistId/availability', async (req, res) => {
    try {
      const { salonId, stylistId } = req.params;
      const { date, duration } = req.query;
      
      if (!date || !duration) {
        return res.status(400).json({ message: "Date and duration are required" });
      }
      
      const slots = await storage.getAvailableSlots(
        salonId,
        stylistId,
        new Date(date as string),
        parseInt(duration as string)
      );
      
      res.json(slots);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
