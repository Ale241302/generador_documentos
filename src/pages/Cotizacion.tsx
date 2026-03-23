import { useEffect, useState, useRef } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import indexPrincipalHtml from "@/components/Quotation/indexprincipal.html?raw";
import globalPrincipalCss from "@/components/Quotation/globalprincipal.css?raw";
import stylePrincipalCss from "@/components/Quotation/styleprincipal.css?raw";

import indexSecundarioHtml from "@/components/Quotation/indexsecundario.html?raw";
import globalSecundarioCss from "@/components/Quotation/globalsecundario.css?raw";
import styleSecundarioCss from "@/components/Quotation/stylesecundario.css?raw";

// ─────────────────────────────────────────────
// HELPER: Convierte una URL externa a base64
// Necesario para que html2canvas capture imágenes
// cargadas desde GCP Storage (CORS)
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
    img.onerror = () => resolve(""); // Si falla CORS, continuar sin imagen
    img.src = url;
  });
};

// ─────────────────────────────────────────────
// HELPER: onclone para html2canvas
// Corrige márgenes negativos y position:absolute
// del footer que html2canvas no interpreta bien
// ─────────────────────────────────────────────
const fixFooterForCanvas = (clonedDoc: Document) => {
  // Ajustes SÍNCRONOS para html2canvas: usamos flexbox explícito 
  // para mantener la alineación vertical perfecta del icono y el texto.

  // 1. Template Principal: .container-35
  const containers35 = clonedDoc.querySelectorAll(".container-35");
  containers35.forEach((c35: any) => {
    c35.style.setProperty("display", "flex", "important");
    c35.style.setProperty("align-items", "center", "important");
    c35.style.setProperty("gap", "8px", "important");
  });

  // 2. Template Secundario: .container-10
  const containers10 = clonedDoc.querySelectorAll(".container-10");
  containers10.forEach((c10: any) => {
    c10.style.setProperty("display", "flex", "important");
    c10.style.setProperty("align-items", "center", "important");
    c10.style.setProperty("gap", "8px", "important");
  });

  // 3. Limpieza de notas y otros márgenes problemáticos
  const leftSideNotes2 = clonedDoc.querySelectorAll(".left-side-notes-2");
  leftSideNotes2.forEach((ln: any) => ln.style.setProperty("margin-bottom", "0", "important"));
};

