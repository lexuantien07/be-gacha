import { Module } from '@nestjs/common';
import { CodeService } from './draw-history.service';
import { CodeController } from './draw-history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Code, CodeSchema } from '../../models/code.model';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Code.name, schema: CodeSchema }]),
    UserModule,
  ],
  controllers: [CodeController],
  providers: [CodeService],
})
export class DrawHistoryModule {}
