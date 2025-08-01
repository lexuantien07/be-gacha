import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Code extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  picture_id: string;

  @Prop({ required: true, min: 1, max: 4 })
  part_number: number;

  @Prop()
  used_by_user_id?: string;

  @Prop()
  used_at?: Date;
}

export const CodeSchema = SchemaFactory.createForClass(Code);
