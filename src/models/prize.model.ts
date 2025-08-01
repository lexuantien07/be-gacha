import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Prize extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 0 })
  quantity_remaining: number;

  @Prop({ required: true, min: 0, max: 1 })
  win_rate: number;

  @Prop({ default: true })
  is_active: boolean;
}

export const PrizeSchema = SchemaFactory.createForClass(Prize);
