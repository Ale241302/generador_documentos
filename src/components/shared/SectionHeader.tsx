import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    description?: string;
    className?: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

export function SectionHeader({
    title,
    description,
    className,
    defaultOpen = true,
    children,
}: SectionHeaderProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={cn("mb-6 rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
            <div
                className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="space-y-1">
                    <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                <div className="text-muted-foreground">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 border-t border-transparent">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
