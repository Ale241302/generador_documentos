import { useEffect, useState, useRef } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Plus, X } from "lucide-react";
import { useDocumentStore } from "@/stores/documentStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Dashboard() {
  const [records, setRecords] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setActiveDocumentType, activeDocumentType } = useDocumentStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset active document when entering dashboard to prevent instant navigation if previously set
  useEffect(() => {
    setActiveDocumentType(null);
  }, []);

  // When user uses the modal to select a doctype, navigate to editor
  useEffect(() => {
    if (activeDocumentType) {
        navigate("/editor");
    }
  }, [activeDocumentType, navigate]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
      const API_KEY = import.meta.env.VITE_API_KEY || "";
      
      const res = await fetch(`${API_URL}/listardoc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: API_KEY })
      });
      
      const data = await res.json();
      
      if (data.status === 'SUCCESS' || data.return === true) {
        // the payload comes mapped inside `data` property from Phalcon array => return $this->setJsonResponse(..., ['data' => $documentos])
        // so it might be data.data
        setRecords(data.data || []);
      } else {
        toast.error(data.message || data.mensaje || data.error || "Error al obtener documentos");
      }
    } catch (error) {
        console.error("Error fetching records:", error);
        toast.error("Error al obtener los documentos");
    }
  };

  const renderDocumentLink = (url: string | null) => {
    if (!url) return <span className="text-muted-foreground">-</span>;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity">
        <img src="https://storage.googleapis.com/sclcargo/web/Home/crearnoticia/doc-noticia.png" alt="Doc" className="w-5 h-5 object-contain" />
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      <main className="flex-1 p-8 container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Documentos Generados</h1>
        
        <div className="rounded-md border bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Fecha Creación</th>
                <th className="px-6 py-4">Nombre Carpeta</th>
                <th className="px-6 py-4 text-center">Cotización</th>
                <th className="px-6 py-4 text-center">Manifiesto</th>
                <th className="px-6 py-4 text-center">Invoices</th>
                <th className="px-6 py-4 text-center">BL Import</th>
                <th className="px-6 py-4 text-center">BL Export</th>
                <th className="px-6 py-4 text-center">AWB</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{row.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.fecha_creacion}</td>
                    <td className="px-6 py-4">{row.nombre_carpeta}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_cotizacion)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_manifiesto)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_invoices)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_bl_import)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_bl_export)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_awb)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                    No hay documentos generados. Haz clic en el botón + para crear uno.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-40" ref={menuRef}>
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 mb-2 w-56 rounded-md shadow-lg bg-card border border-border/50 ring-1 ring-black ring-opacity-5 py-1 z-50">
            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors font-medium border-b border-border/50" onClick={() => navigate('/cotizacion')}>Cotización</button>
            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50" onClick={() => {}}>Manifiesto de Carga</button>
            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50" onClick={() => {}}>BL Importación</button>
            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50" onClick={() => {}}>BL Exportación</button>
            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50" onClick={() => {}}>AWB</button>
            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => {}}>Factura Cliente</button>
          </div>
        )}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Menú de documentos"
        >
          {isMenuOpen ? <X className="w-6 h-6 animate-in spin-in-90" /> : <Plus className="w-6 h-6 animate-in spin-in-90" />}
        </button>
      </div>
    </div>
  );
}
