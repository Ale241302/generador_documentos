import { useDocumentStore } from "@/stores/documentStore";
import { WatermarkOption } from "@/types/documents";
import { cn } from "@/lib/utils";

const OPTIONS: WatermarkOption[] = [
    null,
    'ORIGINAL',
    'NO NEGOCIABLE',
    'DRAFT',
    'SWB',
    'EXPRESS RELEASE'
];

export function WatermarkPillSelector() {
    const { watermark, setWatermark } = useDocumentStore();

    return (
        <div className="flex flex-col gap-2 mb-4">
            <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                🔖 Vista previa de marca de agua:
            </span>
            <div className="flex flex-wrap gap-2">
                {OPTIONS.map((option) => (
                    <button
                        key={option || 'none'}
                        type="button"
                        onClick={() => setWatermark(option)}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                            watermark === option
                                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                                : "border-border bg-transparent text-muted-foreground hover:border-brand-primary/50"
                        )}
                    >
                        {option || "🚫 Sin marca"}
                    </button>
                ))}
            </div>
        </div>
    );
}
