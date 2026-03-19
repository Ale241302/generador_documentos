import { useExportPDF } from "@/hooks/useExportPDF";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportFABProps {
    documentRef: React.RefObject<HTMLDivElement | null>;
}

export function ExportFAB({ documentRef }: ExportFABProps) {
    const { isExporting, exportPDF } = useExportPDF();

    const handleExport = async () => {
        if (documentRef.current) {
            await exportPDF(documentRef);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            size="icon"
            className={cn(
                "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl bg-brand-primary hover:bg-brand-primary/90 z-50 transition-all hover:scale-105 active:scale-95",
                isExporting && "opacity-80 scale-100 cursor-wait"
            )}
        >
            {isExporting ? <Loader2 className="h-8 w-8 text-white animate-spin" /> : <FileDown className="h-8 w-8 text-white" />}
            <span className="sr-only">Descargar PDF</span>
        </Button>
    );
}
