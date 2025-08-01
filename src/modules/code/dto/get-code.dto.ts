import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetListCodeDto {
  @ApiPropertyOptional({
    description: 'The page number for pagination',
    example: 1,
    type: Number,
    default: 1,
  })
  page: number;

  @ApiPropertyOptional({
    description: 'The number of items to return per page',
    example: 10,
    type: Number,
    default: 10,
  })
  limit: number;

  @ApiPropertyOptional({
    description: 'Filter by picture ID',
    example: 'GACHA-123',
  })
  @IsOptional()
  @IsString()
  picture_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by part number',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  part_number?: number;

  @ApiPropertyOptional({
    description: 'Search by code',
    example: 'GACHA-123-ABCDEF',
  })
  @IsOptional()
  @IsString()
  search?: string; // tìm theo code
}
