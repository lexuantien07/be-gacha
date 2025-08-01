import { Module } from '@nestjs/common';
import { PrizeService } from './prize.service';
import { PrizeController } from './prize.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Prize, PrizeSchema } from '../../models/prize.model';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Prize.name, schema: PrizeSchema }]),
    UserModule,
  ],
  controllers: [PrizeController],
  providers: [PrizeService],
})
export class PrizeModule {}
