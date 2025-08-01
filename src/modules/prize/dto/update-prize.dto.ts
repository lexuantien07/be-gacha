import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdatePrizeDto {
  @ApiPropertyOptional({
    description: 'The name of the prize',
    example: 'Gift Card',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'The description of the prize',
    example: 'A gift card for online shopping',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The quantity remaining of the prize',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  quantity_remaining?: number;

  @ApiPropertyOptional({
    description: 'The win rate of the prize, between 0 and 1',
    example: 0.1,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  win_rate?: number;

  @ApiPropertyOptional({
    description: 'The quantity remaining of the prize',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
