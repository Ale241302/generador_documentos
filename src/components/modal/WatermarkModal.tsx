import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDocumentStore } from "@/stores/documentStore";
import { useExportPDF } from "@/hooks/useExportPDF";
import { Loader2 } from "lucide-react";

interface WatermarkModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentRef: React.RefObject<HTMLDivElement | null>;
}

export function WatermarkModal({ open, onOpenChange, documentRef }: WatermarkModalProps) {
    const { watermark, setWatermark } = useDocumentStore();
    const { exportPDF, isExporting } = useExportPDF();

    const handleExport = async () => {
        await exportPDF(documentRef);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Opciones de Exportación</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-4">
                        <h4 className="font-medium leading-none">Marca de Agua</h4>
                        <RadioGroup
                            defaultValue={watermark ?? undefined}
                            onValueChange={(val) => setWatermark(val as any)}
                            className="grid gap-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="" id="wm-none" />
                                <Label htmlFor="wm-none">Ninguna</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="DRAFT" id="wm-draft" />
                                <Label htmlFor="wm-draft">BORRADOR / DRAFT</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="CONFIDENTIAL" id="wm-confidential" />
                                <Label htmlFor="wm-confidential">CONFIDENCIAL</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="COPY" id="wm-copy" />
                                <Label htmlFor="wm-copy">COPIA / COPY</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ORIGINAL" id="wm-original" />
                                <Label htmlFor="wm-original">ORIGINAL</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <DialogFooter className="sm:justify-end">
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={handleExport} disabled={isExporting}>
                        {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Descargar PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
