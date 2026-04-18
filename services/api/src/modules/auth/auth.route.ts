import { Router } from "express";
import { z } from "zod";
import { listAdmins, loginAdmin, registerAdmin } from "./auth.service.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const authRouter = Router();

authRouter.post("/admin/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid registration payload", details: parsed.error.flatten() });
  }

  try {
    const admin = registerAdmin(parsed.data);
    return res.status(201).json({
      message: "Admin registered successfully",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        createdAtIso: admin.createdAtIso
      }
    });
  } catch (error) {
    return res.status(409).json({ error: error instanceof Error ? error.message : "Registration failed" });
  }
});

authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid login payload", details: parsed.error.flatten() });
  }

  try {
    const session = loginAdmin(parsed.data);
    return res.status(200).json({ message: "Login successful", data: session });
  } catch (error) {
    return res.status(401).json({ error: error instanceof Error ? error.message : "Login failed" });
  }
});

authRouter.get("/admins", (_req, res) => {
  res.status(200).json({ data: listAdmins() });
});
