import { useEffect, useState, useRef } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// 🔴 Importaciones apuntando a la carpeta cargo_manifest
import indexHtml from "@/components/cargo_manifest/index.html?raw";
import globalCss from "@/components/cargo_manifest/global.css?raw";
import styleCss from "@/components/cargo_manifest/style.css?raw";

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
// HELPER: genera el contenido del iframe
// ─────────────────────────────────────────────
function generateIframeContent(html: string, globalCss: string, styleCss: string) {
    const visualFixes = `
    <style>
      body { background: transparent !important; margin: 0; padding: 0; overflow: hidden; }
      .cargomanifest { background-color: white; box-shadow: 0 0 40px rgba(0,0,0,0.1); margin: 0 auto 48px auto; overflow: hidden; }
    </style>
  `;
    const styleTag = `<style>${globalCss}\n${styleCss}</style>`;
    const baseTag = `<base href="${window.location.origin}/src/components/cargo_manifest/" />`;
    return html.replace("</head>", `${baseTag}\n${styleTag}\n${visualFixes}\n</head>`);
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL: Manifiesto
// ─────────────────────────────────────────────
export function Manifiestos() {
    const navigate = useNavigate();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [iframeHeight, setIframeHeight] = useState(990); // 🔴 Altura horizontal por defecto
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
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "RESIZE_MANIFIESTO") {
                setIframeHeight(event.data.height);
            }

            // 🔴 Puente para sincronizar marcas de agua entre múltiples iframes si existieran
            if (event.data?.type === 'SET_WATERMARK') {
                const iframes = document.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.postMessage(event.data, '*');
                    }
                });
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
        if (!folderName.trim()) {
            toast.warning("El nombre de la carpeta es obligatorio");
            return;
        }

        setIsGeneratingPdf(true);
        toast.info("Generando Manifiesto y guardando en el servidor...", { duration: 4000 });

        try {
            const doc = iframeRef.current?.contentDocument;
            if (!doc) throw new Error("No se pudo acceder al iframe");

            await prepareImagesForCanvas(doc);

            // 🔴 AQUI: "l" significa LANDSCAPE (Horizontal)
            const pdf = new jsPDF("l", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            let isFirstPage = true;

            const actionButtons = doc.querySelectorAll('.delete-action, .add-row-container, .watermark-controls');
            actionButtons.forEach(btn => ((btn as HTMLElement).style.display = 'none'));

            // 🔴 SOLUCIÓN: EVITAR ICONOS APLASTADOS Y AJUSTAR MARGENES INDIVIDUALES
            const tempStyle = doc.createElement('style');
            tempStyle.id = 'pdf-export-icon-fix';
            tempStyle.innerHTML = `
                /* Prevenir que los iconos se aplasten (forzar proporciones) y alinear margen */
                .icon, 
                .icon-2, 
                .icon-3, 
                .icon-4,
                .icon-wrapper img,
                img.img[src*="container.svg"] {
                    margin-top: 10px !important; 
                }
                
                /* El icono del Footer (.icon-5) requiere un margen mayor (20px) */
                .icon-5,
                .background-2 img {
                    margin-top: 20px !important;
                    
                }
                .icon-3{
                    width: 14px !important;
                    height: 16px !important;
                    
                }
            `;
            doc.head.appendChild(tempStyle);

            const pages = doc.querySelectorAll(".cargomanifest");

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;
                const canvas = await html2canvas(page, { scale: 3, useCORS: true });
                const imgData = canvas.toDataURL("image/jpeg", 1.0);
                if (!isFirstPage) pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
                isFirstPage = false;
            }

            actionButtons.forEach(btn => ((btn as HTMLElement).style.display = ''));
            const injectedStyle = doc.getElementById('pdf-export-icon-fix');
            if (injectedStyle) injectedStyle.remove();

            const fileName = `Manifiesto_${folderName.replace(/\s+/g, "_")}.pdf`;
            pdf.save(fileName);

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
            const API_KEY = (import.meta.env.VITE_API_KEY || "").trim();
            const ID_USUARIO = localStorage.getItem("usuario_id") || "1";
            const pdfBlob = pdf.output("blob");

            const formData = new FormData();
            formData.append("key", API_KEY);
            formData.append("nombre_carpeta", folderName);
            formData.append("id_usuario", ID_USUARIO);
            if (selectedFolderId) formData.append("id", selectedFolderId);
            formData.append("url_documento_manifiesto", pdfBlob, fileName);

            const res = await axios.post(`${API_URL}/guardardoc`, formData);

            if (res.data && (res.data.status === 200 || res.data.return === true)) {
                toast.success("¡Manifiesto guardado con éxito en la Nube!");
                setIsSaveModalOpen(false);
                navigate("/dashboard");
            } else {
                throw new Error(res.data?.mensaje || res.data?.error);
            }

        } catch (error: any) {
            toast.error(`❌ ${error.message || "Error al guardar"}`);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const filteredFolders = existingFolders.filter(f => f.nombre_carpeta?.toLowerCase().includes(folderName.toLowerCase()));
    const iframeSrc = generateIframeContent(indexHtml, globalCss, styleCss);

    return (
        <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
            <AppHeader />
            <main className="flex-1 overflow-y-auto bg-slate-100/50 dark:bg-neutral-900 py-12 flex flex-col items-center gap-12 relative z-0">
                <div className="w-full max-w-[1400px] shrink-0 transition-all duration-300" style={{ height: `${iframeHeight}px` }}>
                    <iframe ref={iframeRef} srcDoc={iframeSrc} className="w-full h-full border-0 bg-transparent" title="Manifiesto Document" sandbox="allow-same-origin allow-scripts" />
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
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Guardar Manifiesto</h2>
                        <div className="mb-6 relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de Carpeta</label>
                            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f06e00] outline-none transition-all" placeholder="Carpeta..." value={folderName} onChange={handleInputChange} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} disabled={isGeneratingPdf} />
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