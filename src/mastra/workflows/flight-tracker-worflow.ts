import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { getWeather } from '../tools/weather-tool';
import { flightDataSchema } from '../../schemas/flight-tracker';

export const tonePrompts = [ //this is a list of tone prompts to use for the parser agent
    "Write casually, like you're chatting with a traveler.",
    "Be confident and professional, as if you work in air traffic control.",
    "Sound friendly and reassuring, like a flight tracking app assistant.",
    "Be precise but conversational, like you're narrating a flight update."
];

//step 1: parses the user message to extract the intent and flight number
const parseUserInput = createStep({
    id: 'parse-user-input',
    description: 'Extracts flight number and intent from user message',

    inputSchema: z.object({
        userMessage: z.string().describe('The user message to parse'),
    }),
    outputSchema: z.object({
        intent: z.string(),
        flightNumber: z.string().nullable(),
        response: z.string(),
    }),


    execute: async ({ inputData, mastra }) => {
        const { userMessage } = inputData;
        if (!userMessage) {
            throw new Error('Input data not found');
        }

        const parserAgent = mastra?.getAgent('promptParserAgent');
        if (!parserAgent) throw new Error('Parser agent not found.');

        const prompt = `
            Here is the user message: ${userMessage}
            Parse the user message as described in your instructions.
        `;


        const response = await parserAgent.generate(prompt, {
            structuredOutput: {
                schema: z.object({
                    intent: z.string(),
                    flightNumber: z.string().nullable(),
                    response: z.string(),
                }),
            },
        });

        const parsedResponse = response.object;

        if (parsedResponse.intent !== 'track_flight') {
            throw new Error(`Out of scope: ${parsedResponse.response}`);
        }

        if (!parsedResponse.flightNumber) {
            throw new Error('Flight number not found in user message');
        }

        console.log('parsedResponse workflow', parsedResponse);
        return parsedResponse;
    }
});

//step 2: uses the flight tracker agent to get the flight information
const trackFlight = createStep({
    id: 'track-flight',
    description: 'Fetches flight data using Aerodatabox API',
    inputSchema: z.object({
        intent: z.string(),
        flightNumber: z.string().nullable(),
        response: z.string(),
    }),
    outputSchema: flightDataSchema,

    execute: async ({ inputData, mastra }) => {
        const { intent, flightNumber } = inputData;

        if (intent !== 'track_flight') {
            throw new Error(`Out of scope: ${intent}`);
        }

        if (!flightNumber)
            throw new Error('No flight number provided.');

        const trackerAgent = mastra?.getAgent('flightTrackrAgent');
        if (!trackerAgent) throw new Error('Tracker agent not found.');

        const prompt = `
            Here is the flight number: ${flightNumber}
            Track and provide the flight data as described in your instructions.
        `;

        const response = await trackerAgent.generate(prompt, {
            structuredOutput: {
                schema: flightDataSchema,
            },
            memory: {
                thread: `flight-query-${flightNumber}`,
                resource: 'flight-tracker-workflow',
            },
        });

        const flightDataRes = response.object;
        console.log('flightDataRes workflow', flightDataRes);

        return flightDataRes;
    },

});

//step 3: generate natural summary
const summarizeFlightData = createStep({
    id: 'summarize-flight-data',
    description: 'Summarizes tracked flight data with tone variation and destination weather',

    inputSchema: flightDataSchema,

    outputSchema: z.object({
        summary: z.string(),
    }),

    execute: async ({ inputData, mastra }) => {
        const summaryAgent = mastra?.getAgent('flightSummaryAgent');
        if (!summaryAgent) throw new Error('Summary agent not found.');

        const flightData = inputData;

        // fetch weather data for destination
        const destination = flightData?.arrivalCity || '';
        let destinationWeather = null;
        if (destination) {
            try {
                destinationWeather = await getWeather(destination);
            } catch (err: any) {
                console.warn('workflow: Weather fetch failed:', err.message);
            }
        }

        // random tone for the summary
        const tone = tonePrompts[Math.floor(Math.random() * tonePrompts.length)];
        console.log('tone', tone);

        const prompt = `
            Here is the flight data: ${JSON.stringify(flightData)}
            ${destinationWeather ? `Destination weather: ${JSON.stringify(destinationWeather)}` : ''}
            Generate a summary of the flight data and destination weather with the following tone: ${tone},
            and as described in your instructions.
        `;

        // const response = await summaryAgent.generate(prompt);
        // return { summary: response.text || null };

        const response = await summaryAgent.stream([
            {
                role: 'user',
                content: prompt,
            },
        ]);

        let summaryText = '';

        for await (const chunk of response.textStream) {
            process.stdout.write(chunk);
            summaryText += chunk;
        }
        console.log('summaryText workflow', summaryText);

        return {
            summary: summaryText,
        };
    }
});

const flightTrackerWorkflow = createWorkflow({
    id: 'flight-tracker-workflow',
    inputSchema: z.object({
        userMessage: z.string().describe('The user message to process'),
    }),
    outputSchema: z.object({
        summary: z.string().describe('The summary of the flight data and destination weather'),
    }),
})
    .then(parseUserInput)
    .then(trackFlight)
    .then(summarizeFlightData)
    .commit();

export { flightTrackerWorkflow };