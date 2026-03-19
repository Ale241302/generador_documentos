import { useDocumentStore } from "@/stores/documentStore";
import { BillOfLadingForm } from "@/components/forms/BillOfLadingForm";
import { AirWaybillForm } from "@/components/forms/AirWaybillForm";
import { CargoManifestForm } from "@/components/forms/CargoManifestForm";

export function FormPanel() {
    const activeType = useDocumentStore(state => state.activeDocumentType);

    if (!activeType) return <div className="flex items-center justify-center h-full text-muted-foreground">Selecciona un documento</div>;

    return (
        <div className="h-full overflow-y-auto bg-background p-4 pb-24">
            {/* Progress bar placehoder */}
            <div className="mb-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-1/3 transition-all duration-500" />
            </div>

            {activeType === 'bl-original' && <BillOfLadingForm variant="original" />}
            {activeType === 'bl-export' && <BillOfLadingForm variant="export" />}
            {activeType === 'airwaybill' && <AirWaybillForm />}
            {activeType === 'manifest' && <CargoManifestForm />}
        </div>
    );
}
