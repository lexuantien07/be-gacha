import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Code } from '../../models/code.model';
import { Model } from 'mongoose';
import { CreateCodeDto } from './dto/create-code.dto';
import { GetListCodeDto } from './dto/get-code.dto';
import { UserPicturePart } from 'src/models/user-picture-part.model';
import { DrawHistory } from 'src/models/draw-history.model';
import { AssembledPicture } from 'src/models/assembled-pictures.model';
import { User } from 'src/models/user.model';
import { PrizeService } from 'src/modules/prize/prize.service';
import { Prize } from 'src/models/prize.model';

@Injectable()
export class CodeService {
  constructor(
    @InjectModel(Code.name) private readonly codeModel: Model<Code>,
    @InjectModel(UserPicturePart.name)
    private readonly userPartModel: Model<UserPicturePart>,
    @InjectModel(DrawHistory.name)
    private readonly drawHistoryModel: Model<DrawHistory>,
    @InjectModel(AssembledPicture.name)
    private readonly assembledModel: Model<AssembledPicture>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Prize.name) private readonly prizeModel: Model<Prize>,
  ) {}

  async create(dto: CreateCodeDto) {
    const codes: Code[] = [];
    for (let i = 0; i < dto.quantity.length; i++) {
      const code = new this.codeModel({
        code: `${dto.picture_id}-${dto.part_number}-${i + 1}`,
        picture_id: dto.picture_id,
        part_number: dto.part_number,
      });
      codes.push(code);
    }
    return this.codeModel.insertMany(codes);
  }

  async getAll(query: GetListCodeDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const codes = await this.codeModel
      .find()
      .select('-likedBy')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.codeModel.countDocuments();
    const totalPage = Math.ceil(total / limit);

    return {
      codes,
      currentPage: page,
      totalPage,
      limit,
      total: total,
    };
  }

  async validateAndClaimCodes(userId: string, codes: string[]) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    if (user.draw_ticket <= 0) {
      throw new BadRequestException('No draw ticket left');
    }

    const codeDocs = await this.codeModel.find({ code: { $in: codes } });

    // Check đủ 4 mã
    if (codeDocs.length !== 4) {
      await this.consumeDrawTicket(userId); // mất lượt
      return { success: false, message: 'One or more codes are invalid' };
    }

    // Check có mã đã dùng
    const alreadyUsed = codeDocs.filter((c) => c.used_by_user_id);
    if (alreadyUsed.length > 0) {
      await this.consumeDrawTicket(userId);
      return {
        success: false,
        message: `Some codes have already been used: ${alreadyUsed.map((c) => c.code).join(', ')}`,
      };
    }

    // Check mã cùng picture_id
    const pictureIds = [...new Set(codeDocs.map((c) => c.picture_id))];
    if (pictureIds.length !== 1) {
      await this.consumeDrawTicket(userId);
      return {
        success: false,
        message: 'Codes must belong to the same picture',
      };
    }
    const pictureId = pictureIds[0];

    // Check part_number đủ 1-4
    const partNumbers = codeDocs.map((c) => c.part_number);
    const isComplete =
      new Set(partNumbers).size === 4 &&
      partNumbers.every((p) => [1, 2, 3, 4].includes(p));
    if (!isComplete) {
      await this.consumeDrawTicket(userId);
      return {
        success: false,
        message: 'Codes must contain all 4 unique parts (1 to 4)',
      };
    }

    // ✅ Đánh dấu used + ghi vào UserPictureParts
    const now = new Date();
    await Promise.all(
      codeDocs.map((doc) =>
        this.codeModel.updateOne(
          { _id: doc._id },
          { $set: { used_by_user_id: userId, used_at: now } },
        ),
      ),
    );

    await Promise.all(
      codeDocs.map((doc) =>
        this.userPartModel.updateOne(
          {
            user_id: userId,
            picture_id: doc.picture_id,
            part_number: doc.part_number,
          },
          { $inc: { quantity: 1 } },
          { upsert: true },
        ),
      ),
    );

    // ✅ Ghi assembled
    await this.assembledModel.create({
      user_id: userId,
      picture_id: pictureId,
      assembled_at: now,
    });

    // ✅ Ghi draw history
    const prize = await this.drawPrize(userId, pictureId);

    // ✅ Trừ lượt
    await this.consumeDrawTicket(userId);

    return {
      success: true,
      message: 'Codes validated. Picture assembled and draw completed.',
      prize: prize ? prize.name : 'No prize won',
    };
  }

  private async consumeDrawTicket(userId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { $inc: { draw_ticket: -1 } },
    );
  }

  private async drawPrize(userId: string, pictureId: string) {
    const prizes = await this.prizeModel.find({
      is_active: true,
      quantity_remaining: { $gt: 0 },
    });

    for (const prize of prizes) {
      const won = Math.random() < prize.win_rate;
      if (won) {
        // Trừ số lượng
        await this.prizeModel.updateOne(
          { _id: prize._id },
          {
            $inc: { quantity_remaining: -1 },
          },
        );

        // Ghi draw history
        await this.drawHistoryModel.create({
          user_id: userId,
          picture_id: pictureId,
          prize_id: prize._id,
          created_at: new Date(),
        });

        return prize;
      }
    }

    // Không trúng
    await this.drawHistoryModel.create({
      user_id: userId,
      picture_id: pictureId,
      prize_id: null,
      created_at: new Date(),
    });

    return null;
  }
}
