import { z } from 'zod';

export const containerSchema = z.object({
    containerNumber: z.string().optional(),
    sealNumber: z.string().optional(),
    packageCount: z.string().optional(),
    packageType: z.string().optional(),
    description: z.string().optional(),
    grossWeight: z.string().optional(),
    measurement: z.string().optional(),
});

export const blSchema = z.object({
    documentNumber: z.string().optional(),
    houseNumber: z.string().optional(),
    exportReferences: z.string().optional(),
    originPoint: z.string().optional(),
    routingInstructions: z.string().optional(),
    loadingTerminal: z.string().optional(),

    exporterName: z.string().optional(),
    exporterAddress: z.string().optional(),
    exporterRut: z.string().optional(),
    exporterPhone: z.string().optional(),
    exporterCity: z.string().optional(),

    consigneeName: z.string().optional(),
    consigneeAddress: z.string().optional(),
    consigneeTaxId: z.string().optional(),
    consigneePhone: z.string().optional(),
    consigneeCity: z.string().optional(),

    notifyName: z.string().optional(),
    notifyAddress: z.string().optional(),

    agentName: z.string().optional(),
    agentAddress: z.string().optional(),

    transportType: z.string().optional(),
    isContainerized: z.boolean().optional(),
    preCarriageBy: z.string().optional(),
    placeOfReceipt: z.string().optional(),
    exportVessel: z.string().optional(),
    portOfLoading: z.string().optional(),
    portOfDischarge: z.string().optional(),
    placeOfDelivery: z.string().optional(),

    containers: z.array(containerSchema).optional(),

    freightType: z.enum(['PREPAID', 'COLLECT']).optional(),
    declaredValue: z.string().optional(),
    masterBillNumber: z.string().optional(),

    placeOfIssue: z.string().optional(),
    dateOfIssue: z.date().optional(),
    authorizedAgent: z.string().optional(),
    finalBillNumber: z.string().optional(),
});
