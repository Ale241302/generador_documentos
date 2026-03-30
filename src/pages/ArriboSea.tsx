import { useEffect, useState, useRef } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// 🔴 Importaciones Hoja 1 (Principal)
import indexHtml1 from "@/components/arrival_ocean/index.html?raw";
import globalCss1 from "@/components/arrival_ocean/global.css?raw";
import styleCss1 from "@/components/arrival_ocean/style.css?raw";

// 🔴 Importaciones Hoja 2 (Términos/Condiciones o anexo)
import indexHtml2 from "@/components/arrival_ocean/2da hoja/index.html?raw";
import globalCss2 from "@/components/arrival_ocean/2da hoja/global.css?raw";
import styleCss2 from "@/components/arrival_ocean/2da hoja/style.css?raw";

// ─────────────────────────────────────────────
// HELPER: Convierte una URL externa a base64
// ─────────────────────────────────────────────
const toBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext("2d")!.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve("");
        img.src = url;
    });
};

const prepareImagesForCanvas = async (doc: Document) => {
    const allImgs = doc.querySelectorAll("img");
    for (const imgEl of Array.from(allImgs)) {
        const src = (imgEl as HTMLImageElement).src;
        if (src && src.startsWith("http")) {
            const base64 = await toBase64(src);
            if (base64) (imgEl as HTMLImageElement).src = base64;
        }
    }
};

