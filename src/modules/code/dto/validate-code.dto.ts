import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class ValidateCodesDto {
  @ApiProperty({
    description: 'An array of codes to validate',
    example: ['GACHA-1-1234', 'GACHA-2-5678', 'GACHA-3-9101', 'GACHA-4-1121'],
  })
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  codes: string[];
}
