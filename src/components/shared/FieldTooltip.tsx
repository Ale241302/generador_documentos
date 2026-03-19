import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface FieldTooltipProps {
    content: string;
}

export function FieldTooltip({ content }: FieldTooltipProps) {
    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-brand-primary/70 hover:text-brand-primary cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[250px]">
                    <p>{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
