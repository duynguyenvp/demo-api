import { type AuthChecker } from "type-graphql";
import { Context } from "../types/Context";
import { RoleRepository } from "../models/roles";
import { GraphQLError } from "graphql";

// Auth checker function
export const authChecker: AuthChecker<Context> = ({ context }, roles) => {
  const { user, error } = context;
  if (error) {
    throw new GraphQLError(error.message, { originalError: error, extensions: { code: error.name } });
  }
  // Check user
  if (!user) {
    // No user, restrict access
  }

  // Check '@Authorized()'
  if (roles.length === 0) {
    // Only authentication required
    return true;
  }

  const userRole = user?.role ?? "anonymous";
  const userPermissions = RoleRepository.getPermissionsByRoleName(userRole);
  return roles.every(permission => userPermissions.includes(permission));
};
