import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssembledPicture } from 'src/models/assembled-pictures.model';

@Injectable()
export class CollectorBoardService {
  constructor(
    @InjectModel(AssembledPicture.name)
    private readonly assembledPictureModel: Model<AssembledPicture>,
  ) {}

  async getTopCollectorsByCount(limit = 10) {
    return this.assembledPictureModel.aggregate([
      {
        $group: {
          _id: '$user_id',
          total_pictures: { $sum: 1 },
          last_assembled: { $max: '$assembled_at' },
        },
      },
      {
        $sort: { total_pictures: -1, last_assembled: 1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          user_id: '$_id',
          email: '$user.email',
          total_pictures: 1,
          last_assembled: 1,
        },
      },
    ]);
  }

  async getFastestCollectors(limit = 10) {
    return this.assembledPictureModel.aggregate([
      {
        $sort: { assembled_at: 1 }, // người ghép sớm nhất mỗi tranh
      },
      {
        $group: {
          _id: { user_id: '$user_id', picture_id: '$picture_id' },
          first_assembled_at: { $first: '$assembled_at' },
        },
      },
      {
        $group: {
          _id: '$_id.user_id',
          total_pictures: { $sum: 1 },
          earliest_assembled: { $min: '$first_assembled_at' },
        },
      },
      { $sort: { earliest_assembled: 1, total_pictures: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          user_id: '$_id',
          email: '$user.email',
          total_pictures: 1,
          earliest_assembled: 1,
        },
      },
    ]);
  }
}
