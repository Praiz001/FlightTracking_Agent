import { Agent } from "@mastra/core/agent";
import { flightInfoTool } from "../tools/flight-info-tool";
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

export const flightTrackerAgent = new Agent({
  name: "Flight Tracker",
  description: "Tracks live flight information by flight number.",
  instructions: `
    You are an aviation assistant that provides clear, concise flight updates.
    When given flight data, summarize it in a friendly, informative way.
  `,
  model: 'openai/gpt-4o-mini',
  tools: [flightInfoTool],
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});