import { Agent } from "@mastra/core/agent";
import { flightInfoTool } from "../tools/flight-info-tool";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";


export const flightDataRetrieverAgent = new Agent({
    name: 'Flight Data Retriever Agent',
    description: "Retrieves live flight information by flight number using the flightInfoTool.",
    instructions: `
    You are a flight tracking specialist. 
    Use the 'flightInfoTool' to retrieve live flight data from Aerodatabox.

    When given a flight number (e.g., "DAL2669"):
      1. Call the tool with that flight number.
      2. Return the raw structured data (status, departure, arrival, ETA, delays, etc).
      3. If no data is found, say "No live data available for that flight right now."

      Example:
        Input: "DAL2669"
        Output:
          {
            "status": "In Flight",
            "airline": "Delta",
            "aircraft": "B737",
            "lastUpdated": "2024-01-15T10:45:00Z",

            "departure": {
              "city": "Los Angeles",
              "airport": "LAX",
              "scheduled": "2024-01-15T10:30:00Z",
              "actual": "2024-01-15T10:45:00Z",
            },
            "arrival": {
              "city": "New York",
              "airport": "JFK",
              "scheduled": "2024-01-15T18:45:00Z",
              "estimated": "2024-01-15T19:00:00Z",
              "terminal": "T1",
              "gate": "12",
            },
          }

          Input: "some bad flight number",
          Output: "No live data available for that flight right now.
         
      Do not summarize here — just fetch and return clean structured flight data.
`,
    model: 'openai/gpt-4o-mini',
    tools: [flightInfoTool],
    memory: new Memory({
        storage: new LibSQLStore({
            url: 'file:../mastra.db',
        }),
    }),
});