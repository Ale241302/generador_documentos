export type WatermarkOption =
    | null
    | 'ORIGINAL'
    | 'NO NEGOCIABLE'
    | 'DRAFT'
    | 'SWB'
    | 'EXPRESS RELEASE';

export type DocumentType = 'bl-original' | 'bl-export' | 'airwaybill' | 'manifest';

export interface DocumentHistoryItem {
    id: string;
    type: DocumentType;
    documentNumber: string;
    savedAt: string; // ISO string
    watermark: WatermarkOption;
    data: unknown;
}

export interface ContainerItem {
    containerNumber?: string;
    sealNumber?: string;
    packageCount?: string;
    packageType?: string;
    description?: string;
    grossWeight?: string;
    measurement?: string;
}

export interface AirWaybillItem {
    pieces?: string;
    grossWeight?: string; // string to allow decimals/formatting
    unit?: 'kg' | 'lb';
    rateClass?: string;
    itemCode?: string;
    chargeableWeight?: string;
    rate?: string;
    total?: string;
    description?: string;
}

export interface ManifestHouseItem {
    houseNumber?: string;
    shipper?: string;
    consignee?: string;
    pieces?: string;
    unit?: string;
    weight?: string;
    volume?: string;
    description?: string;
    usCustomsCode?: string;
}
