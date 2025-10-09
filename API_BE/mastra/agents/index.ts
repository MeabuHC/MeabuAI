import { groq } from '@ai-sdk/groq';
import { Agent } from '@mastra/core/agent';
import { TokenLimiterProcessor } from '@mastra/core/processors';
import { fastembed } from '@mastra/fastembed';
import { Memory } from '@mastra/memory';
import { PgVector, PostgresStore } from '@mastra/pg';

// Initialize memory with PostgreSQL storage and vector search

const host: string = process.env.DATABASE_HOST as string;
const port: number = parseInt(process.env.DATABASE_PORT as string);
const user: string = process.env.DATABASE_USER as string;
const password: string = process.env.DATABASE_PASSWORD as string;
const database: string = process.env.DATABASE_NAME as string;

export const memory = new Memory({
  storage: new PostgresStore({
    host,
    port,
    user,
    password,
    database,
    ssl: true,
  }),
  vector: new PgVector({
    connectionString: process.env.DATABASE_URL as string,
    pgPoolOptions: {
      connectionTimeoutMillis: 10000,
    },
  }),
  options: {
    threads: {
      generateTitle: {
        model: groq('llama-3.1-8b-instant'),
        instructions:
          'Generate a concise, human-friendly conversation title. Use sentence case (capitalize the first letter), avoid trailing punctuation, and do not wrap in quotes.',
      },
    },
    lastMessages: 15,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
    },
  },
  embedder: fastembed,
});

export const myAgent = new Agent({
  name: 'My Personal Assistant',
  instructions: 'You are a helpful assistant.',
  model: groq('llama-3.1-8b-instant'),
  memory: memory,
  outputProcessors: [
    new TokenLimiterProcessor({
      limit: 1000,
      strategy: 'truncate',
      countMode: 'cumulative',
    }),
  ],
});
