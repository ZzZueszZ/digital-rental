import { Role } from "@/constants/enum/role";
import Routers from "@/constants/routers";

type RoleLike = string | { code?: string };

export function getRoleRedirectUrl(roles?: RoleLike[]) {
  const userRoles = (roles || []).map((role) => {
    if (typeof role === "string") return role.toUpperCase();
    return role?.code?.toUpperCase() || "";
  });

  const hasRole = (role: Role) =>
    userRoles.some((userRole) => userRole === role || userRole === `ROLE_${role}`);

  if (hasRole(Role.SUPER_ADMIN)) return Routers.SUPER_ADMIN;
  if (hasRole(Role.ADMIN)) return Routers.ADMIN;
  if (hasRole(Role.STAFF)) return Routers.STAFF;
  return Routers.HOME;
}
