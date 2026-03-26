import { useEffect, useState, useRef } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Importamos los archivos raw de Air Waybill (AWB)
import indexHtml from "@/components/airwilbil/index.html?raw";
import globalCss from "@/components/airwilbil/global.css?raw";
import styleCss from "@/components/airwilbil/style.css?raw";

function generateIframeContent(html: string, globalCss: string, styleCss: string) {
    const visualFixes = `
    <style>
      body { 
        background: transparent !important; 
        margin: 0; 
        padding: 0; 
        overflow: hidden !important; 
      }
      .air-wil-bil-vacio { 
        background-color: white;
        box-shadow: 0 0 40px rgba(0,0,0,0.1);
        margin: 0 auto 48px auto !important; 
      }
      .form-overlay-container {
        height: 92% !important; 
        top: 10px !important; 
      }
    </style>
  `;

    const styleTag = `<style>${globalCss}\n${styleCss}</style>`;
    const baseTag = `<base href="${window.location.origin}/src/components/airwilbil/" />`;

    return html.replace("</head>", `${baseTag}\n${styleTag}\n${visualFixes}\n</head>`);
}

export function Airwilbil() {
    const navigate = useNavigate();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [existingFolders, setExistingFolders] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Altura controlada (1360 da margen suficiente para el documento de 1310px)
    const [principalHeight, setPrincipalHeight] = useState(1360);

    const ID_USUARIO = localStorage.getItem("usuario_id") || "1";

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
            const API_KEY = import.meta.env.VITE_API_KEY || "";

            const res = await axios.post(`${API_URL}/listardoc`, { key: API_KEY });
            if (res.data && (res.data.status === 200 || res.data.return === true || res.data.status === 'SUCCESS')) {
                setExistingFolders(res.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFolderName(e.target.value);
        setSelectedFolderId(null);
        setShowSuggestions(true);
    };

    const handleSelectFolder = (folder: any) => {
        setFolderName(folder.nombre_carpeta);
        setSelectedFolderId(folder.id);
        setShowSuggestions(false);
    };

    const handleSave = async () => {
        if (!folderName.trim()) {
            toast.warning("El nombre de la carpeta es obligatorio");
            return;
        }

        setIsGeneratingPdf(true);
        toast.info("Generando Air Waybill y guardando en el servidor...", { duration: 4000 });

        try {
            const docPrin = iframeRef.current?.contentDocument;
            if (!docPrin) throw new Error("No se pudo acceder al iframe del AWB");

            // =========================================================
            // 1. EXTRACCIÓN MASIVA AUTOMÁTICA DE DATOS FIJOS
            // =========================================================
            const allInputClasses = [
                'input-1', 'input-2', 'input-3', 'input-4', 'input-5',
                'input-shiperadd', 'input-shiperacnum', 'input-consignee', 'input-consigneeacnum',
                'input-issuing', 'input-agents', 'input-acountno', 'input-airpotdep', 'input-to',
                'input-bycarrier', 'input-to2', 'input-to3', 'input-by2', 'input-by3', 'input-airpotdes',
                'input-flightdate', 'input-flightdate2', 'input-issueby', 'input-acountinginfo',
                'input-refnumber', 'input-refnumber2', 'input-refnumber3', 'input-currency', 'input-chgs',
                'input-ppdwt', 'input-collwt', 'input-ppdot', 'input-collot', 'input-declaredcarriege',
                'input-declaredcustoms', 'input-amountinsurance', 'input-pais', 'input-sci',
                'input-prepaid', 'input-valuetion', 'input-tax', 'input-totalohter', 'input-totalohtercarrier',
                'input-totalohtercarrier2', 'input-totalprepaid', 'input-totalcollect', 'input-currencyrate',
                'input-cccharges', 'input-chargesat', 'input-othercarges', 'input-signature', 'input-executed',
                'input-atplace', 'input-signature2', 'input-totalcollectcharge', 'input-6', 'input-7', 'input-8'
            ];

            const extractedData: any = { campos_fijos: {}, items_tabla: [], totales: {} };

            // Extraer todos los campos fijos
            allInputClasses.forEach(cls => {
                const key = cls.replace('input-', '');
                extractedData.campos_fijos[key] = (docPrin.querySelector(`.${cls}`) as HTMLElement)?.innerText.trim() || "";
            });

            // Extraer filas de la tabla
            const rows = docPrin.querySelectorAll('.awb-row');
            rows.forEach(row => {
                const pieces = (row.querySelector('.col-pieces') as HTMLElement)?.innerText.trim() || "";
                const weight = (row.querySelector('.col-grossweight') as HTMLElement)?.innerText.trim() || "";
                const commodity = (row.querySelector('.col-commodity') as HTMLElement)?.innerText.trim() || "";
                const total = (row.querySelector('.col-total') as HTMLElement)?.innerText.trim() || "";
                const nature = (row.querySelector('.col-nature') as HTMLElement)?.innerText.trim() || "";

                if (pieces || weight || commodity || nature) {
                    extractedData.items_tabla.push({ pieces, weight, commodity, total, nature });
                }
            });

            // Extraer la fila de totales
            extractedData.totales = {
                pieces: (docPrin.querySelector('.val-total-pieces') as HTMLElement)?.innerText.trim() || "",
                grossweight: (docPrin.querySelector('.val-total-grossweight') as HTMLElement)?.innerText.trim() || "",
                kglb: (docPrin.querySelector('.val-total-kglb') as HTMLElement)?.innerText.trim() || "",
                amount: (docPrin.querySelector('.val-total-amount') as HTMLElement)?.innerText.trim() || "",
            };

            // =========================================================
            // 2. PREPARACIÓN ESTÉTICA DEL PDF
            // =========================================================
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();

            // Ocultar botoneras y marcas de agua UI
            const actionButtons = docPrin.querySelectorAll('.delete-awb-row, .add-awb-btn-container, .watermark-controls');
            actionButtons.forEach(btn => ((btn as HTMLElement).style.display = 'none'));

            const tempStyle = docPrin.createElement('style');
            tempStyle.id = 'pdf-export-styles';

            // ESTILOS ESTRICTOS: Conservamos el 1000x1310 sin mover posiciones
            tempStyle.innerHTML = `
                .air-wil-bil-vacio { 
                    width: 1000px !important; 
                    height: 1310px !important; 
                    min-height: 1310px !important; 
                    margin: 0 !important; 
                    border: none !important; 
                    box-shadow: none !important;
                }
                .pdf-textarea:empty::before, .pdf-textarea:empty { 
                    color: transparent !important; 
                    content: "" !important; 
                    display: none !important; 
                }
                .pdf-textarea {
                    border: none !important;
                    background: transparent !important;
                }
            `;
            docPrin.head.appendChild(tempStyle);
            docPrin.defaultView?.scrollTo(0, 0);

            // Pausa para que el DOM aplique estilos
            await new Promise(resolve => setTimeout(resolve, 200));

            // =========================================================
            // 3. CAPTURA Y GENERACIÓN DEL PDF
            // =========================================================
            const page = docPrin.querySelector('.air-wil-bil-vacio') as HTMLElement;

            const canvas = await html2canvas(page, {
                scale: 2.5,
                useCORS: true,
                scrollY: 0,
                windowY: 0,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            // =========================================================
            // 4. RESTAURAR PANTALLA Y ENVIAR AL BACKEND
            // =========================================================
            if (tempStyle) tempStyle.remove();
            actionButtons.forEach(btn => ((btn as HTMLElement).style.display = ''));

            const fileName = `AWB_${folderName.replace(/\s+/g, '_')}.pdf`;
            const pdfBlob = pdf.output('blob');
            const formData = new FormData();

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
            const API_KEY = (import.meta.env.VITE_API_KEY || "").trim();

            formData.append('key', API_KEY);
            formData.append('nombre_carpeta', folderName);
            formData.append('id_usuario', ID_USUARIO);
            formData.append('datos_awb', JSON.stringify(extractedData));
            formData.append('url_documento_awb', pdfBlob, fileName);

            if (selectedFolderId) {
                formData.append('id', selectedFolderId);
            }

            const res = await axios.post(`${API_URL}/guardardoc`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data && (res.data.status === 200 || res.data.return === true || res.data.status === 'SUCCESS')) {
                toast.success("¡Air Waybill guardado con éxito!");
                setIsSaveModalOpen(false);
                navigate('/dashboard');
            } else {
                const errorBackend = res.data?.mensaje || res.data?.error || "Error al procesar la petición";
                throw new Error(errorBackend);
            }

        } catch (error: any) {
            console.error("Error en handleSave AWB:", error);
            const errorMsg = error.response?.data?.mensaje || error.response?.data?.error || error.message || "Error al generar o guardar";
            toast.error(`❌ ${errorMsg}`);

            // Por si falla, devolver visibilidad a botones
            try {
                const docPrin = iframeRef.current?.contentDocument;
                if (docPrin) {
                    const actionBtns = docPrin.querySelectorAll('.delete-awb-row, .add-awb-btn-container, .watermark-controls');
                    actionBtns.forEach(btn => ((btn as HTMLElement).style.display = ''));
                    const injected = docPrin.getElementById('pdf-export-styles');
                    if (injected) injected.remove();
                }
            } catch (e) { }

        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const filteredFolders = existingFolders.filter(f =>
        f.nombre_carpeta?.toLowerCase().includes(folderName.toLowerCase())
    );

    const iframeSrc = generateIframeContent(indexHtml, globalCss, styleCss);

    return (
        <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
            <AppHeader />

            <main className="flex-1 overflow-y-auto bg-slate-100/50 dark:bg-neutral-900 py-12 flex flex-col items-center gap-12 relative z-0">
                <div
                    className="w-full max-w-[1000px] shrink-0 transition-all duration-300"
                    style={{ height: `${principalHeight}px` }}
                >
                    <iframe
                        ref={iframeRef}
                        srcDoc={iframeSrc}
                        className="w-full h-full border-0 bg-transparent shadow-sm"
                        title="Air Waybill (AWB)"
                        sandbox="allow-same-origin allow-scripts"
                    />
                </div>
            </main>

            <div className="fixed bottom-8 right-8 z-40">
                <button
                    onClick={() => setIsSaveModalOpen(true)}
                    className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    title="Guardar AWB"
                >
                    <img
                        src="https://storage.googleapis.com/sclcargo/SCLCargo_gendoc/assets/save-svgrepo-com.svg"
                        alt="Guardar"
                        className="w-7 h-7 filter invert"
                    />
                </button>
            </div>

            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Guardar Air Waybill</h2>

                        <div className="mb-6 relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de Carpeta</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f06e00] focus:border-[#f06e00] outline-none transition-all"
                                placeholder="Carpeta..."
                                value={folderName}
                                onChange={handleInputChange}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                disabled={isGeneratingPdf}
                            />

                            {showSuggestions && folderName && filteredFolders.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredFolders.map((folder) => (
                                        <li
                                            key={folder.id}
                                            className="px-4 py-2 hover:bg-[#fffcf9] hover:text-[#f06e00] cursor-pointer border-b"
                                            onMouseDown={() => handleSelectFolder(folder)}
                                        >
                                            {folder.nombre_carpeta}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <style>{`
              .custom-btn-actions { display: flex; gap: 1rem; justify-content: flex-end; }
              .custom-btn-actions button { border-radius: 10px; font-weight: 600; width: 140px; height: 45px; transition: all 0.3s; }
              .btn-guardar { background-color: #f06e00; color: #fff; border: none; }
              .btn-guardar:hover { opacity: 0.9; }
              .btn-cancel { background-color: #fff; color: #f06e00; border: 2px solid #f06e00; }
              .btn-cancel:hover { background-color: #f06e00; color: #fff; }
              .btn-guardar:disabled, .btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
            `}</style>

                        <div className="custom-btn-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')} disabled={isGeneratingPdf}>
                                Cancelar
                            </button>
                            <button type="button" className="btn-guardar" onClick={handleSave} disabled={isGeneratingPdf}>
                                {isGeneratingPdf ? "Generando..." : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}