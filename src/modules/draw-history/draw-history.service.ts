import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Code } from '../../models/code.model';
import { Model } from 'mongoose';
import { CreateCodeDto } from './dto/create-code.dto';
import { GetListCodeDto } from './dto/get-code.dto';

@Injectable()
export class CodeService {
  constructor(
    @InjectModel(Code.name) private readonly codeModel: Model<Code>,
  ) {}

  async create(dto: CreateCodeDto) {
    const codes: InstanceType<typeof this.codeModel>[] = [];
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

  async search(query: string): Promise<Code[]> {
    return this.codeModel.find({ name: new RegExp(query, 'i') }).exec();
  }
}
