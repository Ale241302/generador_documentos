import React from 'react';
import { useDocumentStore } from "@/stores/documentStore";
import { BillOfLadingPreview } from "@/components/previews/BillOfLadingPreview";
import { AirWaybillPreview } from "@/components/previews/AirWaybillPreview";
import { CargoManifestPreview } from "@/components/previews/CargoManifestPreview";
import { WatermarkOverlay } from "@/components/shared/WatermarkOverlay";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Monitor, Maximize } from "lucide-react";

export function PreviewPanel({ previewRef }: { previewRef: React.RefObject<HTMLDivElement | null> }) {
    const { activeDocumentType, watermark } = useDocumentStore();
    const [scale, setScale] = React.useState(0.75);

    if (!activeDocumentType) return <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/20">Vista previa no disponible</div>;

    return (
        <div className="h-full flex flex-col bg-secondary/10 relative overflow-hidden">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-background/80 backdrop-blur px-2 py-1 rounded-full border shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.25))}><ZoomOut className="h-4 w-4" /></Button>
                <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(1.5, s + 0.25))}><ZoomIn className="h-4 w-4" /></Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="ghost" size="icon" title="Ajustar alt"><Monitor className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" title="Pantalla completa"><Maximize className="h-4 w-4" /></Button>
            </div>

            <div className="flex-1 overflow-auto flex items-start justify-center p-8 bg-slate-100 dark:bg-zinc-900 border-l">
                <div
                    ref={previewRef}
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'center top',
                        transition: 'transform 0.2s',
                        width: '210mm',
                        minHeight: '297mm', // A4
                        position: 'relative',
                        backgroundColor: 'white',
                        color: 'black', // Document is always black on white
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                >
                    <WatermarkOverlay text={watermark} />

                    {/* Content */}
                    <div className="h-full w-full relative z-10">
                        {activeDocumentType === 'bl-original' && <BillOfLadingPreview variant="original" />}
                        {activeDocumentType === 'bl-export' && <BillOfLadingPreview variant="export" />}
                        {activeDocumentType === 'airwaybill' && <AirWaybillPreview />}
                        {activeDocumentType === 'manifest' && <CargoManifestPreview />}
                    </div>
                </div>
            </div>
        </div>
    );
}
