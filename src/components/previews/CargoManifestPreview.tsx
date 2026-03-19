import { useDocumentStore } from "@/stores/documentStore";
import { WatermarkOverlay } from "@/components/shared/WatermarkOverlay";

interface ManifestData {
    voyageNumber?: string;
    masterBillNumber?: string;
    vessel?: string;
    nationality?: string;
    portOfLoading?: string;
    portOfDischarge?: string;

    houses?: Array<{
        houseNumber?: string;
        shipper?: string;
        consignee?: string;
        packages?: string;
        unit?: string;
        weight?: string;
        volume?: string;
        description?: string;
        usCustoms?: string;
    }>;

    totalPackages?: string;
    totalWeight?: string;
    totalVolume?: string;

    date?: string;
    place?: string;
}

export function CargoManifestPreview() {
    const { activeDocumentType, watermark } = useDocumentStore();
    const draft = useDocumentStore(state => state.drafts[`draft_${activeDocumentType}`]?.data) as ManifestData;
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
        header: {
            textAlign: 'center' as const,
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '5mm',
            textTransform: 'uppercase' as const,
        },
        infoGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '2mm',
            marginBottom: '5mm',
            border: '1px solid #000',
            padding: '2mm',
        },
        field: {
            marginBottom: '2px',
        },
        label: {
            fontWeight: 'bold',
            marginRight: '4px',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            fontSize: '9px',
        },
        th: {
            border: '1px solid #000',
            padding: '2px',
            background: '#f0f0f0',
            fontWeight: 'bold',
            textAlign: 'center' as const,
        },
        td: {
            border: '1px solid #000',
            padding: '2px',
            verticalAlign: 'top' as const,
        },
        footer: {
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '5mm',
        }
    };

    return (
        <div style={styles.page}>
            <WatermarkOverlay text={watermark} />

            <div style={styles.header}>
                <img
                    src="https://storage.googleapis.com/sclcargo/web/Home/logo-largo.png"
                    crossOrigin="anonymous"
                    style={{ height: '40px', display: 'block', margin: '0 auto 10px' }}
                    alt="Logo"
                />
                CARGO MANIFEST / MANIFIESTO DE CARGA AÉREA
            </div>

            <div style={styles.infoGrid}>
                <div><span style={styles.label}>Voyage No:</span> {data.voyageNumber}</div>
                <div><span style={styles.label}>Master B/L:</span> {data.masterBillNumber}</div>
                <div><span style={styles.label}>Vessel/Flight:</span> {data.vessel}</div>
                <div><span style={styles.label}>Nationality:</span> {data.nationality}</div>
                <div><span style={styles.label}>Port of Loading:</span> {data.portOfLoading}</div>
                <div><span style={styles.label}>Port of Discharge:</span> {data.portOfDischarge}</div>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={{ ...styles.th, width: '10%' }}>House B/L</th>
                        <th style={{ ...styles.th, width: '15%' }}>Shipper</th>
                        <th style={{ ...styles.th, width: '15%' }}>Consignee</th>
                        <th style={{ ...styles.th, width: '5%' }}>Pkgs</th>
                        <th style={{ ...styles.th, width: '5%' }}>Unit</th>
                        <th style={{ ...styles.th, width: '8%' }}>Weight (Kg)</th>
                        <th style={{ ...styles.th, width: '8%' }}>Vol (m³)</th>
                        <th style={{ ...styles.th, width: '24%' }}>Description</th>
                        <th style={{ ...styles.th, width: '10%' }}>Notes/US Customs</th>
                    </tr>
                </thead>
                <tbody>
                    {data.houses?.map((house, i) => (
                        <tr key={i}>
                            <td style={styles.td}>{house.houseNumber}</td>
                            <td style={styles.td}>{house.shipper}</td>
                            <td style={styles.td}>{house.consignee}</td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>{house.packages}</td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>{house.unit}</td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>{house.weight}</td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>{house.volume}</td>
                            <td style={styles.td}>{house.description}</td>
                            <td style={styles.td}>{house.usCustoms}</td>
                        </tr>
                    ))}
                    {/* Totals Row */}
                    <tr style={{ fontWeight: 'bold', background: '#f9f9f9' }}>
                        <td style={{ ...styles.td, textAlign: 'right' }} colSpan={3}>TOTALS</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>{data.totalPackages || data.houses?.reduce((acc, h) => acc + (Number(h.packages) || 0), 0)}</td>
                        <td style={styles.td}></td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>{data.totalWeight || data.houses?.reduce((acc, h) => acc + (Number(h.weight) || 0), 0).toFixed(2)}</td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>{data.totalVolume || data.houses?.reduce((acc, h) => acc + (Number(h.volume) || 0), 0).toFixed(2)}</td>
                        <td style={styles.td} colSpan={2}></td>
                    </tr>
                </tbody>
            </table>

            <div style={styles.footer}>
                <div>
                    <div style={{ borderBottom: '1px solid #000', width: '200px', marginBottom: '2px' }}></div>
                    <div style={{ fontSize: '9px' }}>Master Captain / Agent Signature</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div>Place: {data.place}</div>
                    <div>Date: {data.date ? new Date(data.date).toLocaleDateString('es-CL') : ''}</div>
                </div>
            </div>
        </div>
    );
}
