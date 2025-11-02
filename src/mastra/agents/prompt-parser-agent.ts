import { Agent } from '@mastra/core/agent';



export const promptParserAgent = new Agent({
  name: 'Prompt Parser Agent',
  description: 'Understands user messages and extracts intent and parameters for flight tracking.',
  instructions: `
    You are a message understanding assistant for a flight tracking system.
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

    Examples:
    User: "Track EK202"
    Output: {"intent": "track_flight", "flightNumber": "EK202", "response": "Sure, let's check EK202."}

    User: "What's the weather in Dubai?"
    Output: {"intent": "out_of_scope", "flightNumber": null, "response": "I can only track flights for now."}
  `,
  model: 'openai/gpt-4o-mini',
});

