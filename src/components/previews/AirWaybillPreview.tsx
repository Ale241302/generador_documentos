import { useDocumentStore } from "@/stores/documentStore";
import { WatermarkOverlay } from "@/components/shared/WatermarkOverlay";

// Interface matching the form schema structure for AWB
interface AWBData {
    awbPrefix?: string;
    awbCode?: string;
    awbNumber?: string;

    shipperNameAddress?: string;
    shipperAccount?: string;

    consigneeNameAddress?: string;
    consigneeAccount?: string;

    agentNameCity?: string;
    agentIataCode?: string;
    agentAccount?: string;

    referenceNumber?: string;
    additionalInfo?: string;
    accountingInfo?: string;

    departureAirport?: string;
    destinationAirport?: string;
    carrier?: string;

    firstStopDest?: string;
    firstStopCarrier?: string;
    secondStopDest?: string;
    secondStopCarrier?: string;

    flightNumber?: string;
    flightDate?: string;
    sciCode?: string;

    currency?: string;
    wtValPayment?: string;
    otherPayment?: string;

    declaredValueCarriage?: string;
    declaredValueCustoms?: string;
    insuranceAmount?: string;

    handlingInfo?: string;

    items?: Array<{
        pieces?: string;
        grossWeight?: string;
        unit?: string;
        rateClass?: string;
        itemNumber?: string;
        chargeableWeight?: string;
        rate?: string;
        total?: string;
        description?: string; // Implicitly includes dimensions in the text area usually
    }>;

    ppWeightCharge?: string;
    collWeightCharge?: string;
    totalPrepaid?: string;
    totalCollect?: string;

    issuePlace?: string;
    issueDate?: string;
    agentSignature?: string;
    shipperSignature?: string;
}

