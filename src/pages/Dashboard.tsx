import { useEffect, useState, useRef } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Plus, X, Search } from "lucide-react";
import { useDocumentStore } from "@/stores/documentStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ESTADOS_MAP: Record<number, string> = {
  1: "Creado",
  2: "Pagado Parcialmente",
  3: "Pagado Totalmente",
  4: "Cancelado"
};

export function Dashboard() {
  const [records, setRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setActiveDocumentType, activeDocumentType } = useDocumentStore();
  const navigate = useNavigate();

  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [pendingEstado, setPendingEstado] = useState<{ id: any; nuevoEstado: string; viejoEstado: string } | null>(null);

  const [isValorModalOpen, setIsValorModalOpen] = useState(false);
  const [pendingValor, setPendingValor] = useState<{ id: any; nuevoValor: string; viejoValor: string; inputTarget: HTMLInputElement } | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
  const API_KEY = import.meta.env.VITE_API_KEY || "";
  const ID_USUARIO = localStorage.getItem("usuario_id") || "1";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveDocumentType(null);
  }, []);

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
      const res = await fetch(`${API_URL}/listardoc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: API_KEY })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS' || data.return === true) {
        setRecords(data.data || []);
      } else {
        toast.error(data.message || data.mensaje || data.error || "Error al obtener documentos");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Error al obtener los documentos");
    }
  };

  const handleEstadoChange = (row: any, nuevoEstado: string) => {
    const viejoEstado = row.estado ? String(row.estado) : "1";
    if (nuevoEstado === viejoEstado) return;

    setPendingEstado({ id: row.id, nuevoEstado, viejoEstado });
    setIsEstadoModalOpen(true);
  };

  const confirmEstadoUpdate = async () => {
    if (!pendingEstado) return;
    try {
      const formData = new FormData();
      formData.append('key', API_KEY);
      formData.append('id', pendingEstado.id);
      formData.append('id_usuario', ID_USUARIO);
      formData.append('estado', pendingEstado.nuevoEstado);

      const res = await fetch(`${API_URL}/updateestado`, { method: "POST", body: formData });
      const data = await res.json();

      if (data.return) {
        toast.success("Estado actualizado correctamente");
        fetchRecords();
      } else {
        toast.error(data.mensaje || "Error al actualizar estado");
      }
    } catch (e) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsEstadoModalOpen(false);
      setPendingEstado(null);
    }
  };

  const handleValorBlur = (row: any, e: React.FocusEvent<HTMLInputElement>) => {
    const nuevoValor = e.target.value.trim();
    const viejoValor = row.valor_pagado ? String(row.valor_pagado).trim() : "";

    if (nuevoValor !== viejoValor) {
      setPendingValor({ id: row.id, nuevoValor, viejoValor, inputTarget: e.target });
      setIsValorModalOpen(true);
    }
  };

  const cancelValorUpdate = () => {
    if (pendingValor && pendingValor.inputTarget) {
      pendingValor.inputTarget.value = pendingValor.viejoValor;
    }
    setIsValorModalOpen(false);
    setPendingValor(null);
  };

  const confirmValorUpdate = async () => {
    if (!pendingValor) return;
    try {
      const formData = new FormData();
      formData.append('key', API_KEY);
      formData.append('id', pendingValor.id);
      formData.append('id_usuario', ID_USUARIO);
      formData.append('valor_pagado', pendingValor.nuevoValor);

      const res = await fetch(`${API_URL}/updatevalorpagado`, { method: "POST", body: formData });
      const data = await res.json();

      if (data.return) {
        toast.success("Valor pagado actualizado");
        fetchRecords();
      } else {
        toast.error(data.mensaje || "Error al actualizar valor pagado");
        cancelValorUpdate();
        return;
      }
    } catch (e) {
      toast.error("Error de conexión");
      cancelValorUpdate();
      return;
    }
    setIsValorModalOpen(false);
    setPendingValor(null);
  };

  const renderDocumentLink = (url: string | null) => {
    if (!url || url === "N//A") return <span className="text-muted-foreground">-</span>;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity">
        <img src="https://storage.googleapis.com/sclcargo/web/Home/crearnoticia/doc-noticia.png" alt="Doc" className="w-8 h-8 object-contain" />
      </a>
    );
  };

  const renderBitacoraIcon = (id: any) => {
    if (!id) return <span className="text-muted-foreground">-</span>;
    return (
      <button
        onClick={() => navigate(`/bitacora/${id}`)}
        className="p-2 inline-flex items-center justify-center hover:bg-orange-50 rounded-full transition-all hover:scale-110"
      >
        <img src="https://storage.googleapis.com/sclcargo/web/Home/h-cotizacion.png" alt="Bitácora" className="w-10 h-10 object-contain" />
      </button>
    );
  };

  // ==========================================
  // LÓGICA DE FILTRADO UNIFICADO
  // ==========================================
  const filteredRecords = records.filter((row) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();

    const folderMatch = (row.nombre_carpeta || "").toLowerCase().includes(term);
    const valueMatch = (String(row.valor_pagado) || "").toLowerCase().includes(term);
    const estadoString = ESTADOS_MAP[Number(row.estado)] || "";
    const statusMatch = estadoString.toLowerCase().includes(term);

    return folderMatch || valueMatch || statusMatch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8 w-full flex flex-col">

        {/* ENCABEZADO Y BUSCADOR UNIFICADO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold shrink-0">Documentos Generados</h1>

          <div className="relative w-full sm:w-80 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f06e00] focus:border-transparent sm:text-sm transition-all"
              placeholder="Buscar carpeta, valor o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border bg-card shadow-sm w-full overflow-x-auto pb-4">
          <table className="w-full text-sm text-left min-w-max">
            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">ID</th>
                <th className="px-6 py-4 whitespace-nowrap">Fecha Creación</th>
                <th className="px-6 py-4 whitespace-nowrap">Nombre Carpeta</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Cotización</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Manifiesto</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Invoices</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">BL Import</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">BL Export</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">AWB</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Arribo Air</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Arribo Sea</th>
                <th className="px-6 py-4 whitespace-nowrap w-40">Valor Pagado</th>
                <th className="px-6 py-4 whitespace-nowrap w-52">Estado</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Bitácora</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{row.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.fecha_creacion}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.nombre_carpeta}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_cotizacion)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_manifiesto)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_invoices)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_bl_import)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_bl_export)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_awb)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_arribo_air)}</td>
                    <td className="px-6 py-4 text-center">{renderDocumentLink(row.url_documento_arribo_sea)}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f06e00] focus:border-transparent transition-all"
                          defaultValue={row.valor_pagado || ""}
                          placeholder="0.00"
                          onBlur={(e) => handleValorBlur(row, e)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={row.estado || "1"}
                        onChange={(e) => handleEstadoChange(row, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#f06e00] focus:border-transparent cursor-pointer transition-all text-sm font-medium"
                      >
                        <option value="1">Creado</option>
                        <option value="2">Pagado Parcialmente</option>
                        <option value="3">Pagado Totalmente</option>
                        <option value="4">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">{renderBitacoraIcon(row.id)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center text-muted-foreground">
                    No se encontraron documentos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MENÚ INFERIOR DE ACCIÓN */}
      <div className="fixed bottom-8 right-8 z-40" ref={menuRef}>
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 mb-2 w-56 rounded-md shadow-lg bg-card border border-border/50 py-1 z-50">
            <button className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-muted border-b border-border/50 transition-colors" onClick={() => navigate('/cotizacion')}>Cotización</button>
            <button className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-muted border-b border-border/50 transition-colors" onClick={() => { /* navigate('/manifiesto') */ }}>Manifiesto</button>
            <button className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-muted border-b border-border/50 transition-colors" onClick={() => { /* navigate('/invoices') */ }}>Invoices</button>
            <button className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-muted border-b border-border/50 transition-colors" onClick={() => { /* navigate('/bl-import') */ }}>BL Import</button>
            <button className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-muted border-b border-border/50 transition-colors" onClick={() => navigate('/bl-export')}>BL Export</button>
            <button className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-muted border-b border-border/50 transition-colors" onClick={() => navigate('/awb')}>AWB</button>
            <button className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-muted border-b border-border/50 transition-colors" onClick={() => { /* navigate('/arribo-air') */ }}>Arribo Air</button>
            <button className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors" onClick={() => { /* navigate('/arribo-sea') */ }}>Arribo Sea</button>
          </div>
        )}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="cursor-pointer w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-all"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>

      {/* Modales de Confirmación */}
      {isEstadoModalOpen && pendingEstado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-sm">
            <h2 className="text-xl font-bold mb-4">Confirmar Cambio</h2>
            <p className="mb-6">
              Cambiar estado de <span className="font-bold">{ESTADOS_MAP[Number(pendingEstado.viejoEstado)]}</span> a <span className="font-bold text-[#f06e00]">{ESTADOS_MAP[Number(pendingEstado.nuevoEstado)]}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button className="px-5 py-2 border-2 border-[#f06e00] text-[#f06e00] rounded-lg" onClick={() => { setIsEstadoModalOpen(false); setPendingEstado(null); }}>Cancelar</button>
              <button className="px-5 py-2 bg-[#f06e00] text-white rounded-lg" onClick={confirmEstadoUpdate}>Actualizar</button>
            </div>
          </div>
        </div>
      )}

      {isValorModalOpen && pendingValor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-sm">
            <h2 className="text-xl font-bold mb-4">Actualizar Valor</h2>
            <p className="mb-6">
              ¿Actualizar el valor pagado a <span className="font-bold text-[#f06e00]">${pendingValor.nuevoValor || "0"}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button className="px-5 py-2 border-2 border-[#f06e00] text-[#f06e00] rounded-lg" onClick={cancelValorUpdate}>Cancelar</button>
              <button className="px-5 py-2 bg-[#f06e00] text-white rounded-lg" onClick={confirmValorUpdate}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}