import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { awbSchema } from "@/schemas/awbSchema";
import { useDocumentStore } from "@/stores/documentStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { WatermarkPillSelector } from "@/components/shared/WatermarkPillSelector";
import { CargoItemTable } from "./items/CargoItemTable";

export function AirWaybillForm() {
    const { saveDraft, loadDraft, activeDocumentType, selectedCopies, setSelectedCopies } = useDocumentStore();
    const draftKey = `draft_${activeDocumentType}`;

    const methods = useForm({
        resolver: zodResolver(awbSchema),
        mode: "onChange",
        defaultValues: {
            items: [],
            ...loadDraft(draftKey)?.data as any
        }
    });

    const { register, watch, reset, setValue } = methods;

    useEffect(() => {
        const subscription = watch((value) => {
            saveDraft(draftKey, value);
        });
        return () => subscription.unsubscribe();
    }, [watch, saveDraft, draftKey]);

    useEffect(() => {
        const draft = loadDraft(draftKey);
        if (draft && draft.data) {
            reset(draft.data);
        } else {
            reset({});
        }
    }, [activeDocumentType, loadDraft, draftKey, reset]);

    // Copies handling
    const allCopies = ['ORIGINAL 3', 'COPIA 6', 'ORIGINAL 1', 'ORIGINAL 2', 'COPIA 4', 'COPIA 5'];
    const toggleCopy = (copy: string) => {
        const newCopies = selectedCopies.includes(copy)
            ? selectedCopies.filter(c => c !== copy)
            : [...selectedCopies, copy];
        setSelectedCopies(newCopies);
    };

    return (
        <FormProvider {...methods}>
            <form className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-primary">Air Waybill</h2>
                    <p className="text-muted-foreground">Guía Aérea. Todos los campos son opcionales.</p>
                </div>

                <WatermarkPillSelector />

                <SectionHeader title="Identificación AWB" defaultOpen={true}>
                    <div className="flex items-center gap-2">
                        <Input {...register("awbPrefix")} className="w-16 text-center" placeholder="230" maxLength={3} />
                        <span className="text-muted-foreground">-</span>
                        <Input {...register("awbCode")} className="w-16 text-center" placeholder="SCL" maxLength={3} />
                        <Input {...register("awbNumber")} className="flex-1 max-w-[200px]" placeholder="66549195" />
                    </div>
                </SectionHeader>

                <SectionHeader title="Remitente y Destinatario" defaultOpen={true}>
                    <div className="grid gap-6">
                        <div className="space-y-3">
                            <Label className="font-semibold text-primary">Remitente (Shipper)</Label>
                            <Textarea {...register("shipperNameAddress")} placeholder="Nombre y Dirección" rows={3} />
                            <Input {...register("shipperAccount")} placeholder="Número de Cuenta" />
                        </div>
                        <div className="space-y-3">
                            <Label className="font-semibold text-primary">Destinatario (Consignee)</Label>
                            <Textarea {...register("consigneeNameAddress")} placeholder="Nombre y Dirección" rows={3} />
                            <Input {...register("consigneeAccount")} placeholder="Número de Cuenta" />
                        </div>
                    </div>
                </SectionHeader>

                <SectionHeader title="Datos del Agente">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Nombre y Ciudad del Agente Emisor</Label>
                            <Input {...register("agentNameCity")} placeholder="ej: SHIPPING CARGO, Santiago" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Código IATA</Label>
                                <Input {...register("agentIataCode")} placeholder="ej: 75101120006" />
                            </div>
                            <div className="space-y-2">
                                <Label>Número de Cuenta</Label>
                                <Input {...register("agentAccount")} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Número de Referencia</Label>
                            <Input {...register("referenceNumber")} placeholder="ej: CM276-Jul/03/25" />
                        </div>
                        <div className="space-y-2">
                            <Label>Instrucciones Adicionales</Label>
                            <Textarea {...register("additionalInfo")} rows={2} />
                        </div>
                        <div className="space-y-2">
                            <Label>Información Contable</Label>
                            <Textarea {...register("accountingInfo")} rows={2} />
                        </div>
                    </div>
                </SectionHeader>

                <SectionHeader title="Ruta del Vuelo">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input {...register("departureAirport")} placeholder="Aeropuerto de Salida" />
                        <Input {...register("destinationAirport")} placeholder="Aeropuerto de Destino" />
                        <Input {...register("carrier")} placeholder="Transportista Principal" className="md:col-span-2" />

                        <div className="grid grid-cols-2 gap-2">
                            <Input {...register("firstStopDest")} placeholder="1a Escala - Destino" />
                            <Input {...register("firstStopCarrier")} placeholder="Aerolínea" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input {...register("secondStopDest")} placeholder="2a Escala - Destino" />
                            <Input {...register("secondStopCarrier")} placeholder="Aerolínea" />
                        </div>

                        <Input {...register("flightNumber")} placeholder="Número de Vuelo" />
                        <Input {...register("flightDate")} type="date" placeholder="Fecha del Vuelo" />
                        <Input {...register("sciCode")} placeholder="Código SCI" />
                    </div>
                </SectionHeader>

                <SectionHeader title="Tarifas y Pagos">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Moneda</Label>
                            <Input {...register("currency")} placeholder="ISO (ej: USD)" />
                        </div>
                        <div className="space-y-2">
                            <Label>Flete WT/VAL</Label>
                            <RadioGroup
                                onValueChange={(v) => setValue("wtValPayment", v)}
                                value={watch("wtValPayment")}
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2"><RadioGroupItem value="PPD" id="wt-ppd" /><Label htmlFor="wt-ppd">PPD</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="COLL" id="wt-coll" /><Label htmlFor="wt-coll">COLL</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label>Otros Cargos</Label>
                            <RadioGroup
                                onValueChange={(v) => setValue("otherPayment", v)}
                                value={watch("otherPayment")}
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2"><RadioGroupItem value="PPD" id="oth-ppd" /><Label htmlFor="oth-ppd">PPD</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="COLL" id="oth-coll" /><Label htmlFor="oth-coll">COLL</Label></div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <Input {...register("declaredValueCarriage")} placeholder="Valor Decl. Transporte" />
                        <Input {...register("declaredValueCustoms")} placeholder="Valor Decl. Aduana" />
                        <Input {...register("insuranceAmount")} placeholder="Monto Seguro" />
                    </div>
                    <div className="mt-4">
                        <Label>Instrucciones de Manejo</Label>
                        <Textarea {...register("handlingInfo")} rows={2} />
                    </div>
                </SectionHeader>

                <SectionHeader title="Detalle de Carga">
                    <CargoItemTable />
                </SectionHeader>

                <SectionHeader title="Resumen de Cargos">
                    {/* Simplified inputs for charges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input {...register("ppWeightCharge")} placeholder="Cargo por Peso PPD" />
                        <Input {...register("collWeightCharge")} placeholder="Cargo por Peso COLL" />
                        <Input {...register("totalPrepaid")} placeholder="TOTAL PREPAID" className="font-bold border-brand-primary" />
                        <Input {...register("totalCollect")} placeholder="TOTAL COLLECT" className="font-bold border-brand-primary" />
                    </div>
                </SectionHeader>

                <SectionHeader title="Copias a Exportar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {allCopies.map((copy) => (
                            <div key={copy} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`copy-${copy}`}
                                    checked={selectedCopies.includes(copy)}
                                    onCheckedChange={() => toggleCopy(copy)}
                                />
                                <Label htmlFor={`copy-${copy}`}>{copy}</Label>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCopies(allCopies)}>Marcar todas</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCopies([])}>Desmarcar todas</Button>
                    </div>
                </SectionHeader>

                <SectionHeader title="Ejecución">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input {...register("issuePlace")} placeholder="Lugar de Emisión" />
                        <Input {...register("issueDate", { valueAsDate: true })} type="date" />
                        <Input {...register("agentSignature")} placeholder="Firma Agente" />
                        <Input {...register("shipperSignature")} placeholder="Firma Remitente" />
                    </div>
                </SectionHeader>

            </form>
        </FormProvider>
    );
}
