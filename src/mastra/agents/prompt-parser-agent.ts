import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';


export const promptParserAgent = new Agent({
  name: 'Prompt Parser Agent',
  description: 'Understands user messages and extracts intent and parameters for flight tracking.',
  instructions: `
    You are a natural language interpreter that extracts flight tracking intent and flight number from user messages.

    Your job is to determine:
    1. Whether the user is asking about tracking a flight.
    2. If yes, extract the flight number (e.g. EK202, DL145, BA49).
    3. If the query is NOT about flights, politely tell them it's out of scope.

    Output a JSON object like:
    {
      "intent": "track_flight" | "out_of_scope",
      "flightNumber": "EK202" | null,
      "response": "Human friendly summary"
    }

    When a user says something like:
    - "Track flight DAL2669"
    - "Where's Air Canada 872?"
    - "What's the ETA for BA204?"

    Examples:
    User: "Where's flight DAL2669?"
    Output: {"intent": "track_flight", "flightNumber": "DAL2669", "response": "Sure, let's check DAL2669."}

    User: "Who's the president of the United States?"
    Output: {"intent": "out_of_scope", "flightNumber": null, "response": "I can only track flights for now."}

`,
  model: 'openai/gpt-4o-mini',
  // scorers: {
  //   extraction: {
  //     scorer: scorers.completenessScorer,
  //     sampling: { type: 'ratio', rate: 1 },
  //   },
  // },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});


