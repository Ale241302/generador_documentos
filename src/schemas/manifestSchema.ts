import { z } from 'zod';

export const manifestHouseSchema = z.object({
    houseNumber: z.string().optional(),
    shipper: z.string().optional(),
    consignee: z.string().optional(),
    pieces: z.string().optional(),
    unit: z.string().optional(),
    weight: z.string().optional(),
    volume: z.string().optional(),
    description: z.string().optional(),
    usCustomsCode: z.string().optional(),
});

export const manifestSchema = z.object({
    bookingNumber: z.string().optional(),
    masterDocumentNumber: z.string().optional(), // AWB or BL
    manifestDate: z.date().optional(),
    origin: z.string().optional(),
    carrier: z.string().optional(),
    containerNumber: z.string().optional(),
    flightVoyage: z.string().optional(), // Flight or Vessel/Voyage
    departureDate: z.date().optional(),
    destination: z.string().optional(),

    destinationAgent: z.string().optional(),
    notes: z.string().optional(),

    houseBills: z.array(manifestHouseSchema).optional(),
});
