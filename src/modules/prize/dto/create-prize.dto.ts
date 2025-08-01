import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreatePrizeDto {
  @ApiProperty({
    description: 'The name of the prize',
    example: 'Gift Card',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The description of the prize',
    example: 'A gift card for online shopping',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The quantity remaining of the prize',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity_remaining: number;

  @ApiProperty({
    description: 'The win rate of the prize, between 0 and 1',
    example: 0.1,
    minimum: 0,
    maximum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1)
  win_rate: number;
}
