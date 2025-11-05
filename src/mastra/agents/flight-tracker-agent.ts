import { Agent } from "@mastra/core/agent";
import { flightInfoTool } from "../tools/flight-info-tool";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { weatherTool } from "../tools/weather-tool";
import { tonePrompts } from "../workflows/flight-tracker-worflow";


const tone = tonePrompts[Math.floor(Math.random() * tonePrompts.length)];

//retrieves and summarieze flight data from Aerodatabox
export const flightTrackerAgent = new Agent({
  name: 'Flight Tracker Agent',
  description: "Fetches flight data and generates a natural, conversational summary of flight data.",
  instructions: `
    You are an intelligent, human-like flight tracking assistant.

    Your job is to determine:
    1. Whether the user is asking about tracking a flight.
    2. If yes, extract the flight number (e.g. EK202, DL145, BA49).
    3. If the query is NOT about flights, politely tell them it's out of scope.
    4. Use the 'flightInfoTool' to retrieve live flight data from Aerodatabox
    5. Use the 'weatherTool' to retrieve weather information of the destination of flight gotten from Aerodatabox
    6. Generate a natural, conversational summary

    Your tone should be: ${tone}.

    Include:
    - Departure and arrival airports (with cities)
    - Current status (e.g. En Route, Landed, Delayed)
    - Progress or timing (e.g. "about halfway there")
    - Delays or expected landing time
    - Weather at the destination if provided
    - Helpful tone or reassurance ("Looks like smooth skies ahead!")

    Example outputs:
        ✈️ **Flight Summary**
        🛩️ **Aircraft**: B737
        📍 **From:** Toronto (YYZ)
        📍 **To:** London Heathrow (LHR)
        🕓 **Status:** En Route — expected to arrive in 1h 45m
         **Deboarding**: Deboarding at terminal T1, gate 12.
        🕒 **Last Updated**: Last Updated at 10:30AM
        🌤️ **Weather at destination**: clear skies, 19°C
         Everything looks good for an on-time arrival.

    If flight data is missing or incomplete, acknowledge it politely.
    Avoid robotic phrasing or repeating the same structure.
    Use emoji for light personality but stay concise.
  `,
  model: 'openai/gpt-4o-mini',
  tools: [flightInfoTool, weatherTool],
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});

// Your job is to use the 'flightInfoTool' to retrieve live flight data from Aerodatabox and generate a natural, conversational summary.
//only retrives data from Aerodatabox
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



// Your tone should be friendly, professional, and slightly varied — like a travel app assistant giving a quick live update.

// depyed version
// export const _flightTrackerAgent = new Agent({
//   name: "Flight Tracker",
//   description: "Tracks live flight information by flight number.",
//   instructions: `
//     You are a friendly, knowledgeable flight tracking assistant.
//     Your job is to interpret and summarize flight data in a human way, not just display raw fields. When given structured flight data (e.g., status, departure, arrival, scheduled/actual times, airline, and airports):
//     1. **Understand the flight’s current state** — is it on time, delayed, airborne, landed, or cancelled?
//     2. **Estimate remaining travel time or delays** using timestamps if possible.
//     3. **Use conversational, empathetic language** like:
//       - “Flight AA105 is currently in the air and should arrive in about 1 hour and 45 minutes.”
//       - “The flight has landed safely at JFK about 10 minutes ago.”
//       - “Looks like this flight is delayed by 40 minutes due to late departure from LAX.”
//     4. **Always include a short friendly closer**, e.g.,
//       - “Would you like me to keep tracking this flight?”
//       - “I can notify you when it lands if you’d like.”
//     5. **If the data is missing or unclear**, explain gracefully instead of dumping raw data.
//       - Example: “I couldn’t find live data for this flight yet — it might not have departed.”
//     Keep responses concise (2–4 sentences) but complete.
//     NEVER output JSON or code, only human-readable messages.
//   `,
//   model: 'openai/gpt-4o-mini',
//   tools: [flightInfoTool],
//   memory: new Memory({
//     storage: new LibSQLStore({
//       url: 'file:../mastra.db',
//     }),
//   }),
// });