import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
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
import { PictureAttempt } from 'src/models/picture-attempt.model';

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
    @InjectModel(PictureAttempt.name) private readonly pictureAttemptModel: Model<PictureAttempt>,
  ) {}

  private async generateUniqueCode(
    pictureId: string,
    partNumber: number,
  ): Promise<string> {
    const maxAttempts = 10;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const randomPart = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase(); // Ví dụ: 'A1B2C3'
      const mappingOrder = ['A', 'B', 'C', 'D'];
      const code = `${mappingOrder[partNumber - 1]}-${pictureId}-${randomPart}`;

      const exists = await this.codeModel.exists({ code });
      if (!exists) return code;

      attempt++;
    }

    throw new HttpException(
      {
        key: 'CODE_GENERATION_FAILED',
        message: 'Failed to generate unique code after multiple attempts',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {},
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  async create(dto: CreateCodeDto) {
    const codes: Code[] = [];
    for (let i = 0; i < dto.quantity; i++) {
      const uniqueCode = await this.generateUniqueCode(
        dto.picture_id,
        dto.part_number,
      );
      const code = new this.codeModel({
        code: uniqueCode,
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

    const filter: any = {};

    if (query.picture_id) {
      filter.picture_id = query.picture_id;
    }

    if (query.part_number !== undefined) {
      filter.part_number = query.part_number;
    }

    if (query.search) {
      filter.code = { $regex: query.search, $options: 'i' };
    }

    const [codes, total] = await Promise.all([
      this.codeModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.codeModel.countDocuments(filter),
    ]);

    const totalPage = Math.ceil(total / limit);

    return {
      data: codes,
      currentPage: page,
      totalPage,
      limit,
      total,
    };
  }
  async validateAndClaimCodes(userId: string, codes: string[]) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException(
        {
          key: 'USER_NOT_FOUND',
          message: 'User not found',
          status: HttpStatus.NOT_FOUND,
          data: {},
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.draw_ticket <= 0) {
      throw new HttpException(
        {
          key: 'NO_DRAW_TICKET',
          message: 'No draw ticket left',
          status: HttpStatus.BAD_REQUEST,
          data: {},
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const codeDocs = await this.codeModel.find({ code: { $in: codes } });

    // Không tìm thấy tất cả code
    const codeMap = new Map(codeDocs.map((c) => [c.code, c]));
    const notFound = codes.filter((code) => !codeMap.has(code));
    if (notFound.length > 0) {
      await this.consumeDrawTicket(userId);
      return {
        success: false,
        message: `Invalid codes: ${notFound.join(', ')}`,
      };
    }

    const usedCodes = codeDocs.filter((c) => c.used_by_user_id || c.is_disabled);
    if (usedCodes.length > 0) {
      await this.consumeDrawTicket(userId);
      return {
        success: false,
        message: `Codes already used or locked: ${usedCodes.map((c) => c.code).join(', ')}`,
      };
    }

    const pictureIds = [...new Set(codeDocs.map((c) => c.picture_id))];
    if (pictureIds.length !== 1) {
      await this.consumeDrawTicket(userId);
      return {
        success: false,
        message: 'Codes must belong to the same picture',
      };
    }
    const pictureId = pictureIds[0];

    const partNumbers = codeDocs.map((c) => c.part_number);
    if (new Set(partNumbers).size + 0 !== codes.length) {
      await this.consumeDrawTicket(userId);
      return { success: false, message: 'Duplicated part numbers in codes' };
    }

    const existingAttempt = await this.pictureAttemptModel.findOne({
      user_id: userId,
      picture_id: pictureId,
    });

    if (existingAttempt?.completed) {
      return { success: false, message: 'This picture was already assembled' };
    }

    if (existingAttempt?.failed) {
      return {
        success: false,
        message: 'You already failed to assemble this picture',
      };
    }

    const prevCorrect = new Set(existingAttempt?.correct_codes || []);
    const newCorrect = codeDocs
      .filter((c) => [1, 2, 3, 4].includes(c.part_number))
      .filter((c) => !prevCorrect.has(c.code))
      .map((c) => c.code);

    const allCorrect = [...new Set([...prevCorrect, ...newCorrect])];

    const now = new Date();
    const attemptCount = (existingAttempt?.attempt_count || 0) + 1;

    const updateAttempt: Partial<PictureAttempt> = {
      submitted_codes: [
        ...new Set([...(existingAttempt?.submitted_codes || []), ...codes]),
      ],
      correct_codes: allCorrect,
      attempt_count: attemptCount,
    };

    if (allCorrect.length === 4) {
      updateAttempt.completed = true;

      // Ghi nhận dùng code
      await Promise.all(
        allCorrect.map((code) =>
          this.codeModel.updateOne(
            { code },
            { $set: { used_by_user_id: userId, used_at: now } },
          ),
        ),
      );

      // Ghi nhận mảnh
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

      // Tạo bản assembled
      await this.assembledModel.create({
        user_id: userId,
        picture_id: pictureId,
        assembled_at: now,
      });

      const prize = await this.drawPrize(userId, pictureId);
      await this.consumeDrawTicket(userId);

      await this.pictureAttemptModel.updateOne(
        { user_id: userId, picture_id: pictureId },
        { $set: updateAttempt },
        { upsert: true },
      );

      return {
        success: true,
        message: 'Picture assembled successfully!',
        prize: prize?.name || 'No prize won',
      };
    }

    if (attemptCount === 2) {
      // Lần thứ 2 vẫn chưa đủ
      updateAttempt.failed = true;

      // Khóa mã đúng đã nhập (không dùng lại được)
      await this.codeModel.updateMany(
        { code: { $in: allCorrect } },
        { $set: { is_locked: true } },
      );
    }

    // Trừ lượt và ghi trạng thái
    await this.consumeDrawTicket(userId);
    await this.pictureAttemptModel.updateOne(
      { user_id: userId, picture_id: pictureId },
      { $set: updateAttempt },
      { upsert: true },
    );

    return {
      success: false,
      message:
        attemptCount === 2
          ? 'Second attempt failed. All codes (even valid ones) are now invalid.'
          : `Partial success: ${allCorrect.length}/4 parts correct. You can try again once.`,
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
