import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PictureAttempt extends Document {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  picture_id: string;

  @Prop({ type: [String], default: [] })
  submitted_codes: string[]; // Mã đã gửi (kể cả đúng và sai)

  @Prop({ type: [String], default: [] })
  correct_codes: string[]; // Mã đúng

  @Prop({ default: 1 })
  attempt_count: number; // 1 hoặc 2

  @Prop({ default: false })
  completed: boolean; // Ghép thành công

  @Prop({ default: false })
  failed: boolean; // Sai cả 2 lượt
}

export const PictureAttemptSchema =
  SchemaFactory.createForClass(PictureAttempt);
