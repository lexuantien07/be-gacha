import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CodeService } from './draw-history.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateCodeDto } from './dto/create-code.dto';
import { GetListCodeDto } from './dto/get-code.dto';

@Controller('codes')
@ApiTags('codes')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Get()
  async getAll(@Query() query: GetListCodeDto) {
    return this.codeService.getAll(query);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('JWT-auth')
  async create(@Body() dto: CreateCodeDto) {
    return this.codeService.create(dto);
  }
}
