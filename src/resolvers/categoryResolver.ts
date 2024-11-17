import { Arg, Authorized, Int, Query, Resolver } from "type-graphql";
import PaginatedCategories from "../types/PaginatedCategories";
import logger from "../logger";
import { CategoryRepository } from "../models/categoryModel";
import CategoryEntity from "../entities/categoryEntity";

@Resolver(() => CategoryEntity)
export default class CategoryResolver {
  @Authorized("read_record")
  @Query(() => PaginatedCategories, { nullable: true })
  async categories(
    @Arg("search", { nullable: true }) search: string,
    @Arg("offset", () => Int) offset: number,
    @Arg("limit", () => Int) limit: number
  ): Promise<PaginatedCategories | null> {
    try {
      return CategoryRepository.getAll(search, limit, offset);
    } catch (error) {
      logger.error("Failed to retrieve categories", error);
      return null;
    }
  }
}
