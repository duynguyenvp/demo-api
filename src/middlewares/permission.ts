import { Request, Response } from "express";
import { RoleRepository } from "../models/roles";

export const checkPermission = (permission: string) => {
  return (req: Request, res: Response, next: any) => {
    const userRole = req.user ? req.user.role : "anonymous";
    const userPermissions = RoleRepository.getPermissionsByRoleName(
      userRole
    );

    if (userPermissions.includes(permission)) {
      return next();
    } else {
      return res.error("Access denied. You don't have permission to access.", 403);
    }
  };
};
