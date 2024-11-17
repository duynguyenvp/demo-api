import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class CategoryEntity {
  @Field()
  name: string;
  @Field()
  note: string;
}
