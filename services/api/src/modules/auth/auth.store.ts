export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAtIso: string;
}

export interface SessionToken {
  token: string;
  adminId: string;
  email: string;
  issuedAtIso: string;
}

export const adminUsers: AdminUser[] = [
  {
    id: "admin-seed-1",
    name: "Platform Owner",
    email: "admin@proapp.local",
    password: "Admin@123",
    createdAtIso: new Date().toISOString()
  }
];

export const sessions: SessionToken[] = [];
