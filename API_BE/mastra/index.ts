import { Mastra } from '@mastra/core';
import { myAgent } from './agents';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';

config();

export const mastra = new Mastra({
  agents: { myAgent },
});

// Start a conversation
const threadId = '12346';
const resourceId = 'SOME_USER_ID';

async function main() {
  console.log(process.env.GROQ_API_KEY);
  const response = await myAgent.stream(
    [
      {
        role: 'user',
        content: 'What did i just ask you?',
      },
    ],
    {
      memory: {
        thread: threadId,
        resource: resourceId,
      },
    },
  );

  for await (const chunk of response.textStream) {
    process.stdout.write(chunk); // ⌨️ Display to terminal as it comes in
  }
}

main();
