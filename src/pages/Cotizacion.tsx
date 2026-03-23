import { useEffect, useState, useRef } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

import indexPrincipalHtml from "@/components/Quotation/indexprincipal.html?raw";
import globalPrincipalCss from "@/components/Quotation/globalprincipal.css?raw";
import stylePrincipalCss from "@/components/Quotation/styleprincipal.css?raw";

import indexSecundarioHtml from "@/components/Quotation/indexsecundario.html?raw";
import globalSecundarioCss from "@/components/Quotation/globalsecundario.css?raw";
import styleSecundarioCss from "@/components/Quotation/stylesecundario.css?raw";

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

export function Cotizacion() {
  const navigate = useNavigate();
  const principalSrc = generateIframeContent(indexPrincipalHtml, globalPrincipalCss, stylePrincipalCss);
  const secundarioSrc = generateIframeContent(indexSecundarioHtml, globalSecundarioCss, styleSecundarioCss);

  // Estados para el Iframe
  const [principalHeight, setPrincipalHeight] = useState(1529);

  // Estados para el Modal de Guardar
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Estado para la lista de carpetas (simulada por ahora, aquí guardarás los listardoc)
  const [existingFolders, setExistingFolders] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 1. Cargar las carpetas existentes al abrir el componente (para el autocomplete)
  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
      const API_KEY = import.meta.env.VITE_API_KEY || "";

      const res = await axios.post(`${API_URL}/listardoc`, { key: API_KEY });
      if (res.data && (res.data.status === 'SUCCESS' || res.data.return === true)) {
        setExistingFolders(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  // 2. Escuchador del Iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'RESIZE_PRINCIPAL') {
        setPrincipalHeight(event.data.height);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 3. Manejadores del Input Autocomplete
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFolderName(value);
    setSelectedFolderId(null); // Reseteamos el ID porque está escribiendo algo nuevo
    setShowSuggestions(true);
  };

  const handleSelectFolder = (folder: any) => {
    setFolderName(folder.nombre_carpeta);
    setSelectedFolderId(folder.id);
    setShowSuggestions(false);
  };

  // 4. Función Guardar (Axios Preparado)
  const handleSave = async () => {
    if (!folderName.trim()) {
      toast.warning("El nombre de la carpeta es obligatorio");
      return;
    }

    try {
      // PREPARACIÓN DE AXIOS (Lógica a implementar luego)
      console.log("Enviando a guardar...");
      console.log("ID Seleccionado:", selectedFolderId);
      console.log("Nombre de Carpeta:", folderName);

      /*
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
      const API_KEY = import.meta.env.VITE_API_KEY || "";
      
      const formData = new FormData();
      formData.append('key', API_KEY);
      formData.append('nombre_carpeta', folderName);
      if (selectedFolderId) {
        formData.append('id', selectedFolderId); // Si quieres actualizar en vez de crear
      }
      // formData.append('datos_cotizacion', JSON.stringify(tusDatos));
      
      const res = await axios.post(`${API_URL}/creardoc`, formData);
      if (res.data.status === 'SUCCESS') {
        toast.success("Guardado correctamente");
        setIsSaveModalOpen(false);
      }
      */

      toast.success("Documento listo para guardar (Axios comentado)");
      setIsSaveModalOpen(false);

    } catch (error) {
      console.error(error);
      toast.error("Error al intentar guardar");
    }
  };

  // Filtrar sugerencias
  const filteredFolders = existingFolders.filter(f =>
    f.nombre_carpeta?.toLowerCase().includes(folderName.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      <AppHeader />

      <main className="flex-1 overflow-y-auto bg-slate-100/50 dark:bg-neutral-900 py-12 flex flex-col items-center gap-12 relative z-0">

        {/* CONTENEDOR PRINCIPAL */}
        <div
          className="w-full max-w-[1000px] shrink-0 transition-all duration-300"
          style={{ height: `${principalHeight}px` }}
        >
          <iframe
            srcDoc={principalSrc}
            className="w-full h-full border-0 bg-transparent"
            title="Página Principal"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>

        {/* CONTENEDOR SECUNDARIO */}
        <div className="w-full max-w-[1000px] h-[1529px] shrink-0">
          <iframe
            srcDoc={secundarioSrc}
            className="w-full h-full border-0"
            title="Página Secundaria"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </main>

      {/* BOTÓN FLOTANTE GUARDAR */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          title="Guardar Cotización"
        >
          <img
            src="https://storage.googleapis.com/sclcargo/SCLCargo_gendoc/assets/save-svgrepo-com.svg"
            alt="Guardar"
            className="w-7 h-7 filter invert" // 'filter invert' lo hace blanco si el SVG original es negro
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
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay para permitir el clic
              />

              {/* LISTA DESPLEGABLE (AUTOCOMPLETE) */}
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

            {/* ESTILOS INYECTADOS PARA LOS BOTONES QUE PEDISTE */}
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
              
              .btn-cancel { 
                background-color: #fff; 
                color: #f06e00; 
                border: 2px solid #f06e00; 
              }
              .btn-cancel:hover { 
                background-color: #f06e00; 
                color: #fff; 
              }
            `}</style>

            <div className="custom-btn-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-guardar"
                onClick={handleSave}
              >
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}