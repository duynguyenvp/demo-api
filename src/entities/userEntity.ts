import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export default class UserEntity {
  @Field(() => ID)
  id: string;
  @Field()
  username: string;
  @Field()
  role: string;
}
