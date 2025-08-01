import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { PrizeModule } from './modules/prize/prize.module';
import { DrawHistoryModule } from './modules/draw-history/draw-history.module';
import { CodeModule } from './modules/code/code.module';
import { AuthMiddleware } from './modules/auth/auth.middleware';
import { CodeController } from './modules/code/code.controller';
import { UserController } from './modules/user/user.controller';
import { PrizeController } from './modules/prize/prize.controller';

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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(CodeController, UserController, PrizeController);
  }
}
