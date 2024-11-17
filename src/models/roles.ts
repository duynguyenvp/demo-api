import { IRole } from "../types/IRole";

const ROLES: IRole[] = [
  {
    name: "admin",
    level: 0,
    permissions: [
      "create_record",
      "read_record",
      "update_record",
      "delete_record"
    ]
  },
  {
    name: "manager",
    level: 1,
    permissions: ["create_record", "read_record", "update_record"]
  },
  {
    name: "employee",
    level: 2,
    permissions: ["create_record", "read_record"]
  }
];

export const RoleRepository = Object.freeze({
  getRoleByName(name: string) {
    return ROLES.find(role => role.name === name);
  },

  getRoles() {
    return ROLES;
  },
  getPermissionsByRoleName(roleName: string) {
    const role = ROLES.find(r => r.name === roleName);
    return role ? role.permissions : [];
  },
  getRoleLevelByRoleName(roleName: string) {
    const role = ROLES.find(r => r.name === roleName);
    return role ? role.level : 9999;
  }
});
