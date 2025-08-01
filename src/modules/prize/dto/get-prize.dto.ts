import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetListPrizeDto {
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
    description: 'Search by name',
    example: 'PRIZE-123',
  })
  @IsOptional()
  @IsString()
  search?: string; // tìm theo name
}
