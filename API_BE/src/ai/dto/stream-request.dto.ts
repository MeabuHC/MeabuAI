import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StreamRequestDto {
  @ApiProperty({
    description: 'Unique identifier for the conversation thread',
    example: 'thread_12345',
  })
  @IsString()
  @IsNotEmpty()
  threadId: string;

  @ApiProperty({
    description: 'The message content to send to the AI',
    example: 'Hello, how are you today?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class PublicStreamRequestDto {
  @ApiProperty({
    description: 'Unique identifier for the conversation thread',
    example: 'thread_12345',
  })
  @IsString()
  @IsNotEmpty()
  threadId: string;

  @ApiProperty({
    description: 'Unique identifier for the user/resource',
    example: 'user_12345',
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
}
