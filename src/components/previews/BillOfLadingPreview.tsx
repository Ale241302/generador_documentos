import { useDocumentStore } from "@/stores/documentStore";
import { WatermarkOverlay } from "@/components/shared/WatermarkOverlay";

// Interface matching the form schema structure
interface BOLData {
    exporterName?: string;
    exporterAddress?: string;
    exporterRut?: string;
    exporterPhone?: string;
    exporterCity?: string;

    consigneeName?: string;
    consigneeAddress?: string;
    consigneeTaxId?: string;
    consigneePhone?: string;
    consigneeCity?: string;

    notifyName?: string;
    notifyAddress?: string;

    agentName?: string;
    agentAddress?: string;

    documentNumber?: string;
    houseNumber?: string;
    exportReferences?: string;
    originPoint?: string;
    routingInstructions?: string;
    loadingTerminal?: string;

    preCarriageBy?: string;
    placeOfReceipt?: string;
    exportVessel?: string;
    portOfLoading?: string;
    portOfDischarge?: string;
    placeOfDelivery?: string;

    containers?: Array<{
        containerNumber?: string;
        sealNumber?: string;
        packageCount?: string;
        packageType?: string;
        description?: string;
        grossWeight?: string;
        measurement?: string;
        marks?: string;
    }>;

    freightType?: string;
    declaredValue?: string;
    masterBillNumber?: string;

    placeOfIssue?: string;
    dateOfIssue?: string; // or Date string from JSON
    authorizedAgent?: string;
    finalBillNumber?: string;
}

