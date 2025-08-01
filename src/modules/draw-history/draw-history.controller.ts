import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DrawHistoryService } from './draw-history.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('draw-histories')
@ApiTags('draw-histories')
export class DrawHistoryController {
  constructor(private readonly drawHistoryService: DrawHistoryService) {}
}
