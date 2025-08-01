import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'assembled_at' } })
export class AssembledPicture extends Document {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  picture_id: string;

  @Prop()
  assembled_at: Date;
}

export const AssembledPictureSchema =
  SchemaFactory.createForClass(AssembledPicture);

AssembledPictureSchema.index({ user_id: 1, picture_id: 1 }, { unique: true });
