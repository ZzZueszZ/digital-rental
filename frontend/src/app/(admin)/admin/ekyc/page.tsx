import KycManagement from "@/components/admin/KycManagement";
import { RoleGuard } from "@/components/auth/Guards";
import { Role } from "@/constants/enum/role";

export default function AdminKycPage() {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}>
      <KycManagement />
    </RoleGuard>
  );
}
