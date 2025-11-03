// import { createStep, createWorkflow } from '@mastra/core/workflows';
// import { z } from 'zod';

// const parseUserInput = createStep({
//     id: 'parse-user-input',
//     description: 'Parses user input to assert flight tracking intent and extract flight number',
//     inputSchema: z.object({
//         userMessage: z.string().describe('The user message to parse'),
//     }),
//     outputSchema: z.object({
//         intent: z.string(),
//         flightNumber: z.string().nullable(),
//         response: z.string(),
//     }),
//     execute: async ({ inputData, mastra }) => {
//         if (!inputData) {
//             throw new Error('Input data not found');
//         }

//         const agent = mastra?.getAgent('promptParserAgent');
//         if (!agent) {
//             throw new Error('Prompt parser agent not found');
//         }

//         const prompt = `Parse this user message and extract flight tracking information: "${inputData.userMessage}"

//     Return a JSON object with:
//     - intent: "track_flight" if it's a flight query, "out_of_scope" otherwise
//     - flightNumber: the flight number extracted from the message (e.g. EK202, DL145, BA49), or null if not a flight query
//     - response: a friendly summary of what you'll do`;

//         const response = await agent.generate(prompt, {
//             structuredOutput: {
//                 schema: z.object({
//                     intent: z.string(),
//                     flightNumber: z.string().nullable(),
//                     response: z.string(),
//                 }),
//             },
//         });

//         const parsed = response.object;

//         if (parsed.intent !== 'track_flight') {
//             throw new Error(`Out of scope: ${parsed.response}`);
//         }

//         if (!parsed.flightNumber) {
//             throw new Error('Flight number not found in user message');
//         }

//         return parsed;
//     },
// });

// const trackFlight = createStep({
//     id: 'track-flight',
//     description: 'Uses flight tracker agent to get flight information for the parsed flight number',
//     inputSchema: z.object({
//         intent: z.string(),
//         flightNumber: z.string().nullable(),
//         response: z.string(),
//     }),
//     outputSchema: z.object({
//         flightInfo: z.string(),
//         flightNumber: z.string(),
//     }),
//     execute: async ({ inputData, mastra }) => {
//         const { flightNumber } = inputData;

//         if (!flightNumber) {
//             throw new Error('Flight number is required');
//         }

//         const agent = mastra?.getAgent('flightTrackerAgent');
//         if (!agent) {
//             throw new Error('Flight tracker agent not found');
//         }

//         const prompt = `Track flight ${flightNumber} and provide me with the current flight status, departure and arrival information, and any relevant updates.`;

//         const response = await agent.generate(prompt, {
//             memory: {
//                 thread: `flight-query-${flightNumber}`,
//                 resource: 'flight-tracker-workflow',
//             },
//         });

//         return {
//             flightInfo: response.text,
//             flightNumber,
//         };
//     },
// });

// const flightTrackerWorkflow = createWorkflow({
//     id: 'flight-tracker-workflow',
//     inputSchema: z.object({
//         userMessage: z.string().describe('The user message to process'),
//     }),
//     outputSchema: z.object({
//         flightInfo: z.string(),
//         flightNumber: z.string(),
//     }),
// })
//     .then(parseUserInput)
//     .then(trackFlight);

// flightTrackerWorkflow.commit();

// export { flightTrackerWorkflow };