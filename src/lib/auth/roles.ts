import type { Role } from "@/lib/types";

export const roleLabels: Record<Role, string> = {
  parent: "Ibu bapa",
  tutor: "Tutor",
  admin: "Admin",
};

export const roleDashboardPaths: Record<Role, string> = {
  parent: "/dashboard/parent",
  tutor: "/dashboard/tutor",
  admin: "/dashboard/admin",
};

export const roles: Role[] = ["parent", "tutor", "admin"];

export function isRole(value: string | undefined): value is Role {
  return value === "parent" || value === "tutor" || value === "admin";
}