// Función auxiliar para convertir imágenes antes de html2canvas
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
      body {
        background: transparent !important;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      .quotation {
        background-color: white;
        box-shadow: 0 0 40px rgba(0,0,0,0.1);
        margin: 0 auto 48px auto;
        height: 1529px;
        overflow: hidden;
      }
    </style>
  `;
  const styleTag = `<style>${globalCss}\n${styleCss}</style>`;
  const baseTag = `<base href="${window.location.origin}/src/components/Quotation/" />`;
  return html.replace("</head>", `${baseTag}\n${styleTag}\n${visualFixes}\n</head>`);
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export function Cotizacion() {
  const navigate = useNavigate();

  const iframePrincipalRef = useRef<HTMLIFrameElement>(null);
  const iframeSecundarioRef = useRef<HTMLIFrameElement>(null);

  const [principalHeight, setPrincipalHeight] = useState(1529);
  const [syncedHeaderHtml, setSyncedHeaderHtml] = useState<string | null>(null);
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
      if (event.data?.type === "RESIZE_PRINCIPAL") setPrincipalHeight(event.data.height);
      if (event.data?.type === "HEADER_UPDATED") setSyncedHeaderHtml(event.data.headerHtml);
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

  // ─────────────────────────────────────────────
  // HANDLER PRINCIPAL: generar PDF y enviar al backend
  // ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!folderName.trim()) {
      toast.warning("El nombre de la carpeta es obligatorio");
      return;
    }

    setIsGeneratingPdf(true);
    toast.info("Generando documento y guardando en el servidor...", { duration: 4000 });

    try {
      const docPrin = iframePrincipalRef.current?.contentDocument;
      if (!docPrin) throw new Error("No se pudo acceder al iframe principal");

      // ── 1. EXTRAER DATOS DEL HTML ──────────────────────────
      const extractedData: any = { items: [], totales: {} };

      const rows = docPrin.querySelectorAll(".row, .row-2, .row-3, .row-4");
      rows.forEach(row => {
        const celdas = row.querySelectorAll('[contenteditable="true"]');
        if (celdas.length >= 5) {
          extractedData.items.push({
            charge: (celdas[0] as HTMLElement).innerText.trim(),
            quantity: (celdas[1] as HTMLElement).innerText.trim(),
            unit: (celdas[2] as HTMLElement).innerText.trim(),
            price: (celdas[3] as HTMLElement).innerText.trim(),
            amount: (celdas[4] as HTMLElement).innerText.trim(),
          });
        }
      });

      extractedData.totales = {
        subtotalCLP: (docPrin.querySelector(".text-wrapper-40") as HTMLElement)?.innerText.trim(),
        subtotalUSD: (docPrin.querySelector(".text-wrapper-43") as HTMLElement)?.innerText.trim(),
        taxCLP: (docPrin.querySelectorAll(".tax-input")[0] as HTMLElement)?.innerText.trim(),
        taxUSD: (docPrin.querySelectorAll(".tax-input")[1] as HTMLElement)?.innerText.trim(),
        totalCLP: (docPrin.querySelector(".text-wrapper-42") as HTMLElement)?.innerText.trim(),
        totalUSD: (docPrin.querySelector(".text-wrapper-44") as HTMLElement)?.innerText.trim(),
      };

      extractedData.info = {
        cotizacionNo: (docPrin.querySelector(".quotation-number") as HTMLElement)?.innerText.trim(),
        cliente: (docPrin.querySelector(".HANKA-OPERADOR") as HTMLElement)?.innerText.trim(),
      };

      // ── 2. PREPARAR DOCUMENTO (Imágenes a Base64) ──────
      await prepareImagesForCanvas(docPrin);

      // ── 3. GENERAR PDF ─────────────────────────────────────
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let isFirstPage = true;

      // Ocultar botones de edición antes de capturar
      const buttons = docPrin.querySelectorAll(".delete-action, .add-row-container");
      buttons.forEach(btn => ((btn as HTMLElement).style.display = "none"));

      // Capturar páginas del iframe principal
      const pagesPrin = docPrin.querySelectorAll(".quotation");
      for (let i = 0; i < pagesPrin.length; i++) {
        const page = pagesPrin[i] as HTMLElement;
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          onclone: fixFooterForCanvas, // ← aplica todos los fixes del footer
        });
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        if (!isFirstPage) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        isFirstPage = false;
      }

      // Restaurar botones de edición
      buttons.forEach(btn => ((btn as HTMLElement).style.display = ""));

      // Capturar iframe secundario
      const docSec = iframeSecundarioRef.current?.contentDocument;
      if (docSec) {
        // Preparar imágenes del secundario
        await prepareImagesForCanvas(docSec);

        const pageSec = docSec.querySelector(".quotation") as HTMLElement;
        if (pageSec) {
          const canvas = await html2canvas(pageSec, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            onclone: fixFooterForCanvas,
          });
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          if (!isFirstPage) pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        }
      }

      // ── 4. DESCARGAR PDF LOCALMENTE ────────────────────────
      const fileName = `Cotizacion_${extractedData.info.cotizacionNo || folderName.replace(/\s+/g, "_")
        }.pdf`;
      pdf.save(fileName);

      // ── 5. PREPARAR FORMDATA Y ENVIAR AL BACKEND ───────────
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
      const API_KEY = (import.meta.env.VITE_API_KEY || "").trim();

      const pdfBlob = pdf.output("blob");
      const formData = new FormData();

      formData.append("key", API_KEY);
      formData.append("nombre_carpeta", folderName);
      formData.append("id_usuario", "1");
      formData.append("datos_cotizacion", JSON.stringify(extractedData));

      if (selectedFolderId) {
        formData.append("id", selectedFolderId);
      }

      // ✅ Sin header manual — Axios calcula el boundary automáticamente
      formData.append("url_documento_cotizacion", pdfBlob, fileName);
      const res = await axios.post(`${API_URL}/guardardoc`, formData);

      if (res.data && (res.data.status === 200 || res.data.return === true)) {
        toast.success("¡Documento guardado con éxito en la Nube!");
        setIsSaveModalOpen(false);
        navigate("/dashboard");
      } else {
        const errorBackend = res.data?.mensaje || res.data?.error || "Error al procesar la petición";
        throw new Error(errorBackend);
      }

    } catch (error: any) {
      console.error("Error en handleSave:", error);
      const errorMsg =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.message ||
        "Ocurrió un error al generar o guardar";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  const filteredFolders = existingFolders.filter(f =>
    f.nombre_carpeta?.toLowerCase().includes(folderName.toLowerCase())
  );

  const principalSrc = generateIframeContent(indexPrincipalHtml, globalPrincipalCss, stylePrincipalCss);

  let finalSecundarioHtml = indexSecundarioHtml;
  if (syncedHeaderHtml) {
    finalSecundarioHtml = indexSecundarioHtml.replace(
      /<header class="header">[\s\S]*?<\/header>/i,
      `<header class="header">${syncedHeaderHtml}</header>`
    );
  }
  const secundarioSrc = generateIframeContent(finalSecundarioHtml, globalSecundarioCss, styleSecundarioCss);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      <AppHeader />

      <main className="flex-1 overflow-y-auto bg-slate-100/50 dark:bg-neutral-900 py-12 flex flex-col items-center gap-12 relative z-0">

        {/* IFRAME PRINCIPAL */}
        <div
          className="w-full max-w-[1000px] shrink-0 transition-all duration-300"
          style={{ height: `${principalHeight}px` }}
        >
          <iframe
            ref={iframePrincipalRef}
            srcDoc={principalSrc}
            className="w-full h-full border-0 bg-transparent"
            title="Página Principal"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>

        {/* IFRAME SECUNDARIO */}
        <div className="w-full max-w-[1000px] h-[1529px] shrink-0">
          <iframe
            ref={iframeSecundarioRef}
            srcDoc={secundarioSrc}
            className="w-full h-full border-0"
            title="Página Secundaria"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </main>

      {/* BOTÓN FLOTANTE */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          title="Guardar Cotización"
        >
          <img
            src="https://storage.googleapis.com/sclcargo/SCLCargo_gendoc/assets/save-svgrepo-com.svg"
            alt="Guardar"
            className="w-7 h-7 filter invert"
          />
        </button>
      </div>

      {/* MODAL DE GUARDAR */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Guardar Cotización</h2>

            <div className="mb-6 relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de Carpeta
              </label>
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
              .custom-btn-actions {
                margin-top: 1rem;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
              }
              .custom-btn-actions button {
                border-radius: 10px;
                font-family: 'Archivo', sans-serif;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                width: 140px;
                height: 45px;
                transition: background-color 0.5s, color 0.5s;
              }
              .btn-guardar {
                background-color: #f06e00;
                color: #fff;
                border: none;
                position: relative;
                overflow: hidden;
                z-index: 1;
              }
              .btn-guardar::after {
                content: "";
                position: absolute;
                width: 200%; height: 200%;
                background: #2f2f2f;
                border-radius: 50%;
                bottom: 0; left: 50%;
                transform: translateX(-50%) scale(0);
                transition: transform 0.5s ease;
                z-index: -1;
              }
              .btn-guardar:hover::after { transform: translateX(-50%) scale(1); }
              .btn-guardar:hover { color: #fff; }
              .btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }
              .btn-cancel {
                background-color: #fff;
                color: #f06e00;
                border: 2px solid #f06e00;
              }
              .btn-cancel:hover {
                background-color: #f06e00;
                color: #fff;
              }
              .btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
            `}</style>

            <div className="custom-btn-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/dashboard")}
                disabled={isGeneratingPdf}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-guardar"
                onClick={handleSave}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? "Generando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
