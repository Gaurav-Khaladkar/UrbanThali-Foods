import { randomUUID } from "node:crypto";
import { type AdminUser, adminUsers, type SessionToken, sessions } from "./auth.store.js";

export interface RegisterAdminInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function registerAdmin(input: RegisterAdminInput): AdminUser {
  const alreadyExists = adminUsers.some((admin) => admin.email.toLowerCase() === input.email.toLowerCase());
  if (alreadyExists) {
    throw new Error("Admin already registered with this email");
  }

  const admin: AdminUser = {
    id: randomUUID(),
    name: input.name,
    email: input.email.toLowerCase(),
    password: input.password,
    createdAtIso: new Date().toISOString()
  };

  adminUsers.push(admin);
  return admin;
}

export function loginAdmin(input: LoginInput): SessionToken {
  const admin = adminUsers.find(
    (candidate) => candidate.email.toLowerCase() === input.email.toLowerCase() && candidate.password === input.password
  );

  if (!admin) {
    throw new Error("Invalid admin credentials");
  }

  const token = Buffer.from(`${admin.id}:${Date.now()}`).toString("base64url");
  const session: SessionToken = {
    token,
    adminId: admin.id,
    email: admin.email,
    issuedAtIso: new Date().toISOString()
  };
  sessions.push(session);
  return session;
}

export function listAdmins(): Omit<AdminUser, "password">[] {
  return adminUsers.map(({ password: _password, ...admin }) => admin);
}
