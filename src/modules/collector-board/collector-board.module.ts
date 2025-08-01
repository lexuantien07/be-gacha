import { Module } from '@nestjs/common';
import { CollectorBoardService } from './collector-board.service';
import { CollectorBoardController } from './collector-board.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Code, CodeSchema } from '../../models/code.model';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Code.name, schema: CodeSchema }]),
    UserModule,
  ],
  controllers: [CollectorBoardController],
  providers: [CollectorBoardService],
})
export class CollectorBoardModule {}
