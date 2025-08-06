import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/common';
import { AiService } from './ai.service';
import { Response } from 'express';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { UserStrategyResponseDto } from 'src/auth/dto';

interface RequestWithUser extends Request {
  user: UserStrategyResponseDto;
}

@Controller('ai')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/stream')
  @Roles(Role.USER)
  async stream(
    @Body() body: { threadId: string; message: string },
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    const { threadId, message } = body;
    await this.aiService.stream(threadId, req.user.id, message, res);
  }
}
