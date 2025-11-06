import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { flightDataSchema } from '../../schemas/flight-tracker';

export const flightInfoTool = createTool({
    id: 'get-flight-info',
    description: 'Fetch flight information by flight number from AeroDataBox',
    inputSchema: z.object({
        flightNumber: z.string().describe('Flight Number'),
    }),

    outputSchema: flightDataSchema,
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
            aircraft: flight.aircraft?.model,
            lastUpdated: flight?.lastUpdatedUtc 
                ? new Date(flight.lastUpdatedUtc).toLocaleString() 
                : undefined,
            //departure
            departureCity: flight.departure?.airport?.city?.name,
            departureAirport: flight.departure?.airport?.name,
            departureScheduled: flight.departure?.scheduledTime?.local,
            //arrival
            arrivalCity: flight.arrival?.airport?.city?.name,
            arrivalAirport: flight.arrival?.airport?.name,
            arrivalScheduledAt: flight.arrival?.scheduledTime?.local,
            arrivalEstimatedAt: flight.arrival?.predictedTime?.local,
            arrivalTerminal: flight.arrival?.terminal,
            arrivalGate: flight.arrival?.gate,
        };
    },
});
