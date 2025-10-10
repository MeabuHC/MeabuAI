import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StreamRequestDto {
  @ApiProperty({
    description:
      'Unique identifier for the conversation thread (optional - will be generated if not provided)',
    example: 'thread_12345',
    required: false,
  })
  @IsString()
  @IsOptional()
  threadId?: string;

  @ApiProperty({
    description: 'The message content to send to the AI',
    example: 'Hello, how are you today?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description:
      'Timestamp for conversation update (optional - will use current time if not provided)',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  updatedAt?: string;
}

export class PublicStreamRequestDto {
  @ApiProperty({
    description:
      'Unique identifier for the conversation thread (optional - will be generated if not provided)',
    example: 'thread_12345',
    required: false,
  })
  @IsString()
  @IsOptional()
  threadId?: string;

  @ApiProperty({
    description: 'Unique identifier for the user/resource',
    example: 'aadf8677-a1c5-44bf-9be0-1be14ac90545',
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: 'The message content to send to the AI',
    example: 'Hello, how are you today?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description:
      'Timestamp for conversation update (optional - will use current time if not provided)',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  updatedAt?: string;
}
