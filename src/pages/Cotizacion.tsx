import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { PrincipalPreview } from "@/components/Quotation/PrincipalPreview";
import { SecundarioPreview } from "@/components/Quotation/SecundarioPreview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Cotizacion() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"principal" | "secundario">("principal");

  // Unified State for the Quotation to pass down to preview
  const [formData, setFormData] = useState({
    quotationNo: "QT-9141",
    date: "Mar/12/2026 11:30 am",
    requestedByCompany: "HANKA OPERADOR LOGISTICO S.A.",
    requestedByRepresentative: "Carmen Zamudio",
    requestedByPhone: "Tel: (511) 531 - 8888",
    requestedByEmail: "sales2@hankacargo.com",
    requestedByAddress: ", PERU",
    createdBy: "Rodrigo Mora",
    expiresOn: "Mar/24/2026 11:59 PM",
    transportMode: "Aéreo",
    serviceType: "Port to Port",
    carrier: "LATAM AIRLINES GROUP",
    frequency: "Otros",
    paymentTerms: "Net 4",
    incoterms: "Free Carrier",
    
    originPort: "Santiago",
    originPlace: "-",
    originCompany: "-",
    originAddress: "-",
    
    destPort: "Quito",
    destPlace: "-",
    destCompany: "-",
    destAddress: "-",
    
    goodsDescription: "General air cargo, including electronic components and industrial machinery parts. Securely packed in reinforced wooden crates.",
    
    notes: "This quotation is valid for 30 days. Rates are subject to space availability and carrier surcharges at the time of booking. Local charges at destination are not included unless specified.",
    conditions: "1) Sujeta a piezas finales, con respecto a su peso, dimensiones, tipo de carga, embalaje y \"loadability\". (Nota para máximo estándar 300cm de largo, 200cm de ancho, 160cm de alto)\n2) Válida por 30 días.\n3) Sujeta a disponibilidad de espacio al momento de la reserva.\n4) Todas las tarifas son entregadas bajo la condición que están sujetas a cambio en cualquier minuto con aviso previo.\n5) Carga que es de origen o para uso militar, dual o donde el exportador/consignatario es una institución de las Fuerzas Armadas de algún país requiere ser informada a la Línea Aérea con antelación a la reserva para verificar si puede ser transportada."
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <AppHeader />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Form */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-border">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Crear Cotización</h1>
            {/* Theme Toggle for convenience in this view too */}
            <ThemeToggle />
          </div>

          <div className="space-y-6 max-w-2xl">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>N° de Cotización</Label>
                <Input name="quotationNo" value={formData.quotationNo} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input name="date" value={formData.date} onChange={handleChange} />
              </div>
            </div>

            {/* Requested By */}
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="font-semibold text-lg">Requested By</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input name="requestedByCompany" value={formData.requestedByCompany} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Representante</Label>
                  <Input name="requestedByRepresentative" value={formData.requestedByRepresentative} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input name="requestedByPhone" value={formData.requestedByPhone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="requestedByEmail" value={formData.requestedByEmail} onChange={handleChange} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Dirección</Label>
                  <Input name="requestedByAddress" value={formData.requestedByAddress} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="font-semibold text-lg">Detalles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Creado por</Label>
                  <Input name="createdBy" value={formData.createdBy} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Expira</Label>
                  <Input name="expiresOn" value={formData.expiresOn} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Modo Transp.</Label>
                  <Input name="transportMode" value={formData.transportMode} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo Servicio</Label>
                  <Input name="serviceType" value={formData.serviceType} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Aerolínea / Carrier</Label>
                  <Input name="carrier" value={formData.carrier} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  <Input name="frequency" value={formData.frequency} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Términos de Pago</Label>
                  <Input name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Incoterms</Label>
                  <Input name="incoterms" value={formData.incoterms} onChange={handleChange} />
                </div>
              </div>
            </div>

             {/* Origin & Destination */}
             <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg">Origen</h3>
                <div className="space-y-2">
                  <Label>Puerto</Label>
                  <Input name="originPort" value={formData.originPort} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Lugar de Recepción</Label>
                  <Input name="originPlace" value={formData.originPlace} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg">Destino</h3>
                <div className="space-y-2">
                  <Label>Puerto</Label>
                  <Input name="destPort" value={formData.destPort} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Lugar de Entrega</Label>
                  <Input name="destPlace" value={formData.destPlace} onChange={handleChange} />
                </div>
              </div>
             </div>

            {/* Description of Goods */}
            <div className="space-y-4 p-4 border rounded-md">
              <div className="space-y-2">
                <Label>Descripción de los Bienes</Label>
                <Textarea 
                  name="goodsDescription" 
                  value={formData.goodsDescription} 
                  onChange={handleChange} 
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Notes & Conditions */}
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="font-semibold text-lg">Notas y Condiciones (Página 2)</h3>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Condiciones</Label>
                <Textarea 
                  name="conditions" 
                  value={formData.conditions} 
                  onChange={handleChange} 
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8 pb-8">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-input bg-background rounded-md shadow-sm text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Cancelar
            </button>
            <button 
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md shadow-sm text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>

        {/* Right Side: Visual Preview */}
        <div className="w-1/2 bg-muted/30 overflow-y-auto p-4 flex flex-col items-center">
           <div className="flex space-x-2 mb-4 bg-muted p-1 rounded-lg">
             <button
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "principal" ? "bg-background shadow-sm" : "hover:bg-background/50 text-muted-foreground"}`}
               onClick={() => setActiveTab("principal")}
             >
               Página 1 (Principal)
             </button>
             <button
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "secundario" ? "bg-background shadow-sm" : "hover:bg-background/50 text-muted-foreground"}`}
               onClick={() => setActiveTab("secundario")}
             >
               Página 2 (Condiciones)
             </button>
           </div>
           
           <div className="w-full flex justify-center">
             {activeTab === "principal" ? (
               <PrincipalPreview data={formData as any} />
             ) : (
               <SecundarioPreview data={formData as any} />
             )}
           </div>
        </div>
      </main>
    </div>
  );
}
