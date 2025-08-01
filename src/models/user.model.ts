import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  is_admin: boolean;

  @Prop({ required: true, default: 0, min: 0 })
  draw_ticket: number;

  @Prop()
  created_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
