import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { useDocumentStore } from "@/stores/documentStore";
import { toast } from "sonner";

export function useExportPDF() {
    const [isExporting, setIsExporting] = useState(false);

    const exportPDF = async (elementRef: React.RefObject<HTMLDivElement | null>) => {
        const { activeDocumentType, selectedCopies } = useDocumentStore.getState();
        const element = elementRef.current;

        if (!element || !activeDocumentType) {
            toast.error("No hay documento para exportar");
            return;
        }

        setIsExporting(true);
        const toastId = toast.loading("Generando PDF...");

        try {
            const today = new Date();
            const yyyymmdd = format(today, "yyyyMMdd");
            const filename = `${activeDocumentType}-SCLCargo-${yyyymmdd}`;

            // Save original styles so we can restore them after capture
            const originalTransform = element.style.transform;
            const originalTransition = element.style.transition;
            const originalTransformOrigin = element.style.transformOrigin;
            const originalMinHeight = element.style.minHeight;

            // Also fix overflow on ancestor containers so content is not clipped
            const scrollParent = element.parentElement;
            const originalParentOverflow = scrollParent?.style.overflow || '';
            const originalParentHeight = scrollParent?.style.height || '';
            if (scrollParent) {
                scrollParent.style.overflow = 'visible';
                scrollParent.style.height = 'auto';
            }

            // Reset transform so html2canvas captures at 1:1 scale
            element.style.transform = 'none';
            element.style.transition = 'none';
            element.style.transformOrigin = 'top left';
            element.style.minHeight = '297mm'; // Ensure full A4 height

            // Wait for the browser to apply the style changes and images to load
            await new Promise(resolve => setTimeout(resolve, 300));

            // html2canvas config
            const options: Parameters<typeof html2canvas>[1] = {
                scale: 2,        // High resolution
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                width: element.scrollWidth,
                height: element.scrollHeight,
                onclone: (clonedDoc) => {
                    // Ensure cloned element has no transform either
                    const clonedEl = clonedDoc.querySelector('[data-preview-root]') || clonedDoc.querySelector('.bl-preview')?.parentElement;
                    if (clonedEl) {
                        (clonedEl as HTMLElement).style.transform = 'none';
                        (clonedEl as HTMLElement).style.overflow = 'visible';
                    }
                }
            };

            const captureAndAddPage = async (doc: jsPDF, addPage = false) => {
                if (addPage) doc.addPage();
                const canvas = await html2canvas(element, options);
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const imgProps = doc.getImageProperties(imgData);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfPageHeight = doc.internal.pageSize.getHeight();
                let finalWidth = pdfWidth;
                let finalHeight = (imgProps.height * pdfWidth) / imgProps.width;

                // If the image is taller than the page, scale down to fit
                if (finalHeight > pdfPageHeight) {
                    const ratio = pdfPageHeight / finalHeight;
                    finalHeight = pdfPageHeight;
                    finalWidth = pdfWidth * ratio;
                }

                // Center horizontally if scaled down
                const xOffset = (pdfWidth - finalWidth) / 2;
                doc.addImage(imgData, 'JPEG', xOffset, 0, finalWidth, finalHeight);
            };

            const pdf = new jsPDF('p', 'mm', 'a4');

            if (activeDocumentType === 'airwaybill' && selectedCopies.length > 0) {
                for (let i = 0; i < selectedCopies.length; i++) {
                    const copyLabel = selectedCopies[i];
                    useDocumentStore.getState().setPrintLabel(copyLabel);
                    // Wait for render
                    await new Promise(resolve => setTimeout(resolve, 200));
                    await captureAndAddPage(pdf, i > 0);
                }
            } else {
                await captureAndAddPage(pdf, false);
            }

            // Restore original styles
            element.style.transform = originalTransform;
            element.style.transition = originalTransition;
            element.style.transformOrigin = originalTransformOrigin;
            element.style.minHeight = originalMinHeight;
            if (scrollParent) {
                scrollParent.style.overflow = originalParentOverflow;
                scrollParent.style.height = originalParentHeight;
            }

            pdf.save(filename + '.pdf');
            toast.success("PDF generado exitosamente");

        } catch (error) {
            console.error(error);
            toast.error("Error al exportar PDF");
            // Attempt to restore styles even on error
            if (element) {
                element.style.transform = '';
                element.style.transition = '';
                element.style.transformOrigin = '';
                element.style.minHeight = '';
            }
        } finally {
            useDocumentStore.getState().setPrintLabel(null);
            setIsExporting(false);
            toast.dismiss(toastId);
        }
    };

    return { exportPDF, isExporting };
}
