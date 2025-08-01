import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CodeService } from './code.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCodeDto } from './dto/create-code.dto';
import { GetListCodeDto } from './dto/get-code.dto';
import { ValidateCodesDto } from './dto/validate-code.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('codes')
@ApiTags('codes')
@ApiSecurity('JWT-auth')
@UseGuards(AuthGuard('jwt'))
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Get()
  async getAll(@Query() query: GetListCodeDto) {
    return this.codeService.getAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new code' })
  async create(@Body() dto: CreateCodeDto) {
    return this.codeService.create(dto);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate and claim codes' })
  async validateAndClaim(@Body() dto: ValidateCodesDto, @Req() req: any) {
    return this.codeService.validateAndClaimCodes(req.user_data._id, dto.codes);
  }
}
