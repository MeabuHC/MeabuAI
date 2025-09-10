import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/common';
import { AiService } from './ai.service';
import { Response } from 'express';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { UserStrategyResponseDto } from 'src/auth/dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StreamRequestDto, PublicStreamRequestDto } from './dto';

interface RequestWithUser extends Request {
  user: UserStrategyResponseDto;
}

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/stream')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Stream AI response (Authenticated)',
    description:
      'Streams AI response for a given message in a conversation thread. If no threadId is provided, a new thread will be created automatically. The threadId is returned in the X-Thread-Id header. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI response streamed successfully',
    headers: {
      'X-Thread-Id': {
        description:
          'The thread ID used for this conversation (generated if not provided)',
        schema: { type: 'string' },
      },
    },
  })
  @ApiBody({ type: StreamRequestDto })
  async stream(
    @Body() body: StreamRequestDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    const { threadId, message } = body;
    const result = await this.aiService.stream(
      threadId,
      req.user.id,
      message,
      res,
    );
    // Note: The threadId is also available in the X-Thread-Id response header
    return result;
  }

  @Post('/stream/public')
  @ApiOperation({
    summary: 'Stream AI response (Public)',
    description:
      'Streams AI response for a given message. No authentication required. You can configure both threadId and resourceId. If no threadId is provided, a new thread will be created automatically. The threadId is returned in the X-Thread-Id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI response streamed successfully',
    headers: {
      'X-Thread-Id': {
        description:
          'The thread ID used for this conversation (generated if not provided)',
        schema: { type: 'string' },
      },
    },
  })
  @ApiBody({ type: PublicStreamRequestDto })
  async streamPublic(
    @Body() body: PublicStreamRequestDto,
    @Res() res: Response,
  ) {
    const { threadId, resourceId, message } = body;
    const result = await this.aiService.stream(
      threadId,
      resourceId,
      message,
      res,
    );
    // Note: The threadId is also available in the X-Thread-Id response header
    return result;
  }

  @Get('/resources/me/threads')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all threads for the authenticated user',
    description:
      'Retrieves all conversation threads for the currently authenticated user. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of threads retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async getMyThreads(@Req() req: RequestWithUser, @Res() res: Response) {
    const threads = await this.aiService.getThreadsByResourceId(req.user.id);
    return res.status(HttpStatus.OK).json(threads);
  }

  @Get('/resources/:resourceId/threads')
  @ApiOperation({
    summary: 'Get all threads for a specific resource',
    description:
      'Retrieves all conversation threads for a specific resource ID.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'The ID of the resource to get threads for',
    example: 'SOME_USER_ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of threads retrieved successfully',
  })
  async getThreadsByResourceId(
    @Param('resourceId') resourceId: string,
    @Res() res: Response,
  ) {
    const threads = await this.aiService.getThreadsByResourceId(resourceId);
    return res.status(HttpStatus.OK).json(threads);
  }

  @Get('/threads/:threadId')
  @ApiOperation({
    summary: 'Get a specific thread',
    description: 'Retrieves a specific conversation thread by its ID.',
  })
  @ApiParam({
    name: 'threadId',
    description: 'The ID of the thread to get',
  })
  @ApiBearerAuth()
  @Roles(Role.USER)
  async getThreadById(
    @Param('threadId') threadId: string,
    @Res() res: Response,
  ) {
    const threads = await this.aiService.getThreadById(threadId);
    return res.status(HttpStatus.OK).json(threads);
  }

  @Delete('/threads/:threadId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a specific thread',
    description: 'Deletes a specific conversation thread by its ID.',
  })
  async deleteThreadById(
    @Param('threadId') threadId: string,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    const resourceId = req.user.id;
    const thread = await this.aiService.deleteThreadById(threadId, resourceId);
    return res.status(HttpStatus.OK).json(thread);
  }

  @Get('/threads/:threadId/messages')
  @ApiOperation({
    summary: 'Get messages by thread ID',
    description: 'Retrieves messages by thread ID.',
  })
  @ApiBearerAuth()
  @Roles(Role.USER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiQuery({ name: 'before', required: false, type: String })
  @ApiQuery({ name: 'after', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMessagesByThreadId(
    @Param('threadId') threadId: string,
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @Query('before') before?: string,
    @Query('after') after?: string,
    @Query('limit') limit?: number,
  ) {
    const resourceId = req.user.id;
    const messages = await this.aiService.getMessagesByThreadId(
      threadId,
      resourceId,
      before,
      after,
      limit,
    );
    return res.status(HttpStatus.OK).json(messages);
  }
}
