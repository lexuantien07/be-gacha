import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CollectorBoardService } from './collector-board.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('collector-board')
@ApiTags('collector-board')
export class CollectorBoardController {
  constructor(private readonly collectorBoardService: CollectorBoardService) {}

  @Get('top-collectors')
  getTopCollectors() {
    return this.collectorBoardService.getTopCollectorsByCount();
  }

  @Get('fastest-collectors')
  getFastestCollectors() {
    return this.collectorBoardService.getFastestCollectors();
  }
}