export function AirWaybillPreview() {
    const { activeDocumentType, watermark } = useDocumentStore();
    const draft = useDocumentStore(state => state.drafts[`draft_${activeDocumentType}`]?.data) as AWBData;
    const data = draft || {};

    const styles = {
        page: {
            padding: '10mm',
            fontSize: '10px',
            fontFamily: "'Roboto Condensed', sans-serif",
            lineHeight: '1.2',
            color: '#000',
            boxSizing: 'border-box' as const,
            height: '100%',
            position: 'relative' as const,
            display: 'flex',
            flexDirection: 'column' as const,
        },
        grid: {
            display: 'grid',
            border: '1px solid #000',
            width: '100%',
        },
        row: {
            display: 'flex',
            borderBottom: '1px solid #000',
            width: '100%',
        },
        col: {
            borderRight: '1px solid #000',
            padding: '2px 4px',
            position: 'relative' as const,
        },
        label: {
            fontSize: '7px',
            fontWeight: 'bold',
            display: 'block',
            color: '#444',
        },
        value: {
            fontSize: '10px',
            whiteSpace: 'pre-wrap' as const,
            minHeight: '1.2em',
        }
    };

    const Field = ({ label, value, className, style }: { label?: string, value?: string, className?: string, style?: any }) => (
        <div style={{ ...style }} className={className}>
            {label && <span style={styles.label}>{label}</span>}
            <div style={styles.value}>{value}</div>
        </div>
    );

    const fullAwb = `${data.awbPrefix || ''}-${data.awbCode || ''} ${data.awbNumber || ''}`;

    return (
        <div style={styles.page}>
            <WatermarkOverlay text={watermark} />

            {/* Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div style={{ width: '50%' }}>
                    <img
                        src="https://storage.googleapis.com/sclcargo/web/Home/logo-largo.png"
                        crossOrigin="anonymous"
                        style={{ height: '40px' }}
                        alt="Logo"
                    />
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {fullAwb}
                </div>
            </div>

            <div style={{ ...styles.grid, borderBottom: 'none' }}>
                {/* Row 1: Shipper & Consignee vs Issuer */}
                <div style={styles.row}>
                    <div style={{ width: '50%', borderRight: '1px solid #000' }}>
                        <div style={{ padding: '4px', height: '25mm', borderBottom: '1px solid #000' }}>
                            <Field label="Shipper's Name and Address" value={data.shipperNameAddress} />
                            <div style={{ position: 'absolute', bottom: 2, left: 4 }}>
                                <Field label="Shipper's Account Number" value={data.shipperAccount} />
                            </div>
                        </div>
                        <div style={{ padding: '4px', height: '25mm' }}>
                            <Field label="Consignee's Name and Address" value={data.consigneeNameAddress} />
                            <div style={{ position: 'absolute', bottom: 2, left: 4 }}>
                                <Field label="Consignee's Account Number" value={data.consigneeAccount} />
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '50%' }}>
                        <div style={{ padding: '4px', height: '10mm', borderBottom: '1px solid #000', background: '#e5e5e5' }}>
                            <span style={{ fontSize: '9px' }}>Not Negotiable</span><br />
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Air Waybill</span><br />
                            <span style={{ fontSize: '9px' }}>Issued by</span>
                        </div>
                        <div style={{ padding: '4px', height: '15mm', borderBottom: '1px solid #000' }}>
                            <Field label="Copies 1, 2 and 3 of this Air Waybill are originals and have the same validity." />
                        </div>
                        <div style={{ padding: '4px', height: '25mm' }}>
                            <Field label="Issuing Carrier's Agent Name and City" value={data.agentNameCity} />
                        </div>
                    </div>
                </div>

                {/* Row 2: Agent Info */}
                <div style={styles.row}>
                    <div style={{ ...styles.col, width: '50%' }}>
                        <div style={{ display: 'flex' }}>
                            <div style={{ width: '50%', paddingRight: '4px' }}>
                                <Field label="Agent's IATA Code" value={data.agentIataCode} />
                            </div>
                            <div style={{ width: '50%' }}>
                                <Field label="Account No." value={data.agentAccount} />
                            </div>
                        </div>
                    </div>
                    <div style={{ ...styles.col, width: '50%', borderRight: 'none' }}>
                        <Field label="Reference Number" value={data.referenceNumber} />
                    </div>
                </div>

                {/* Accounting Info */}
                <div style={styles.row}>
                    <div style={{ ...styles.col, width: '50%' }}>
                        <Field label="Airport of Departure (Addr. of First Carrier) and Requested Routing" value={data.departureAirport} />
                    </div>
                    <div style={{ ...styles.col, width: '50%', borderRight: 'none' }}>
                        <Field label="Accounting Information" value={data.accountingInfo} />
                        <Field value={data.additionalInfo} />
                    </div>
                </div>

                {/* Routing */}
                <div style={styles.row}>
                    <div style={{ ...styles.col, width: '10%' }}><Field label="To" value={data.destinationAirport} /></div>
                    <div style={{ ...styles.col, width: '20%' }}><Field label="By First Carrier" value={data.carrier} /></div>
                    <div style={{ ...styles.col, width: '5%' }}><Field label="to" value={data.firstStopDest} /></div>
                    <div style={{ ...styles.col, width: '5%' }}><Field label="by" value={data.firstStopCarrier} /></div>
                    <div style={{ ...styles.col, width: '5%' }}><Field label="to" value={data.secondStopDest} /></div>
                    <div style={{ ...styles.col, width: '5%' }}><Field label="by" value={data.secondStopCarrier} /></div>
                    <div style={{ ...styles.col, width: '5%' }}><Field label="Currency" value={data.currency} /></div>
                    <div style={{ ...styles.col, width: '5%' }}><Field label="CHGS" value={data.sciCode} /></div>
                    <div style={{ ...styles.col, width: '5%' }}><Field label="WT/VAL" value={data.wtValPayment} /></div>
                    <div style={{ ...styles.col, width: '5%' }}><Field label="Other" value={data.otherPayment} /></div>
                    <div style={{ ...styles.col, width: '15%' }}><Field label="Declared Value for Carriage" value={data.declaredValueCarriage} /></div>
                    <div style={{ ...styles.col, width: '15%', borderRight: 'none' }}><Field label="Declared Value for Customs" value={data.declaredValueCustoms} /></div>
                </div>

                {/* Handling */}
                <div style={{ ...styles.row, height: '15mm' }}>
                    <div style={{ ...styles.col, width: '100%', borderRight: 'none' }}>
                        <Field label="Handling Information" value={data.handlingInfo} />
                    </div>
                </div>
            </div>

            {/* Cargo Table */}
            <div style={{ border: '1px solid #000', borderTop: 'none', minHeight: '80mm', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '8% 12% 5% 5% 8% 12% 12% 38%', fontSize: '8px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>
                    <div style={{ padding: '2px', borderRight: '1px solid #000', textAlign: 'center' }}>No. of Pieces RCP</div>
                    <div style={{ padding: '2px', borderRight: '1px solid #000', textAlign: 'center' }}>Gross Weight</div>
                    <div style={{ padding: '2px', borderRight: '1px solid #000', textAlign: 'center' }}>kg lb</div>
                    <div style={{ padding: '2px', borderRight: '1px solid #000', textAlign: 'center' }}>Rate Class</div>
                    <div style={{ padding: '2px', borderRight: '1px solid #000', textAlign: 'center' }}>Commodity Item No.</div>
                    <div style={{ padding: '2px', borderRight: '1px solid #000', textAlign: 'center' }}>Chargeable Weight</div>
                    <div style={{ padding: '2px', borderRight: '1px solid #000', textAlign: 'center' }}>Rate / Charge</div>
                    <div style={{ padding: '2px', textAlign: 'center' }}>Nature and Quantity of Goods (incl. Dimensions or Volume)</div>
                </div>

                <div style={{ flex: 1 }}>
                    {data.items?.map((item, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '8% 12% 5% 5% 8% 12% 12% 38%', fontSize: '10px', paddingTop: '4px' }}>
                            <div style={{ padding: '2px', textAlign: 'center' }}>{item.pieces}</div>
                            <div style={{ padding: '2px', textAlign: 'right' }}>{item.grossWeight}</div>
                            <div style={{ padding: '2px', textAlign: 'center' }}>{item.unit}</div>
                            <div style={{ padding: '2px', textAlign: 'center' }}>{item.rateClass}</div>
                            <div style={{ padding: '2px', textAlign: 'center' }}>{item.itemNumber}</div>
                            <div style={{ padding: '2px', textAlign: 'right' }}>{item.chargeableWeight}</div>
                            <div style={{ padding: '2px', textAlign: 'right' }}>{item.rate}</div>
                            <div style={{ padding: '2px', whiteSpace: 'pre-wrap' }}>{item.description}</div>
                        </div>
                    ))}
                </div>

                {/* Totals in Cargo Area */}
                <div style={{ borderTop: '1px solid #000', display: 'grid', gridTemplateColumns: '8% 12% 5% 5% 8% 12% 12% 38%' }}>
                    <div style={{ padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>{data.items?.reduce((a, b) => a + (Number(b.pieces) || 0), 0)}</div>
                    <div style={{ padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{data.items?.reduce((a, b) => a + (Number(b.grossWeight) || 0), 0).toFixed(2)}</div>
                    <div style={{ padding: '2px' }}></div>
                    <div style={{ padding: '2px' }}></div>
                    <div style={{ padding: '2px' }}></div>
                    <div style={{ padding: '2px' }}></div>
                    <div style={{ padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>TOTAL</div>
                    <div style={{ padding: '2px' }}></div>
                </div>
            </div>

            {/* Bottom Section: Charges & Signature */}
            <div style={{ border: '1px solid #000', borderTop: 'none', display: 'flex' }}>
                <div style={{ width: '50%', borderRight: '1px solid #000' }}>
                    <div style={{ ...styles.row }}>
                        <div style={{ ...styles.col, width: '50%' }}><Field label="Prepaid" value={data.ppWeightCharge} /></div>
                        <div style={{ ...styles.col, width: '50%', borderRight: 'none' }}><Field label="Weight Charge" value={data.collWeightCharge} style={{ textAlign: 'right' }} /></div>
                    </div>
                    {/* Placeholder for other charges layout */}
                    <div style={{ height: '20mm', borderBottom: '1px solid #000', padding: '4px' }}>
                        <Field label="Other Charges" />
                    </div>
                    <div style={{ ...styles.row, borderBottom: 'none' }}>
                        <div style={{ ...styles.col, width: '50%' }}><Field label="Total Prepaid" value={data.totalPrepaid} /></div>
                        <div style={{ ...styles.col, width: '50%', borderRight: 'none' }}><Field label="Total Collect" value={data.totalCollect} /></div>
                    </div>
                </div>

                <div style={{ width: '50%', padding: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '8px', marginBottom: '8px' }}>
                        Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.
                    </div>
                    <div style={{ borderBottom: '1px dashed #000', marginBottom: '8px', paddingBottom: '2px' }}>
                        <Field label="Signature of Shipper or his Agent" value={data.shipperSignature} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ width: '40%' }}>
                            <Field label="Executed on (date)" value={data.issueDate ? new Date(data.issueDate).toLocaleDateString('es-CL') : ''} />
                        </div>
                        <div style={{ width: '40%' }}>
                            <Field label="at (place)" value={data.issuePlace} />
                        </div>
                        <div style={{ width: '20%' }} />
                    </div>
                    <div style={{ borderBottom: '1px dashed #000', marginTop: '8px', paddingBottom: '2px' }}>
                        <Field label="Signature of Issuing Carrier or its Agent" value={data.agentSignature} />
                    </div>
                </div>
            </div>

            {/* Footer Numbers */}
            <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '5px', fontSize: '14px' }}>
                {fullAwb}
            </div>
            <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '10px' }}>
                {useDocumentStore.getState().printLabel || "ORIGINAL 3 (FOR SHIPPER)"}
            </div>
        </div>
    );
}
