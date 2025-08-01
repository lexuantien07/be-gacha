import { Module } from '@nestjs/common';
import { DrawHistoryService } from './draw-history.service';
import { DrawHistoryController } from './draw-history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Code, CodeSchema } from '../../models/code.model';
import { UserModule } from '../user/user.module';
import { DrawHistory, DrawHistorySchema } from 'src/models/draw-history.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DrawHistory.name, schema: DrawHistorySchema }]),
    UserModule,
  ],
  controllers: [DrawHistoryController],
  providers: [DrawHistoryService],
})
export class DrawHistoryModule {}
