import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at' } })
export class DrawHistory extends Document {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  picture_id: string;

  @Prop()
  prize_id?: string;

  @Prop()
  created_at: Date;
}

export const DrawHistorySchema = SchemaFactory.createForClass(DrawHistory);

DrawHistorySchema.index({ user_id: 1, created_at: 1 });
