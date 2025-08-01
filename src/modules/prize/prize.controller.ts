import { Controller, Get, Post, Body, Query, UseGuards, Delete, Patch, Param } from '@nestjs/common';
import { PrizeService } from './prize.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { GetListPrizeDto } from './dto/get-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';

@Controller('prizes')
@ApiTags('prizes')
export class PrizeController {
  constructor(private readonly prizeService: PrizeService) {}

  @Get()
  async getAll(@Query() query: GetListPrizeDto) {
    return this.prizeService.getAll(query);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('JWT-auth')
  async create(@Body() dto: CreatePrizeDto) {
    return this.prizeService.create(dto);
  }

  @Get('stats')
  async getStats() {
    return this.prizeService.getPrizeStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prizeService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePrizeDto) {
    return this.prizeService.updateOne(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.prizeService.delete(id);
  }
}
