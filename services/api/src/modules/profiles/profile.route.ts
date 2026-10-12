import { Router } from "express";
import type { ProfileRole } from "@urbanthali/shared";
import {
  createProfile,
  createProfileSchema,
  deleteProfile,
  getProfileById,
  getProfileStats,
  listProfiles,
  updateProfile,
  updateProfileSchema
} from "./profile.service.js";

export const profileRouter = Router();

profileRouter.get("/", (req, res) => {
  const role = req.query.role as ProfileRole | undefined;
  const search = req.query.search as string | undefined;

  const validRoles: ProfileRole[] = ["customer", "rider", "kitchen", "admin"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({
      error: `Invalid role parameter. Must be one of: ${validRoles.join(", ")}`
    });
  }

  const profiles = listProfiles(role, search);
  return res.status(200).json({
    data: profiles,
    count: profiles.length
  });
});

profileRouter.get("/stats", (_req, res) => {
  const stats = getProfileStats();
  return res.status(200).json({ data: stats });
});

profileRouter.get("/:id", (req, res) => {
  try {
    const profile = getProfileById(req.params.id);
    return res.status(200).json({ data: profile });
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Profile not found" });
  }
});

profileRouter.post("/", (req, res) => {
  const parsed = createProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid profile data",
      details: parsed.error.flatten()
    });
  }

  try {
    const created = createProfile(parsed.data);
    return res.status(201).json({
      message: `${created.role.toUpperCase()} profile created successfully`,
      data: created
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to create profile"
    });
  }
});

profileRouter.patch("/:id", (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid profile update payload",
      details: parsed.error.flatten()
    });
  }

  try {
    const updated = updateProfile(req.params.id, parsed.data);
    return res.status(200).json({
      message: "Profile updated successfully",
      data: updated
    });
  } catch (error) {
    return res.status(404).json({
      error: error instanceof Error ? error.message : "Failed to update profile"
    });
  }
});

profileRouter.delete("/:id", (req, res) => {
  try {
    const result = deleteProfile(req.params.id);
    return res.status(200).json({
      message: "Profile deleted successfully",
      data: result
    });
  } catch (error) {
    return res.status(404).json({
      error: error instanceof Error ? error.message : "Failed to delete profile"
    });
  }
});
