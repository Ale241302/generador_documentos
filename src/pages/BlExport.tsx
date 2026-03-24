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
// ─────────────────────────────────────────────
// HELPER: onclone para html2canvas
// Corrige posición absoluta del icono del mundo 
// en el footer del Bill of Lading
// ─────────────────────────────────────────────
const fixFooterForCanvas = (clonedDoc: Document) => {
    const containers6 = clonedDoc.querySelectorAll(".container-6");

    containers6.forEach((c6: any) => {
        // 1. Convertimos el contenedor principal en Flexbox
        c6.style.setProperty("display", "flex", "important");
        c6.style.setProperty("align-items", "center", "important");

        // 2. Bajamos el icono del mundo y le quitamos lo absoluto
        const worldIcon = c6.querySelector(".background");
        if (worldIcon) {
            worldIcon.style.setProperty("position", "relative", "important");
            worldIcon.style.setProperty("top", "13px", "important"); // La misma medida que funcionó en la Cotización
            worldIcon.style.setProperty("left", "0", "important");
        }

        // 3. Acomodamos el texto ("www.sclcargo.cl") al lado del icono
        const textContainer = c6.querySelector(".container-7");
        if (textContainer) {
            textContainer.style.setProperty("position", "relative", "important");
            textContainer.style.setProperty("top", "7px", "important");
            textContainer.style.setProperty("left", "10px", "important"); // Le da un poco de espacio
        }
    });
};
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

            // =========================================================
            // 1. EXTRAER DATOS FIJOS (Scraping del iframe)
            // =========================================================
            const extractedData: any = {
                exporter: (docPrin.querySelector('.input-exporter') as HTMLElement)?.innerText.trim() || "",
                consignee: (docPrin.querySelector('.input-consignee') as HTMLElement)?.innerText.trim() || "",
                notify: (docPrin.querySelector('.input-notify') as HTMLElement)?.innerText.trim() || "",
                preCarriage: (docPrin.querySelector('.input-precarriage') as HTMLElement)?.innerText.trim() || "",
                placeOfReceipt: (docPrin.querySelector('.input-placeofreceipt') as HTMLElement)?.innerText.trim() || "",
                exportCarrier: (docPrin.querySelector('.input-exportcarrier') as HTMLElement)?.innerText.trim() || "",
                portOfLoading: (docPrin.querySelector('.input-portofloading') as HTMLElement)?.innerText.trim() || "",
                foreignPort: (docPrin.querySelector('.input-foreigin') as HTMLElement)?.innerText.trim() || "",
                placeOfDelivery: (docPrin.querySelector('.input-placeofdeli') as HTMLElement)?.innerText.trim() || "",

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

                subjectToCorrection: (docPrin.querySelector('.input-subjectco') as HTMLElement)?.innerText.trim() || "",
                prepaid: (docPrin.querySelector('.input-prepaid') as HTMLElement)?.innerText.trim() || "",
                collect: (docPrin.querySelector('.input-collect') as HTMLElement)?.innerText.trim() || "",
                grandTotal: (docPrin.querySelector('.input-grandtotal') as HTMLElement)?.innerText.trim() || "",
                prepaidBottom: (docPrin.querySelector('.input-prepaid_infe') as HTMLElement)?.innerText.trim() || "",
                collectBottom: (docPrin.querySelector('.input-collect_infe') as HTMLElement)?.innerText.trim() || "",

                datedAt: (docPrin.querySelector('.input-datedat') as HTMLElement)?.innerText.trim() || "",
                byAgent: (docPrin.querySelector('.input-by') as HTMLElement)?.innerText.trim() || "",
                month: (docPrin.querySelector('.input-mo') as HTMLElement)?.innerText.trim() || "",
                day: (docPrin.querySelector('.input-day') as HTMLElement)?.innerText.trim() || "",
                year: (docPrin.querySelector('.input-age') as HTMLElement)?.innerText.trim() || "",
                blNoBottom: (docPrin.querySelector('.input-blno') as HTMLElement)?.innerText.trim() || "",

                items: [] // <--- AQUÍ GUARDAREMOS LAS FILAS DE LA TABLA
            };

            // =========================================================
            // 2. EXTRAER FILAS DINÁMICAS DE LA TABLA
            // =========================================================
            const rows = docPrin.querySelectorAll('.bl-row');
            rows.forEach(row => {
                const marks = (row.querySelector('.col-marks') as HTMLElement)?.innerText.trim() || "";
                const packages = (row.querySelector('.col-packages') as HTMLElement)?.innerText.trim() || "";
                const description = (row.querySelector('.col-description') as HTMLElement)?.innerText.trim() || "";
                const weight = (row.querySelector('.col-weight') as HTMLElement)?.innerText.trim() || "";
                const measurement = (row.querySelector('.col-measurement') as HTMLElement)?.innerText.trim() || "";

                // Si la fila tiene al menos un dato escrito, la guardamos
                if (marks || packages || description || weight || measurement) {
                    extractedData.items.push({ marks, packages, description, weight, measurement });
                }
            });
            // =========================================================
            // 3. PREPARAR EL PDF Y ARREGLAR ESTILOS TEMPORALMENTE
            // =========================================================
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();

            // 3.1. Ocultar botones de "Agregar" y "Basurero"
            const actionButtons = docPrin.querySelectorAll('.delete-bl-row, .add-bl-btn-container');
            actionButtons.forEach(btn => ((btn as HTMLElement).style.display = 'none'));

            // 3.2. INYECTAR CSS TEMPORAL (Solo para el PDF)
            // Esto soluciona el footer cortado, los placeholders visibles y los tamaños sin tocar el style.css real
            const tempStyle = docPrin.createElement('style');
            tempStyle.id = 'pdf-export-styles';
            tempStyle.innerHTML = `
        /* 1. Forzamos el tamaño del contenedor para que quepa el footer */
        .bill-of-lading-vacio {
          width: 1000px !important;
          height: 1420px !important;
          min-height: 1420px !important;
          margin: 0 !important;
        }
        /* 2. Anclamos el footer estrictamente al fondo */
        .bill-of-lading-vacio .footer {
          top: auto !important;
          bottom: 0 !important;
        }
        /* 3. Ocultamos los placeholders vacíos ("Escribe aquí...") */
        .pdf-textarea:empty::before,
        .pdf-textarea:empty {
          color: transparent !important;
          content: "" !important;
          display: none !important;
        }
        /* 4. Evitamos que el SVG se deforme */
        .bill-lading {
          object-fit: fill !important;
        }
        
        /* =========================================================
           CORRECCIÓN DE POSICIÓN TOP (-2%) EXCLUSIVA PARA EL PDF
           ========================================================= */
        .input-exporter { top: 0.5% !important; }
        .input-consignee { top: 9.5% !important; }
        .input-notify { top: 18% !important; }
        
        .input-documentnumb { top: 0% !important; }
        .input-blnumb { top: 0% !important; }
        .input-exportref { top: 3.5% !important; }
        .input-forwardingagent { top: 9.5% !important; }
        .input-pointorigin { top: 15.5% !important; height: 2% !important; }
        .input-domesticrouting { top: 18% !important; }
        .input-loadingpier { top: 31.2% !important; }
        .input-typeofmove { top: 34.5% !important; }
        .input-containerizedyes { top: 34.7% !important; }
        .input-containerizedno { top: 34.7% !important; }
        
        .input-precarriage { top: 27.5% !important; }
        .input-placeofreceipt { top: 27.5% !important; }
        .input-exportcarrier { top: 31% !important; }
        .input-portofloading { top: 31% !important; }
        .input-foreigin { top: 34.5% !important; }
        .input-placeofdeli { top: 34.5% !important; }
        
        .input-subjectco { top: 79% !important; }
        .input-prepaid { top: 79% !important; }
        .input-collect { top: 79% !important; }
        
        .input-datedat { top: 85.5% !important; }
        .input-by { top: 88% !important; }
        .input-mo { top: 91.7% !important; }
        .input-day { top: 91.7% !important; }
        .input-age { top: 91.7% !important; }
        
        .input-blno { top: 96.5% !important; }
        .input-prepaid_infe { top: 96.7% !important; }
        .input-collect_infe { top: 96.7% !important; }
        .input-grandtotal { top: 97.3% !important; }
      `;
            docPrin.head.appendChild(tempStyle);

            // 3.3. Forzar el scroll del iframe hacia arriba para evitar que los inputs se desplacen hacia abajo
            docPrin.defaultView?.scrollTo(0, 0);

            // PAUSA CORTA: Le damos 150ms al navegador para aplicar los estilos inyectados antes del flash
            await new Promise(resolve => setTimeout(resolve, 150));

            const pagePrin = docPrin.querySelector('.bill-of-lading-vacio') as HTMLElement;

            if (pagePrin) {
                // Tomamos la captura asegurando coordenadas 0,0 y aplicando onclone
                const canvas = await html2canvas(pagePrin, {
                    scale: 3,
                    useCORS: true,
                    scrollY: 0,
                    windowY: 0,
                    backgroundColor: '#ffffff',
                    onclone: fixFooterForCanvas // <--- ¡AQUÍ ESTÁ LA MAGIA!
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0);

                // Calculamos la altura proporcional para jsPDF para que no se estire ni se aplaste
                const imgProps = pdf.getImageProperties(imgData);
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            } else {
                throw new Error("No se encontró el contenedor principal del documento en el iframe.");
            }

            // =========================================================
            // LIMPIEZA: Dejamos todo como estaba
            // =========================================================

            // Borramos el CSS temporal que inyectamos
            const injectedStyle = docPrin.getElementById('pdf-export-styles');
            if (injectedStyle) injectedStyle.remove();

            // Volvemos a mostrar los botones
            actionButtons.forEach(btn => ((btn as HTMLElement).style.display = ''));
            // =========================================================
            // 4. ENVIAR A PHALCON
            // =========================================================
            const fileName = `BL_Export_${folderName.replace(/\s+/g, '_')}.pdf`;
            const pdfBlob = pdf.output('blob');
            const formData = new FormData();

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
            const API_KEY = (import.meta.env.VITE_API_KEY || "").trim();

            formData.append('key', API_KEY);
            formData.append('nombre_carpeta', folderName);
            formData.append('id_usuario', '1');
            formData.append('datos_bl_export', JSON.stringify(extractedData));
            formData.append('url_documento_bl_export', pdfBlob, fileName);

            if (selectedFolderId) {
                formData.append('id', selectedFolderId);
            }

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