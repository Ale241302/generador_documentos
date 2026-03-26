import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function Bitacora() {
    const { id } = useParams(); // Capturamos el ID del documento desde la URL
    const navigate = useNavigate();

    const [messages, setMessages] = useState<any[]>([]);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [newNote, setNewNote] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
    const API_KEY = import.meta.env.VITE_API_KEY || "";
    const ID_USUARIO = localStorage.getItem("usuario_id") || "1";

    useEffect(() => {
        if (id) {
            fetchBitacoraData();
        }
    }, [id]);

    // Auto-scroll al final cuando llegan nuevos mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchBitacoraData = async () => {
        try {
            const res = await fetch(`${API_URL}/datos_registros`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: API_KEY, id })
            });
            const data = await res.json();

            if (data.return) {
                setMessages(data.bitacora || []);
                setDocInfo(data.data);
            } else {
                toast.error("Error al cargar la bitácora");
            }
        } catch (e) {
            toast.error("Error de conexión con el servidor");
        }
    };

    const sendNewNote = async () => {
        if (!newNote.trim() || !id) return;

        try {
            const res = await fetch(`${API_URL}/crearbitacora`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: API_KEY,
                    id: "0",
                    id_usuario: ID_USUARIO,
                    id_generado_documentos: id,
                    nota: newNote.trim()
                })
            });
            const data = await res.json();

            if (data.return) {
                setNewNote(""); // Limpiamos el input
                fetchBitacoraData(); // Recargamos para ver el nuevo mensaje
            } else {
                toast.error("Error al enviar el mensaje");
            }
        } catch (e) {
            toast.error("Error de conexión al enviar");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
            <AppHeader />

            <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)] py-6 px-4 md:px-8">
                {/* Cabecera del Chat */}
                <div className="bg-white rounded-t-2xl shadow-sm border-b px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Bitácora del Documento</h1>
                            <p className="text-sm text-gray-500">
                                {docInfo ? `Carpeta: ${docInfo.nombre_carpeta} (ID: ${id})` : `Cargando ID: ${id}...`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Área de Mensajes (Scrollable Eje Y) */}
                <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col gap-4 shadow-sm">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            No hay registros en esta bitácora aún.
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={msg.id || index} className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm text-[#f06e00] capitalize">
                                        {msg.nombre_usuario || 'Sistema'}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {new Date(msg.fecha_creacion).toLocaleString('es-ES', {
                                            dateStyle: 'short',
                                            timeStyle: 'short'
                                        })}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.nota}
                                </p>
                            </div>
                        ))
                    )}
                    {/* Ancla para el Auto-Scroll */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input inferior fijo */}
                <div className="bg-white rounded-b-2xl shadow-sm border-t p-4 flex items-end gap-3 z-10">
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendNewNote();
                            }
                        }}
                        placeholder="Escribe una nueva nota o mensaje..."
                        className="flex-1 bg-gray-100 px-4 py-3 rounded-xl resize-none h-12 min-h-[48px] max-h-32 focus:h-24 transition-all outline-none focus:ring-2 focus:ring-[#f06e00] text-sm"
                    />
                    <button
                        onClick={sendNewNote}
                        disabled={!newNote.trim()}
                        className="p-3 bg-[#f06e00] text-white rounded-full hover:bg-[#d15f00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </main>
        </div>
    );
}