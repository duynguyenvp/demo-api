import jwt from "jsonwebtoken";
import { AUTH_SECRET_KEY } from "../constant";
import { UserRepository } from "../models/userModel";
import { IUser } from "../types/IUser";

export function getUserFromToken(token: string): Promise<IUser | null> {
  if (!token) {
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    const formatedToken = token.replace("Bearer ", "").replace("bearer ", "");
    jwt.verify(
      formatedToken,
      AUTH_SECRET_KEY,
      async (err: any, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          const user = await UserRepository.findById(decoded.userId);
          resolve({
            id: user?.id,
            username: user?.username,
            role: user?.role
          });
        }
      }
    );
  });
}
