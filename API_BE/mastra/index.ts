import { Mastra } from '@mastra/core';
import { myAgent } from './agents';
// Environment variables are loaded in src/main.ts at application startup

export const mastra = new Mastra({
  agents: { myAgent },
});
