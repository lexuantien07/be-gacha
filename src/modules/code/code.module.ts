import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Code, CodeSchema } from '../../models/code.model';
import { UserModule } from '../user/user.module';
import {
  UserPicturePart,
  UserPicturePartSchema,
} from 'src/models/user-picture-part.model';
import { AssembledPicture, AssembledPictureSchema } from 'src/models/assembled-pictures.model';
import { DrawHistory, DrawHistorySchema } from 'src/models/draw-history.model';
import { Prize, PrizeSchema } from 'src/models/prize.model';
import { User, UserSchema } from 'src/models/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Code.name, schema: CodeSchema },
      { name: UserPicturePart.name, schema: UserPicturePartSchema },
      { name: DrawHistory.name, schema: DrawHistorySchema },
      { name: AssembledPicture.name, schema: AssembledPictureSchema },
      { name: User.name, schema: UserSchema },
      { name: Prize.name, schema: PrizeSchema },
    ]),
    UserModule,
  ],
  controllers: [CodeController],
  providers: [CodeService],
})
export class CodeModule {}
