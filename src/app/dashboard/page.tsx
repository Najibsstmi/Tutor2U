import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isRole, roleDashboardPaths } from "@/lib/auth/roles";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("tutor2u_demo_role")?.value;

  if (isRole(role)) {
    redirect(roleDashboardPaths[role]);
  }

  redirect("/login?next=/dashboard/parent");
}
