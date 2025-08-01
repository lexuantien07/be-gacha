import { ApiPropertyOptional } from '@nestjs/swagger';

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
}
