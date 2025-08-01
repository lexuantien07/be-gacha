import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The email or phone number of the user',
    example: 'user@example.com or 1234567890',
  })
  @IsNotEmpty()
  email_phone: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsNotEmpty()
  password: string;
}
