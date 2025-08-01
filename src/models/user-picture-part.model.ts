import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserPicturePart extends Document {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  picture_id: string;

  @Prop({ required: true, min: 1, max: 4 })
  part_number: number;

  @Prop({ required: true, default: 0, min: 0 })
  quantity: number;
}

export const UserPicturePartSchema =
  SchemaFactory.createForClass(UserPicturePart);

UserPicturePartSchema.index(
  { user_id: 1, picture_id: 1, part_number: 1 },
  { unique: true },
);
