import { MastraClient } from '@mastra/client-js';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { memory, myAgent } from 'mastra/agents';

@Injectable()
export class AiService {
  constructor() {}

  async stream(
    threadId: string,
    resourceId: string,
    message: string,
    res: Response,
  ) {
    const stream = await myAgent.stream([{ role: 'user', content: message }], {
      memory: { thread: threadId, resource: resourceId },
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream.textStream) {
      res.write(chunk);
    }

    res.end();
  }

  async getThreadsByResourceId(resourceId: string) {
    const threads = await memory.getThreadsByResourceId({ resourceId });
    return threads;
  }

  async getThreadById(threadId: string) {
    const thread = await memory.getThreadById({ threadId });
    return thread;
  }

  async deleteThreadById(threadId: string, resourceId: string) {
    const thread = await memory.getThreadById({ threadId });
    if (thread?.resourceId !== resourceId) {
      throw new BadRequestException(
        'You are not authorized to delete this thread',
      );
    }

    await memory.deleteThread(threadId);
    return { message: 'Thread deleted successfully' };
  }

  async getMessagesByThreadId(
    threadId: string,
    resourceId: string,
    before?: string,
    after?: string,
    limit = 20,
  ) {
    if (before) {
      return memory.query({
        threadId: threadId,
        resourceId: resourceId,
        selectBy: {
          include: [
            {
              id: before,
              withPreviousMessages: limit,
            },
          ],
        },
      });
    }

    if (after) {
      return memory.query({
        threadId: threadId,
        resourceId: resourceId,
        selectBy: {
          include: [
            {
              id: after,
              withNextMessages: limit,
            },
          ],
        },
      });
    }

    return await memory.query({
      threadId: threadId,
      resourceId: resourceId,
      selectBy: {
        last: limit,
      },
    });
  }
}
