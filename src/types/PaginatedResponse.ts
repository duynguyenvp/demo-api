import { ClassType, Field, Int, ObjectType } from "type-graphql";

export default function PaginatedResponse<TItem extends object>(TItemClass: ClassType<TItem>) {
  @ObjectType()
  abstract class PaginatedResponseClass {
    @Field(() => Int)
    total!: number;
  
    @Field(() => Int)
    offset!: number;
  
    @Field(() => Int)
    limit!: number;
  
    @Field(() => [TItemClass])
    items: TItem[];
  }
  return PaginatedResponseClass;
}