import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './models/auth.module';
import { PrizeModule } from './modules/prize/prize.module';
import { DrawHistoryModule } from './modules/draw-history/draw-history.module';
import { CodeModule } from './modules/code/code.module';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    UserModule,
    AuthModule,
    PrizeModule,
    CodeModule,
    DrawHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
