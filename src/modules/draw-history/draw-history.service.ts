import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Code } from '../../models/code.model';
import { Model } from 'mongoose';
import { DrawHistory } from 'src/models/draw-history.model';

@Injectable()
export class DrawHistoryService {
  constructor(
    @InjectModel(DrawHistory.name) private readonly drawHistoryModel: Model<DrawHistory>,
  ) {}
}
