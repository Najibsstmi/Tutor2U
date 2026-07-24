import type { Role } from "@/lib/types";

export const AUTH_ROLE_COOKIE = "tutor2u_auth_role";

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
export const publicRegistrationRoles = ["parent", "tutor"] as const;
export type PublicRegistrationRole = (typeof publicRegistrationRoles)[number];

export function isRole(value: string | undefined): value is Role {
  return value === "parent" || value === "tutor" || value === "admin";
}

export function isPublicRegistrationRole(value: string | undefined): value is PublicRegistrationRole {
  return value === "parent" || value === "tutor";
}
