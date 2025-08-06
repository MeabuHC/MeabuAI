import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { myAgent } from 'mastra/agents';

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
}