// ─────────────────────────────────────────────
// HELPER: genera el contenido del iframe dinámico
// ─────────────────────────────────────────────
function generateIframeContent(html: string, globalCss: string, styleCss: string, basePath: string) {
    const visualFixes = `
    <style>
      body {
        background: transparent !important;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      /* Se buscan todas las clases genéricas posibles para evitar problemas */
      .hoja-arribo, .arrival-notice, .arrival-notice-ocean, .arrival-notice-air {
        background-color: white;
        box-shadow: 0 0 40px rgba(0,0,0,0.1);
        margin: 0 auto 48px auto;
        overflow: hidden;
      }
    </style>
  `;
    const styleTag = `<style>${globalCss}\n${styleCss}</style>`;
    const baseTag = `<base href="${window.location.origin}${basePath}" />`;
    return html.replace("</head>", `${baseTag}\n${styleTag}\n${visualFixes}\n</head>`);
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL: Arribo Sea
// ─────────────────────────────────────────────
export function ArriboSea() {
    const navigate = useNavigate();

    // Referencias para ambos iframes
    const iframe1Ref = useRef<HTMLIFrameElement>(null);
    const iframe2Ref = useRef<HTMLIFrameElement>(null);

    // Alturas independientes
    const [iframe1Height, setIframe1Height] = useState(1529); // Altura vertical A4
    const [iframe2Height, setIframe2Height] = useState(1529);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [existingFolders, setExistingFolders] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => { fetchFolders(); }, []);

    const fetchFolders = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
            const API_KEY = import.meta.env.VITE_API_KEY || "";
            const res = await axios.post(`${API_URL}/listardoc`, { key: API_KEY });
            if (res.data && (res.data.status === "SUCCESS" || res.data.return === true)) {
                setExistingFolders(res.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    };

    useEffect(() => {
        // 🔴 Lógica de SINCRONIZACIÓN y ALTURA cruzando Iframes
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "RESIZE_ARRIVAL_1") setIframe1Height(event.data.height);
            if (event.data?.type === "RESIZE_ARRIVAL_2") setIframe2Height(event.data.height);

            // PUENTE DE COMUNICACIÓN
            if (event.data?.type === "SYNC_HEADER") {
                if (iframe1Ref.current && event.source === iframe1Ref.current.contentWindow) {
                    iframe2Ref.current?.contentWindow?.postMessage(event.data, '*');
                } else if (iframe2Ref.current && event.source === iframe2Ref.current.contentWindow) {
                    iframe1Ref.current?.contentWindow?.postMessage(event.data, '*');
                }
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

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
        if (!folderName.trim()) return toast.warning("El nombre de la carpeta es obligatorio");

        setIsGeneratingPdf(true);
        toast.info("Generando Arribo Sea y guardando en el servidor...", { duration: 4000 });

        try {
            const doc1 = iframe1Ref.current?.contentDocument;
            const doc2 = iframe2Ref.current?.contentDocument;

            if (!doc1 || !doc2) throw new Error("No se pudo acceder a los iframes");

            await prepareImagesForCanvas(doc1);
            await prepareImagesForCanvas(doc2);

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            let isFirstPage = true;

            // Ocultar botones en ambos documentos
            const actionButtons1 = doc1.querySelectorAll('.delete-action, .add-row-container');
            const actionButtons2 = doc2.querySelectorAll('.delete-action, .add-row-container');
            actionButtons1.forEach(btn => ((btn as HTMLElement).style.display = 'none'));
            actionButtons2.forEach(btn => ((btn as HTMLElement).style.display = 'none'));

            // Corrección de Iconos
            const fixIcons = `
                .icon, .icon-2, .icon-3, .icon-4, .icon-wrapper img, img.img[src*="container.svg"] {
                    margin-top: 10px !important; width: 16px !important; min-width: 16px !important; height: 16px !important; object-fit: contain !important; display: block !important;
                }
                .icon-5, .icon-web, .background-2 img, .icon-circle img {
                    margin-top: 20px !important; width: 16px !important; min-width: 16px !important; height: 16px !important; object-fit: contain !important; display: block !important;
                }
            `;
            const tempStyle1 = doc1.createElement('style'); tempStyle1.id = 'pdf-export-icon-fix'; tempStyle1.innerHTML = fixIcons; doc1.head.appendChild(tempStyle1);
            const tempStyle2 = doc2.createElement('style'); tempStyle2.id = 'pdf-export-icon-fix'; tempStyle2.innerHTML = fixIcons; doc2.head.appendChild(tempStyle2);

            // 🔴 SELECTOR A PRUEBA DE BALAS: Buscará cualquier clase que hayas usado
            const querySelector = ".arrival-notice, .arrival-notice-ocean, .arrival-notice-air, .hoja-arribo";

            // Exportar Documento 1 (Hojas principales y tablas generadas)
            const pages1 = doc1.querySelectorAll(querySelector);
            for (let i = 0; i < pages1.length; i++) {
                const canvas = await html2canvas(pages1[i] as HTMLElement, { scale: 3, useCORS: true, allowTaint: false });
                if (!isFirstPage) pdf.addPage();
                pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, pdfWidth, pdfHeight);
                isFirstPage = false;
            }

            // 🔴 Exportar Documento 2 (Términos / Anexos)
            const pages2 = doc2.querySelectorAll(querySelector);

            if (pages2.length > 0) {
                for (let i = 0; i < pages2.length; i++) {
                    const canvas = await html2canvas(pages2[i] as HTMLElement, { scale: 3, useCORS: true, allowTaint: false });
                    if (!isFirstPage) pdf.addPage();
                    pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, pdfWidth, pdfHeight);
                    isFirstPage = false;
                }
            } else {
                // Respaldo de emergencia si no encuentra ninguna de las clases anteriores
                const fallbackPage = doc2.querySelector("body > div") as HTMLElement;
                if (fallbackPage) {
                    const canvas = await html2canvas(fallbackPage, { scale: 3, useCORS: true, allowTaint: false });
                    if (!isFirstPage) pdf.addPage();
                    pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, pdfWidth, pdfHeight);
                    isFirstPage = false;
                }
            }

            // Restaurar interfaces
            actionButtons1.forEach(btn => ((btn as HTMLElement).style.display = ''));
            actionButtons2.forEach(btn => ((btn as HTMLElement).style.display = ''));
            if (doc1.getElementById('pdf-export-icon-fix')) doc1.getElementById('pdf-export-icon-fix')!.remove();
            if (doc2.getElementById('pdf-export-icon-fix')) doc2.getElementById('pdf-export-icon-fix')!.remove();

            const fileName = `ArriboSea_${folderName.replace(/\s+/g, "_")}.pdf`;
            pdf.save(fileName);

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
            const formData = new FormData();
            formData.append("key", (import.meta.env.VITE_API_KEY || "").trim());
            formData.append("nombre_carpeta", folderName);
            formData.append("id_usuario", localStorage.getItem("usuario_id") || "1");
            if (selectedFolderId) formData.append("id", selectedFolderId);

            // Ajustamos la clave al servicio del Arribo Sea
            formData.append("url_documento_arribo_sea", pdf.output("blob"), fileName);

            const res = await axios.post(`${API_URL}/guardardoc`, formData);
            if (res.data && (res.data.status === 200 || res.data.return === true)) {
                toast.success("¡Arribo Sea guardado con éxito en la Nube!");
                setIsSaveModalOpen(false); navigate("/dashboard");
            } else throw new Error(res.data?.mensaje || res.data?.error || "Error al procesar la petición");

        } catch (error: any) {
            toast.error(`❌ ${error.message || "Ocurrió un error"}`);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const filteredFolders = existingFolders.filter(f => f.nombre_carpeta?.toLowerCase().includes(folderName.toLowerCase()));

    // Rutas apuntando a la carpeta de arrival_ocean
    const iframe1Src = generateIframeContent(indexHtml1, globalCss1, styleCss1, "/src/components/arrival_ocean/");
    const iframe2Src = generateIframeContent(indexHtml2, globalCss2, styleCss2, "/src/components/arrival_ocean/2da hoja/");

    return (
        <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
            <AppHeader />
            <main className="flex-1 overflow-y-auto bg-slate-100/50 dark:bg-neutral-900 py-12 flex flex-col items-center gap-0 relative z-0">
                <div className="w-full max-w-[1000px] shrink-0 transition-all duration-300" style={{ height: `${iframe1Height}px` }}>
                    <iframe ref={iframe1Ref} srcDoc={iframe1Src} className="w-full h-full border-0 bg-transparent" title="Arribo Sea - Pág 1" sandbox="allow-same-origin allow-scripts" />
                </div>
                <div className="w-full max-w-[1000px] shrink-0 transition-all duration-300" style={{ height: `${iframe2Height}px` }}>
                    <iframe ref={iframe2Ref} srcDoc={iframe2Src} className="w-full h-full border-0 bg-transparent" title="Arribo Sea - Pág 2" sandbox="allow-same-origin allow-scripts" />
                </div>
            </main>

            <div className="fixed bottom-8 right-8 z-40">
                <button onClick={() => setIsSaveModalOpen(true)} className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <img src="https://storage.googleapis.com/sclcargo/SCLCargo_gendoc/assets/save-svgrepo-com.svg" alt="Guardar" className="w-7 h-7 filter invert" />
                </button>
            </div>

            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Guardar Arribo Sea</h2>
                        <div className="mb-6 relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de Carpeta</label>
                            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f06e00] outline-none transition-all" placeholder="Escribe o selecciona una carpeta..." value={folderName} onChange={handleInputChange} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} disabled={isGeneratingPdf} />
                            {showSuggestions && folderName && filteredFolders.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredFolders.map((folder) => (
                                        <li key={folder.id} className="px-4 py-2 hover:bg-[#fffcf9] hover:text-[#f06e00] cursor-pointer transition-colors border-b last:border-0" onMouseDown={() => handleSelectFolder(folder)}>
                                            {folder.nombre_carpeta} <span className="text-xs text-gray-400 ml-2">(ID: {folder.id})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="flex gap-4 justify-end mt-4">
                            <button type="button" className="px-6 py-2 border-2 border-[#f06e00] text-[#f06e00] rounded-lg font-bold hover:bg-[#f06e00] hover:text-white transition-colors" onClick={() => setIsSaveModalOpen(false)} disabled={isGeneratingPdf}>Cancelar</button>
                            <button type="button" className="px-6 py-2 bg-[#f06e00] text-white rounded-lg font-bold hover:bg-[#d05e00] transition-colors" onClick={handleSave} disabled={isGeneratingPdf}>{isGeneratingPdf ? "Generando..." : "Guardar"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}