import { Authorized, Ctx, Query, Resolver } from "type-graphql";
import logger from "../logger";
import UserEntity from "../entities/userEntity";
import { UserRepository } from "../models/userModel";
import { Context } from "../types/Context";

@Resolver(() => UserEntity)
export default class UserResolver {
  @Authorized("read_record")
  @Query(() => UserEntity, { nullable: true })
  async profile(@Ctx() { user }: Context): Promise<UserEntity | null> {
    try {
      const exitingUser = await UserRepository.findById(user?.id);
      if (!exitingUser) return null;
      return {
        id: exitingUser?._id.toString(),
        username: exitingUser?.username,
        role: exitingUser?.role
      };
    } catch (error) {
      logger.error("Failed to retrieve user profile", error);
      return null;
    }
  }
}
