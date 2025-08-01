import { Injectable } from '@nestjs/common';
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
    const prize = await this.prizeModel.create(dto);
    return prize;
  }

  async getAll(query: GetListPrizeDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const prizes = await this.prizeModel
      .find()
      .select('-likedBy')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.prizeModel.countDocuments();
    const totalPage = Math.ceil(total / limit);

    return {
      prizes,
      currentPage: page,
      totalPage,
      limit,
      total: total,
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
