import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { manifestSchema } from "@/schemas/manifestSchema";
import { useDocumentStore } from "@/stores/documentStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { WatermarkPillSelector } from "@/components/shared/WatermarkPillSelector";
import { ManifestItemTable } from "./items/ManifestItemTable";

export function CargoManifestForm() {
    const { saveDraft, loadDraft, activeDocumentType } = useDocumentStore();
    const draftKey = `draft_${activeDocumentType}`;

    const methods = useForm({
        resolver: zodResolver(manifestSchema),
        mode: "onChange",
        defaultValues: {
            houses: [],
            ...loadDraft(draftKey)?.data as any
        }
    });

    const { register, watch, reset } = methods;

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

    return (
        <FormProvider {...methods}>
            <form className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-primary">Manifiesto de Carga</h2>
                    <p className="text-muted-foreground">Listado de guías hijo (House B/Ls) para desconsolidación.</p>
                </div>

                <WatermarkPillSelector />

                <SectionHeader title="Cabecera del Manifiesto" defaultOpen={true}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Número de Viaje</Label>
                            <Input {...register("voyageNumber")} placeholder="ej: 305W" />
                        </div>
                        <div className="space-y-2">
                            <Label>Master B/L</Label>
                            <Input {...register("masterBillNumber")} placeholder="ej: HLCUSCL250170188" />
                        </div>
                        <div className="space-y-2">
                            <Label>Nave / Vuelo</Label>
                            <Input {...register("vessel")} placeholder="ej: COYHAIQUE" />
                        </div>
                        <div className="space-y-2">
                            <Label>Nacionalidad de Nave</Label>
                            <Input {...register("nationality")} placeholder="ej: CHILEAN" />
                        </div>
                        <div className="space-y-2">
                            <Label>Puerto de Embarque</Label>
                            <Input {...register("portOfLoading")} placeholder="ej: MIAMI, FL" />
                        </div>
                        <div className="space-y-2">
                            <Label>Puerto de Descarga</Label>
                            <Input {...register("portOfDischarge")} placeholder="ej: SAN ANTONIO, CHILE" />
                        </div>
                    </div>
                </SectionHeader>

                <SectionHeader title="Detalle de Houses">
                    <ManifestItemTable />
                </SectionHeader>

                <SectionHeader title="Totales">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Total Bultos</Label>
                            <Input {...register("totalPackages")} placeholder="Calculado o manual" />
                        </div>
                        <div className="space-y-2">
                            <Label>Total Peso (Kg)</Label>
                            <Input {...register("totalWeight")} placeholder="Calculado o manual" />
                        </div>
                        <div className="space-y-2">
                            <Label>Total Volumen (m³)</Label>
                            <Input {...register("totalVolume")} placeholder="Calculado o manual" />
                        </div>
                    </div>
                </SectionHeader>

                <SectionHeader title="Emisón">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <Input {...register("date", { valueAsDate: true })} type="date" />
                        </div>
                        <div className="space-y-2">
                            <Label>Lugar</Label>
                            <Input {...register("place")} placeholder="ej: Santiago" />
                        </div>
                    </div>
                </SectionHeader>

            </form>
        </FormProvider>
    );
}
