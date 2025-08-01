import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCodeDto {
  @ApiProperty({
    description: 'The quantity of codes to create',
    example: 100,
  })
  @IsNotEmpty()
  @IsArray()
  quantity: number[];

  @ApiProperty({
    description: 'The picture ID for the codes',
    example: 'GACHA-',
  })
  @IsNotEmpty()
  @IsString()
  picture_id: string;

  @ApiProperty({
    description: 'The part number for the codes',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(4)
  part_number: number;
}
