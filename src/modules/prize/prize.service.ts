import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prize } from '../../models/prize.model';
import { Model } from 'mongoose';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { GetListPrizeDto } from './dto/get-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';

@Injectable()
export class PrizeService {
  constructor(
    @InjectModel(Prize.name) private readonly prizeModel: Model<Prize>,
  ) {}

  async create(dto: CreatePrizeDto) {
    // Tính tổng win_rate hiện tại
    const aggregate = await this.prizeModel.aggregate([
      {
        $group: {
          _id: null,
          totalWinRate: { $sum: '$win_rate' },
        },
      },
    ]);

    const currentTotal = aggregate[0]?.totalWinRate || 0;
    const newTotal = currentTotal + dto.win_rate;

    if (newTotal > 1) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Total win rate cannot exceed 1',
          data: {
            currentTotal,
            newTotal,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prizeModel.create(dto);
  }

  async getAll(query: GetListPrizeDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const filter: any = {};
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    const [prizes, total] = await Promise.all([
      this.prizeModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.prizeModel.countDocuments(filter),
    ]);

    const totalPage = Math.ceil(total / limit);

    return {
      data: prizes,
      currentPage: page,
      totalPage,
      limit,
      total,
    };
  }

  async updateOne(id: string, dto: UpdatePrizeDto) {
    const prize = await this.prizeModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!prize) {
      throw new Error('Prize not found');
    }
    return prize;
  }

  async findOne(id: string) {
    return this.prizeModel.findById(id).lean();
  }

  async delete(id: string) {
    return this.prizeModel.findByIdAndDelete(id);
  }

  // Thống kê: đã trúng bao nhiêu phần thưởng mỗi loại
  async getPrizeStats() {
    const result = await this.prizeModel.aggregate([
      {
        $lookup: {
          from: 'drawhistories',
          localField: '_id',
          foreignField: 'prize_id',
          as: 'draws',
        },
      },
      {
        $project: {
          name: 1,
          quantity_remaining: 1,
          win_rate: 1,
          is_active: 1,
          total_won: { $size: '$draws' },
        },
      },
    ]);
    return result;
  }
}
