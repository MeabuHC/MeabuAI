import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'congminh23092004@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '23092004', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
