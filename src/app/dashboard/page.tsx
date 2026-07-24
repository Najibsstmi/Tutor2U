import { redirect } from "next/navigation";

import { roleDashboardPaths } from "@/lib/auth/roles";
import { getDashboardRole } from "@/lib/auth/server";

export default async function DashboardPage() {
  const role = await getDashboardRole();

  if (role) {
    redirect(roleDashboardPaths[role]);
  }

  redirect("/login?next=/dashboard/parent");
}
