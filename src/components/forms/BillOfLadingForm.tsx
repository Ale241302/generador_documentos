import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blSchema } from "@/schemas/blSchema";
import { useDocumentStore } from "@/stores/documentStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FieldTooltip } from "@/components/shared/FieldTooltip";
import { WatermarkPillSelector } from "@/components/shared/WatermarkPillSelector";
import { ContainerTable } from "./items/ContainerTable";

interface BillOfLadingFormProps {
    variant: 'original' | 'export';
}

export function BillOfLadingForm({ variant }: BillOfLadingFormProps) {
    const { saveDraft, loadDraft, activeDocumentType } = useDocumentStore();
    const draftKey = `draft_${activeDocumentType}`;

    const methods = useForm({
        resolver: zodResolver(blSchema),
        mode: "onChange",
        defaultValues: {
            containers: [],
            // Initialize with draft if available (logic handled primarily via useEffect reset, but defaultValues helps initial render)
            ...loadDraft(draftKey)?.data as any
        }
    });
    const { register, watch, reset } = methods;

    // Auto-save draft
    useEffect(() => {
        const subscription = watch((value) => {
            saveDraft(draftKey, value);
        });
        return () => subscription.unsubscribe();
    }, [watch, saveDraft, draftKey]);

    // Load draft on mount (or type change)
    useEffect(() => {
        const draft = loadDraft(draftKey);
        if (draft && draft.data) {
            reset(draft.data);
        } else {
            reset({}); // Clear if no draft
        }
    }, [activeDocumentType, loadDraft, draftKey, reset]);


    return (
        <FormProvider {...methods}>
            <form className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-primary">
                        {variant === 'original' ? 'Bill of Lading Original' : 'Bill of Lading Export'}
                    </h2>
                    <p className="text-muted-foreground">
                        Complete la información del documento. Todos los campos son opcionales.
                    </p>
                </div>

                <WatermarkPillSelector />

                <SectionHeader title="Datos de las Partes" defaultOpen={true}>
                    <div className="grid gap-6">
                        <div className="space-y-4">
                            <Label className="text-base font-semibold text-primary">Exportador (Shipper)</Label>
                            <div className="grid gap-3">
                                <Input {...register("exporterName")} placeholder="Nombre de la empresa (ej: VIÑA CONCHA Y TORO S.A.)" />
                                <Textarea {...register("exporterAddress")} placeholder="Dirección completa" rows={2} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Input {...register("exporterRut")} placeholder="RUT / Tax ID" />
                                    <Input {...register("exporterPhone")} placeholder="Teléfono" />
                                    <Input {...register("exporterCity")} placeholder="Ciudad y País" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-semibold text-primary">Consignatario (Consignee)</Label>
                            <div className="grid gap-3">
                                <Input {...register("consigneeName")} placeholder="Nombre de la empresa" />
                                <Textarea {...register("consigneeAddress")} placeholder="Dirección completa" rows={2} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Input {...register("consigneeTaxId")} placeholder="NIT / Tax ID" />
                                    <Input {...register("consigneePhone")} placeholder="Teléfono" />
                                    <Input {...register("consigneeCity")} placeholder="Ciudad y País" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="font-semibold">Parte Notificada (Notify Party)</Label>
                                <Input {...register("notifyName")} placeholder="Nombre" />
                                <Textarea {...register("notifyAddress")} placeholder="Dirección" rows={2} />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-semibold">Agente de Carga (Freight Forwarder)</Label>
                                <Input {...register("agentName")} placeholder="Nombre" />
                                <Textarea {...register("agentAddress")} placeholder="Dirección" rows={2} />
                            </div>
                        </div>
                    </div>
                </SectionHeader>

                <SectionHeader title="Datos del Documento" defaultOpen={true}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Número de Documento</Label>
                            <Input {...register("documentNumber")} placeholder="ej: 21966297" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>Número de B/L (House)</Label>
                                <FieldTooltip content="Conocimiento de embarque de la casa (House Bill of Lading)" />
                            </div>
                            <Input {...register("houseNumber")} placeholder="ej: (H)BL11719" />
                        </div>
                        <div className="space-y-2">
                            <Label>Referencias de Exportación</Label>
                            <Input {...register("exportReferences")} placeholder="ej: PED 46301260" />
                        </div>
                        <div className="space-y-2">
                            <Label>Punto / Estado de Origen</Label>
                            <Input {...register("originPoint")} placeholder="ej: SANTIAGO. CHILE" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Instrucciones de Enrutamiento</Label>
                            <Textarea {...register("routingInstructions")} rows={3} placeholder="Instrucciones de exportación..." />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Muelle o Terminal de Carga</Label>
                            <Input {...register("loadingTerminal")} placeholder="ej: Terminal Puerto San Antonio" />
                        </div>
                    </div>
                </SectionHeader>

                <SectionHeader title="Datos del Transporte">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo de Traslado</Label>
                            <Input {...register("transportType")} placeholder="ej: Buque, En contenedor" />
                        </div>
                        <div className="flex items-center justify-between border rounded-md p-3">
                            <Label htmlFor="isContainerized" className="cursor-pointer">¿La carga va en contenedor?</Label>
                            <Switch id="isContainerized" onCheckedChange={(c) => methods.setValue('isContainerized', c)} checked={watch('isContainerized')} />
                        </div>

                        <div className="space-y-2">
                            <Label>Transportista de Pre-Carguío</Label>
                            <Input {...register("preCarriageBy")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Lugar de Recepción</Label>
                            <Input {...register("placeOfReceipt")} placeholder="ej: Santiago" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>Nave / Transportista Exportador</Label>
                                <FieldTooltip content="Nombre del barco y número de viaje" />
                            </div>
                            <Input {...register("exportVessel")} placeholder="ej: DUSSELDORF EXPRESS / 504W" />
                        </div>

                        <div className="space-y-2">
                            <Label>Puerto de Embarque</Label>
                            <Input {...register("portOfLoading")} placeholder="ej: San Antonio" />
                        </div>
                        <div className="space-y-2">
                            <Label>Puerto de Descarga</Label>
                            <Input {...register("portOfDischarge")} placeholder="ej: Buenaventura" />
                        </div>
                        <div className="space-y-2">
                            <Label>Lugar de Entrega</Label>
                            <Input {...register("placeOfDelivery")} />
                        </div>
                    </div>
                </SectionHeader>

                <SectionHeader title="Detalle de Carga">
                    <ContainerTable />
                </SectionHeader>

                <SectionHeader title="Flete y Pagos">
                    <div className="grid gap-6">
                        <div className="space-y-3">
                            <Label>Tipo de Flete</Label>
                            <RadioGroup
                                defaultValue="PREPAID"
                                onValueChange={(v) => methods.setValue('freightType', v as any)}
                                value={watch('freightType')}
                                className="flex flex-row space-x-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="PREPAID" id="r1" />
                                    <Label htmlFor="r1" className="cursor-pointer font-normal">PREPAGO</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="COLLECT" id="r2" />
                                    <Label htmlFor="r2" className="cursor-pointer font-normal">COBRO EN DESTINO</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Valor Declarado</Label>
                                <Input {...register("declaredValue")} placeholder="ej: USD" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>N° Master B/L</Label>
                                    <FieldTooltip content="Número del conocimiento de embarque del naviero principal" />
                                </div>
                                <Input {...register("masterBillNumber")} placeholder="ej: HLCUSCL250170188" />
                            </div>
                        </div>
                    </div>
                </SectionHeader>

                <SectionHeader title="Firma y Fecha">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Lugar de Emisión</Label>
                            <Input {...register("placeOfIssue")} placeholder="ej: SANTIAGO" />
                        </div>
                        {/* Using text input for date for simplicity as prompt allowed native date picker, but text is sometimes better for free form unless strictly date */}
                        {/* Prompt: "Date picker nativo o shadcn Calendar" */}
                        <div className="space-y-2">
                            <Label>Fecha de Emisión</Label>
                            <Input {...register("dateOfIssue", { valueAsDate: true })} type="date" className="block w-full" />
                        </div>
                        <div className="space-y-2">
                            <Label>Agente Autorizado</Label>
                            <Input {...register("authorizedAgent")} placeholder="ej: Wilfredo Caroca" />
                        </div>
                        <div className="space-y-2">
                            <Label>Número de B/L Final</Label>
                            <Input {...register("finalBillNumber")} />
                        </div>
                    </div>
                </SectionHeader>

            </form>
        </FormProvider>
    );
}
