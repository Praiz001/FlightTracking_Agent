import { z } from 'zod';

const flightDataSchema = z.object({
    airline: z.string().optional(),
    status: z.string().optional(),
    aircraft: z.string().optional(),
    lastUpdated: z.string().optional(),
    //departure
    departureAirport: z.string().optional(),
    departureScheduledAt: z.string().optional(),
    departureCity: z.string().optional(),
    //arrival
    arrivalAirport: z.string().optional(),
    arrivalScheduledAt: z.string().optional(),
    arrivalEstimatedAt: z.string().optional(),
    arrivalTerminal: z.string().optional(),
    arrivalGate: z.string().optional(),
    arrivalCity: z.string().optional(),
}).describe('The flight data retrieved from Aerodatabox API');

export { flightDataSchema };