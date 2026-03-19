import { z } from 'zod';

export const cargoItemSchema = z.object({
    pieces: z.string().optional(),
    grossWeight: z.string().optional(),
    unit: z.enum(['kg', 'lb']).optional(),
    rateClass: z.string().optional(),
    itemCode: z.string().optional(),
    chargeableWeight: z.string().optional(),
    rate: z.string().optional(),
    total: z.string().optional(),
    description: z.string().optional(),
});

export const awbSchema = z.object({
    awbPrefix: z.string().optional(),
    awbCode: z.string().optional(),
    awbNumber: z.string().optional(),

    shipperNameAddress: z.string().optional(),
    shipperAccount: z.string().optional(),

    consigneeNameAddress: z.string().optional(),
    consigneeAccount: z.string().optional(),

    agentNameCity: z.string().optional(),
    agentIataCode: z.string().optional(),
    agentAccount: z.string().optional(),
    referenceNumber: z.string().optional(),
    additionalInfo: z.string().optional(),
    accountingInfo: z.string().optional(),

    departureAirport: z.string().optional(),
    destinationAirport: z.string().optional(),
    carrier: z.string().optional(),

    firstStopDest: z.string().optional(),
    firstStopCarrier: z.string().optional(),
    secondStopDest: z.string().optional(),
    secondStopCarrier: z.string().optional(),

    flightNumber: z.string().optional(),
    flightDate: z.date().optional(),
    sciCode: z.string().optional(),

    currency: z.string().optional(),
    wtValPayment: z.enum(['PPD', 'COLL']).optional(),
    otherPayment: z.enum(['PPD', 'COLL']).optional(),
    declaredValueCarriage: z.string().optional(),
    declaredValueCustoms: z.string().optional(),
    insuranceAmount: z.string().optional(),
    handlingInfo: z.string().optional(),

    items: z.array(cargoItemSchema).optional(),

    ppWeightCharge: z.string().optional(),
    collWeightCharge: z.string().optional(),
    valuationCharge: z.string().optional(),
    tax: z.string().optional(),
    otherChargesDesc: z.string().optional(),
    otherChargesAmount: z.string().optional(),

    totalAgentCharges: z.string().optional(),
    totalCarrierCharges: z.string().optional(),
    totalPrepaid: z.string().optional(),
    totalCollect: z.string().optional(),

    exchangeRate: z.string().optional(),
    destCurrencyCharges: z.string().optional(),
    destCharges: z.string().optional(),
    totalCollectCharges: z.string().optional(),

    issueDate: z.date().optional(),
    issuePlace: z.string().optional(),
    agentSignature: z.string().optional(),
    shipperSignature: z.string().optional(),
});
