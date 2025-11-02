import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const flightInfoTool = createTool({
    id: 'get-flight-info',
    description: 'Fetch flight information by flight number from AeroDataBox',
    inputSchema: z.object({
        flightNumber: z.string().describe('Flight Number'),
    }),

    outputSchema: z.object({
        airline: z.string(),
        status: z.string(),
        departure: z.string(),
        arrival: z.string(),
        scheduledDeparture: z.string(),
        actualDeparture: z.string(),
        scheduledArrival: z.string(),
        estimatedArrival: z.string(),
        arrivalTerminal: z.string(),
        arrivalGate: z.string(),
        aircraft: z.string(),
        lastUpdated: z.string().describe('Last Updated'),
    }),
    execute: async ({ context }) => {
        const { flightNumber } = context;

        const flightInfoUrl = `https://aero-data-box.p.rapidapi.com/flights/number/${encodeURIComponent(flightNumber)}`;
        const flightInfoResponse = await fetch(flightInfoUrl, {
            headers: {
                "X-RapidAPI-Key": process.env.RAPID_API_KEY!,
                "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
            },
        });
        const flightData = await flightInfoResponse.json();

        if (!Array.isArray(flightData) || flightData.length === 0) {
            throw new Error(`Flight '${flightNumber}' not found`);
        }

        const flight = flightData[0]; //grab first flight
        console.log('flight data', flight);


        return {
            airline: flight.airline?.name,
            status: flight.status,
            departure: flight.departure?.airport?.name,
            arrival: flight.arrival?.airport?.name,
            scheduledDeparture: flight.departure?.scheduledTime?.utc,
            actualDeparture: flight.departure?.actualTimeUtc,
            scheduledArrival: flight.arrival?.scheduledTime?.utc,
            estimatedArrival: flight.arrival?.predictedTime?.utc,
            arrivalTerminal: flight.arrival?.terminal,
            arrivalGate: flight.arrival?.gate,
            aircraft: flight.aircraft?.model,
            lastUpdated: flight.lastUpdatedUtc,
        };
    },
});