export function BillOfLadingPreview({ variant }: { variant: 'original' | 'export' }) {
    const { activeDocumentType, watermark } = useDocumentStore();

    // Load data from draft store
    // Since this component re-renders when store changes, and saveDraft updates store...
    // We need to access the store state directly.
    // But loadDraft is a getter, not a hook selector. 
    // We need to subscribe to the draft in the store.
    const draft = useDocumentStore(state => state.drafts[`draft_${activeDocumentType}`]?.data) as BOLData;

    const data = draft || {};

    // Styles
    const styles = {
        page: {
            padding: '10mm',
            fontSize: '11px',
            fontFamily: "'Roboto Condensed', sans-serif",
            lineHeight: '1.2',
            color: '#000',
            boxSizing: 'border-box' as const,
            height: '100%',
            position: 'relative' as const,
            display: 'flex',
            flexDirection: 'column' as const,
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4mm',
        },
        logo: {
            height: '40px',
        },
        title: {
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase' as const,
            textAlign: 'right' as const,
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            border: '1px solid #000',
            width: '100%',
        },
        box: {
            borderBottom: '1px solid #000',
            borderRight: '1px solid #000',
            padding: '3px 5px',
            minHeight: '25px',
            position: 'relative' as const,
        },
        boxNoRight: {
            borderBottom: '1px solid #000',
            padding: '3px 5px',
            minHeight: '25px',
        },
        boxNoBottom: {
            borderRight: '1px solid #000',
            padding: '3px 5px',
            minHeight: '25px',
        },
        label: {
            fontSize: '9px',
            fontWeight: 'bold',
            display: 'block',
            marginBottom: '2px',
            color: '#444',
        },
        value: {
            fontSize: '11px',
            whiteSpace: 'pre-wrap' as const,
        },
        // Table specific
        tableRow: {
            display: 'flex',
            borderBottom: '1px solid #ccc',
            padding: '4px 0',
        },
        tableHeader: {
            display: 'flex',
            borderBottom: '1px solid #000',
            background: '#f0f0f0',
            padding: '4px 0',
            fontWeight: 'bold',
            fontSize: '10px',
        }
    };

    // Helper for empty fields (dashed line per instructions? "Campos vacíos: border-bottom: 1px dashed #999")
    // The user prompt said: "Campos vacíos: border-bottom: 1px dashed #999."
    // This likely applies to specific fields or mimicking a form.
    // In a preview, usually we just show space. But if requested...
    // I will apply basic styling.

    const Field = ({ label, value, multiline }: { label?: string, value?: string, multiline?: boolean }) => (
        <div style={{ marginBottom: '4px' }}>
            {label && <span style={styles.label}>{label}</span>}
            <div style={{
                ...styles.value,
                minHeight: multiline ? '4em' : '1.2em',
                borderBottom: !value ? '1px dashed #ccc' : 'none'
            }}>
                {value}
            </div>
        </div>
    );

    return (
        <div style={styles.page} className="bl-preview">
            <WatermarkOverlay text={watermark} />

            {/* Header with Logo */}
            <div style={styles.header}>
                <img
                    src="https://storage.googleapis.com/sclcargo/web/Home/logo-largo.png"
                    crossOrigin="anonymous"
                    style={styles.logo}
                    alt="Logo"
                />
                <div style={{ textAlign: 'right' }}>
                    <div style={styles.title}>BILL OF LADING {variant === 'export' ? '(EXPORT)' : '(ORIGINAL)'}</div>
                    <div style={{ fontSize: '12px' }}>CONOCIMIENTO DE EMBARQUE MARÍTIMO</div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div style={styles.grid}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #000' }}>
                    <div style={{ ...styles.box, height: '35mm' }}>
                        <Field label="2. EXPORTER (Principal or Seller-licensee and address incl. ZIP Code)" value={data.exporterName ? `${data.exporterName}\n${data.exporterAddress || ''}\n${data.exporterCity || ''}` : ''} multiline />
                        <div style={{ marginTop: 4, fontSize: '10px' }}>
                            ID/RUT: {data.exporterRut} &nbsp; Tel: {data.exporterPhone}
                        </div>
                    </div>
                    <div style={{ ...styles.box, height: '35mm' }}>
                        <Field label="3. CONSIGNED TO" value={data.consigneeName ? `${data.consigneeName}\n${data.consigneeAddress || ''}\n${data.consigneeCity || ''}` : ''} multiline />
                        <div style={{ marginTop: 4, fontSize: '10px' }}>
                            ID/NIT: {data.consigneeTaxId} &nbsp; Tel: {data.consigneePhone}
                        </div>
                    </div>
                    <div style={{ ...styles.box, height: '30mm', borderBottom: 'none' }}>
                        <Field label="4. NOTIFY PARTY (Complete name and address)" value={data.notifyName ? `${data.notifyName}\n${data.notifyAddress || ''}` : ''} multiline />
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', borderRight: 'none' }}>
                    <div style={{ ...styles.boxNoRight, height: '10mm' }}>
                        <Field label="5. DOCUMENT NUMBER" value={data.documentNumber} />
                    </div>
                    <div style={{ ...styles.boxNoRight, height: '10mm' }}>
                        <Field label="5a. B/L NUMBER (HOUSE)" value={data.houseNumber} />
                    </div>
                    <div style={{ ...styles.boxNoRight, height: '15mm' }}>
                        <Field label="6. EXPORT REFERENCES" value={data.exportReferences} />
                    </div>
                    <div style={{ ...styles.boxNoRight, height: '25mm' }}>
                        <Field label="7. FORWARDING AGENT (Name and address - references)" value={data.agentName ? `${data.agentName}\n${data.agentAddress || ''}` : ''} multiline />
                    </div>
                    <div style={{ ...styles.boxNoRight, height: '15mm' }}>
                        <Field label="8. POINT (STATE) OF ORIGIN OR FTZ NUMBER" value={data.originPoint} />
                    </div>
                    <div style={{ ...styles.boxNoRight, borderBottom: 'none', height: '25mm' }}>
                        <Field label="9. DOMESTIC ROUTING/EXPORT INSTRUCTIONS" value={data.routingInstructions} multiline />
                    </div>
                </div>
            </div>

            {/* Transport Grid */}
            <div style={{ ...styles.grid, borderTop: '1px solid #000' }}>
                <div style={{ width: '50%', borderRight: '1px solid #000' }}>
                    <div style={styles.box}>
                        <Field label="12. PRE-CARRIAGE BY" value={data.preCarriageBy} />
                    </div>
                    <div style={styles.box}>
                        <Field label="14. EXPORTING CARRIER" value={data.exportVessel} />
                    </div>
                    <div style={{ ...styles.box, borderBottom: 'none' }}>
                        <Field label="16. FOREIGN PORT OF UNLOADING" value={data.portOfDischarge} />
                    </div>
                </div>
                <div style={{ width: '50%' }}>
                    <div style={{ ...styles.boxNoRight }}>
                        <Field label="13. PLACE OF RECEIPT BY PRE-CARRIER" value={data.placeOfReceipt} />
                    </div>
                    <div style={{ ...styles.boxNoRight }}>
                        <Field label="15. PORT OF LOADING/EXPORT" value={data.portOfLoading} />
                    </div>
                    <div style={{ ...styles.boxNoRight, borderBottom: 'none' }}>
                        <Field label="17. PLACE OF DELIVERY BY ON-CARRIER" value={data.placeOfDelivery} />
                    </div>
                </div>
            </div>

            {/* Container / Loading */}
            <div style={{ border: '1px solid #000', borderTop: 'none', padding: '0' }}>
                <div style={styles.boxNoRight}>
                    <Field label="10. LOADING PIER / TERMINAL" value={data.loadingTerminal} />
                </div>
            </div>

            {/* Cargo Detail Header */}
            <div style={{ border: '1px solid #000', borderTop: 'none', display: 'grid', gridTemplateColumns: '20% 10% 45% 15% 10%', fontSize: '10px', fontWeight: 'bold', background: '#e5e5e5' }}>
                <div style={{ padding: '4px', borderRight: '1px solid #000' }}>MARKS AND NUMBERS</div>
                <div style={{ padding: '4px', borderRight: '1px solid #000' }}>NO. OF PKGS</div>
                <div style={{ padding: '4px', borderRight: '1px solid #000' }}>DESCRIPTION OF COMMODITIES</div>
                <div style={{ padding: '4px', borderRight: '1px solid #000' }}>GROSS WEIGHT</div>
                <div style={{ padding: '4px' }}>MEASUREMENT</div>
            </div>

            {/* Cargo Detail Rows */}
            <div style={{ border: '1px solid #000', borderTop: 'none', flex: 1, minHeight: '80mm', position: 'relative' }}>
                {data.containers?.map((c, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '20% 10% 45% 15% 10%', fontSize: '11px', padding: '4px 0' }}>
                        <div style={{ padding: '0 4px', whiteSpace: 'pre-wrap' }}>{c.containerNumber}<br />{c.sealNumber ? `Seal: ${c.sealNumber}` : ''}</div>
                        <div style={{ padding: '0 4px', textAlign: 'center' }}>{c.packageCount}</div>
                        <div style={{ padding: '0 4px', whiteSpace: 'pre-wrap' }}>
                            {c.packageType ? `${c.packageType} - ` : ''}{c.description}
                        </div>
                        <div style={{ padding: '0 4px', textAlign: 'right' }}>{c.grossWeight ? `${c.grossWeight} kg` : ''}</div>
                        <div style={{ padding: '0 4px', textAlign: 'right' }}>{c.measurement ? `${c.measurement} m³` : ''}</div>
                    </div>
                ))}
                {/* Totals at the bottom of cargo area */}
                {data.containers && data.containers.length > 0 && (
                    <div style={{ marginTop: '10px', borderTop: '1px dashed #000', paddingTop: '4px', display: 'grid', gridTemplateColumns: '20% 10% 45% 15% 10%', fontWeight: 'bold' }}>
                        <div>TOTALS</div>
                        <div style={{ textAlign: 'center' }}>{data.containers.reduce((a, b) => a + (Number(b.packageCount) || 0), 0)}</div>
                        <div></div>
                        <div style={{ textAlign: 'right' }}>{data.containers.reduce((a, b) => a + (Number(b.grossWeight) || 0), 0).toFixed(2)} kg</div>
                        <div style={{ textAlign: 'right' }}>{data.containers.reduce((a, b) => a + (Number(b.measurement) || 0), 0).toFixed(2)} m³</div>
                    </div>
                )}
            </div>

            {/* Bottom Section */}
            <div style={{ border: '1px solid #000', borderTop: 'none', display: 'flex' }}>
                <div style={{ width: '50%', borderRight: '1px solid #000' }}>
                    <div style={{ ...styles.box, height: '15mm' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={styles.label}>FREIGHT & CHARGES</span>
                            <span style={{ fontWeight: 'bold' }}>{data.freightType}</span>
                        </div>
                    </div>
                    <div style={{ ...styles.box, height: '15mm' }}>
                        <Field label="DECLARED VALUE" value={data.declaredValue} />
                    </div>
                    <div style={{ ...styles.box, borderBottom: 'none' }}>
                        <Field label="MASTER B/L NO." value={data.masterBillNumber} />
                    </div>
                </div>
                <div style={{ width: '50%', padding: '5px' }}>
                    <div style={{ marginBottom: '10mm' }}>
                        <Field label="DATED AT" value={data.placeOfIssue} />
                        <Field label="DATE" value={data.dateOfIssue ? new Date(data.dateOfIssue).toLocaleDateString('es-CL') : ''} />
                    </div>
                    <div style={{ marginBottom: '5mm' }}>
                        <Field label="SIGNED BY" value={data.authorizedAgent} />
                        <span style={{ fontSize: '9px' }}>AS AGENT FOR THE CARRIER</span>
                    </div>
                    <div style={{ borderTop: '1px solid #000', paddingTop: '4px' }}>
                        <Field label="B/L NO." value={data.finalBillNumber} />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', fontSize: '9px', textAlign: 'center', color: '#666', paddingTop: '2mm' }}>
                Magaya Cargo System · www.magaya.com
            </div>
        </div>
    );
}
