import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const flightInfoTool = createTool({
    id: 'get-flight-info',
    description: 'Fetch flight information by flight number from AeroDataBox',
    inputSchema: z.object({
        
        flightNumber: z.string().describe('Flight Number'),
    }),

    outputSchema: z.object({
        airline: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
        departure: z.string().nullable().optional(),
        arrival: z.string().nullable().optional(),
        scheduledDeparture: z.string().nullable().optional(),
        // actualDeparture: z.string().nullable().optional(),
        scheduledArrival: z.string().nullable().optional(),
        estimatedArrival: z.string().nullable().optional(),
        arrivalTerminal: z.string().nullable().optional(),
        arrivalGate: z.string().nullable().optional(),
        aircraft: z.string().nullable().optional(),
        lastUpdated: z.string().nullable().optional().describe('Last Updated'),
    }),
    execute: async ({ context }) => {
        const { flightNumber } = context;
        console.log('flightNumber context', flightNumber);

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
            airline: flight.airline?.name || null,
            status: flight.status || null,
            departure: flight.departure?.airport?.name || null,
            arrival: flight.arrival?.airport?.name || null,
            scheduledDeparture: flight.departure?.scheduledTime?.utc || null,
            // actualDeparture: flight.departure?.actualTimeUtc || null,
            scheduledArrival: flight.arrival?.scheduledTime?.utc || null,
            estimatedArrival: flight.arrival?.predictedTime?.utc || null,
            arrivalTerminal: flight.arrival?.terminal || null,
            arrivalGate: flight.arrival?.gate || null,
            aircraft: flight.aircraft?.model || null,
            lastUpdated: flight?.lastUpdatedUtc || null,
        };
    },
});
