import { useEffect, useState, useRef } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Importamos los archivos raw de Bill of Lading
import indexHtml from "@/components/Billoflading/index.html?raw";
import globalCss from "@/components/Billoflading/global.css?raw";
import styleCss from "@/components/Billoflading/style.css?raw";

function generateIframeContent(html: string, globalCss: string, styleCss: string) {
    const visualFixes = `
    <style>
      body { 
        background: transparent !important; 
        margin: 0; 
        padding: 0; 
        /* overflow: hidden; Opcional según tu diseño */
      }
      /* Aquí puedes poner la clase contenedora principal de tu index.html del BL */
      .box {
        background-color: white;
        box-shadow: 0 0 40px rgba(0,0,0,0.1);
        margin: 0 auto 48px auto;
      }
    </style>
  `;

    const styleTag = `<style>${globalCss}\n${styleCss}</style>`;
    const baseTag = `<base href="${window.location.origin}/src/components/Billoflading/" />`;

    return html.replace("</head>", `${baseTag}\n${styleTag}\n${visualFixes}\n</head>`);
}

export function BlExport() {
    const navigate = useNavigate();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    const [existingFolders, setExistingFolders] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

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
        const value = e.target.value;
        setFolderName(value);
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
        toast.info("Generando BL Export y guardando en el servidor...", { duration: 4000 });

        try {
            const docPrin = iframeRef.current?.contentDocument;
            if (!docPrin) throw new Error("No se pudo acceder al iframe del BL");

            // 1. EXTRAER DATOS (Ajusta los querySelectors según las clases de tu index.html de BL)
            // 1. EXTRAER DATOS (Scraping del iframe)
            const extractedData: any = {
                // Lado Izquierdo - Arriba
                exporter: (docPrin.querySelector('.input-exporter') as HTMLElement)?.innerText.trim() || "",
                consignee: (docPrin.querySelector('.input-consignee') as HTMLElement)?.innerText.trim() || "",
                notify: (docPrin.querySelector('.input-notify') as HTMLElement)?.innerText.trim() || "",

                preCarriage: (docPrin.querySelector('.input-precarriage') as HTMLElement)?.innerText.trim() || "",
                placeOfReceipt: (docPrin.querySelector('.input-placeofreceipt') as HTMLElement)?.innerText.trim() || "",
                exportCarrier: (docPrin.querySelector('.input-exportcarrier') as HTMLElement)?.innerText.trim() || "",
                portOfLoading: (docPrin.querySelector('.input-portofloading') as HTMLElement)?.innerText.trim() || "",
                foreignPort: (docPrin.querySelector('.input-foreigin') as HTMLElement)?.innerText.trim() || "",
                placeOfDelivery: (docPrin.querySelector('.input-placeofdeli') as HTMLElement)?.innerText.trim() || "",

                // Lado Derecho - Arriba
                documentNumber: (docPrin.querySelector('.input-documentnumb') as HTMLElement)?.innerText.trim() || "",
                blNumber: (docPrin.querySelector('.input-blnumb') as HTMLElement)?.innerText.trim() || "",
                exportReferences: (docPrin.querySelector('.input-exportref') as HTMLElement)?.innerText.trim() || "",
                forwardingAgent: (docPrin.querySelector('.input-forwardingagent') as HTMLElement)?.innerText.trim() || "",
                pointOfOrigin: (docPrin.querySelector('.input-pointorigin') as HTMLElement)?.innerText.trim() || "",
                domesticRouting: (docPrin.querySelector('.input-domesticrouting') as HTMLElement)?.innerText.trim() || "",
                loadingPier: (docPrin.querySelector('.input-loadingpier') as HTMLElement)?.innerText.trim() || "",
                typeOfMove: (docPrin.querySelector('.input-typeofmove') as HTMLElement)?.innerText.trim() || "",
                containerizedYes: (docPrin.querySelector('.input-containerizedyes') as HTMLElement)?.innerText.trim() || "",
                containerizedNo: (docPrin.querySelector('.input-containerizedno') as HTMLElement)?.innerText.trim() || "",

                // Inferior - Lado Izquierdo (Totales y Tasas)
                subjectToCorrection: (docPrin.querySelector('.input-subjectco') as HTMLElement)?.innerText.trim() || "",
                prepaid: (docPrin.querySelector('.input-prepaid') as HTMLElement)?.innerText.trim() || "",
                collect: (docPrin.querySelector('.input-collect') as HTMLElement)?.innerText.trim() || "",
                grandTotal: (docPrin.querySelector('.input-grandtotal') as HTMLElement)?.innerText.trim() || "",
                prepaidBottom: (docPrin.querySelector('.input-prepaid_infe') as HTMLElement)?.innerText.trim() || "",
                collectBottom: (docPrin.querySelector('.input-collect_infe') as HTMLElement)?.innerText.trim() || "",

                // Inferior - Lado Derecho (Firmas y Fechas)
                datedAt: (docPrin.querySelector('.input-datedat') as HTMLElement)?.innerText.trim() || "",
                byAgent: (docPrin.querySelector('.input-by') as HTMLElement)?.innerText.trim() || "",
                month: (docPrin.querySelector('.input-mo') as HTMLElement)?.innerText.trim() || "",
                day: (docPrin.querySelector('.input-day') as HTMLElement)?.innerText.trim() || "",
                year: (docPrin.querySelector('.input-age') as HTMLElement)?.innerText.trim() || "",
                blNoBottom: (docPrin.querySelector('.input-blno') as HTMLElement)?.innerText.trim() || ""
            };

            // 2. GENERAR EL PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Ajusta la clase .box al nombre del contenedor principal de tu BL
            const pagePrin = docPrin.querySelector('.box') as HTMLElement; // Reemplaza .box por la clase de tu HTML

            if (pagePrin) {
                const canvas = await html2canvas(pagePrin, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            } else {
                throw new Error("No se encontró el contenedor principal del documento en el iframe.");
            }

            // 3. NOMBRE DEL ARCHIVO
            const fileName = `BL_Export_${folderName.replace(/\s+/g, '_')}.pdf`;
            const pdfBlob = pdf.output('blob');
            const formData = new FormData();

            // 4. PREPARAR DATOS PARA PHALCON
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
            const API_KEY = (import.meta.env.VITE_API_KEY || "").trim();

            formData.append('key', API_KEY);
            formData.append('nombre_carpeta', folderName);
            formData.append('id_usuario', '1');

            // MUY IMPORTANTE: Usamos los nombres de campo exactos de tu Backend
            formData.append('datos_bl_export', JSON.stringify(extractedData));
            formData.append('url_documento_bl_export', pdfBlob, fileName);

            if (selectedFolderId) {
                formData.append('id', selectedFolderId);
            }

            // 5. ENVIAR A PHALCON
            const res = await axios.post(`${API_URL}/guardardoc`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data && (res.data.status === 200 || res.data.return === true || res.data.status === 'SUCCESS')) {
                toast.success("¡BL Export guardado con éxito en la Nube!");
                setIsSaveModalOpen(false);
                navigate('/dashboard');
            } else {
                const errorBackend = res.data?.mensaje || res.data?.error || "Error al procesar la petición";
                throw new Error(errorBackend);
            }

        } catch (error: any) {
            console.error("Error en handleSave BL:", error);
            const errorMsg = error.response?.data?.mensaje || error.response?.data?.error || error.message || "Ocurrió un error al generar o guardar";
            toast.error(`❌ ${errorMsg}`);
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
                <div className="w-full max-w-[1000px] shrink-0 transition-all duration-300 h-[1500px]">
                    <iframe
                        ref={iframeRef}
                        srcDoc={iframeSrc}
                        className="w-full h-full border-0 bg-transparent"
                        title="BL Export"
                        sandbox="allow-same-origin allow-scripts"
                    />
                </div>
            </main>

            {/* BOTÓN FLOTANTE GUARDAR */}
            <div className="fixed bottom-8 right-8 z-40">
                <button
                    onClick={() => setIsSaveModalOpen(true)}
                    className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    title="Guardar BL Export"
                >
                    <img
                        src="https://storage.googleapis.com/sclcargo/SCLCargo_gendoc/assets/save-svgrepo-com.svg"
                        alt="Guardar"
                        className="w-7 h-7 filter invert"
                    />
                </button>
            </div>

            {/* MODAL DE GUARDAR (Idéntico al de Cotización) */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Guardar BL Export</h2>

                        <div className="mb-6 relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de Carpeta</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f06e00] focus:border-[#f06e00] outline-none transition-all"
                                placeholder="Escribe o selecciona una carpeta..."
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
                                            className="px-4 py-2 hover:bg-[#fffcf9] hover:text-[#f06e00] cursor-pointer transition-colors border-b last:border-0"
                                            onMouseDown={() => handleSelectFolder(folder)}
                                        >
                                            {folder.nombre_carpeta}
                                            <span className="text-xs text-gray-400 ml-2">(ID: {folder.id})</span>
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