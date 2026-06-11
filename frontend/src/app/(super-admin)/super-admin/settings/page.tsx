import { redirect } from "next/navigation";

export default function SuperAdminSettingsRedirectPage() {
  redirect("/profile/settings");
}
