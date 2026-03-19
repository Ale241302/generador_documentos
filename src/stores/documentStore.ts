import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DocumentType, DocumentHistoryItem, WatermarkOption } from '../types/documents';

interface DocumentStore {
    // Active state
    activeDocumentType: DocumentType | null;
    setActiveDocumentType: (type: DocumentType | null) => void;

    // Watermark
    watermark: WatermarkOption;
    setWatermark: (w: WatermarkOption) => void;

    printLabel: string | null;
    setPrintLabel: (label: string | null) => void;

    // Air Waybill Copies selection (Logic: Keep track of ids or labels)
    // Default all selected: ['Original 3', 'Copy 6', 'Original 1', 'Original 2', 'Copy 4', 'Copy 5']
    selectedCopies: string[];
    setSelectedCopies: (copies: string[]) => void;

    // History
    history: DocumentHistoryItem[];
    addToHistory: (item: DocumentHistoryItem) => void;
    removeFromHistory: (id: string) => void;

    // Drafts
    // Map of documentType -> saved state
    drafts: Record<string, { data: unknown; savedAt: string; watermark: WatermarkOption }>;
    saveDraft: (type: string, data: unknown) => void;
    loadDraft: (type: string) => { data: unknown; savedAt: string; watermark: WatermarkOption } | null;
    clearDraft: (type: string) => void;
}

export const useDocumentStore = create<DocumentStore>()(
    persist(
        (set, get) => ({
            activeDocumentType: null,
            setActiveDocumentType: (type) => set({ activeDocumentType: type }),

            watermark: null,
            setWatermark: (w) => set({ watermark: w }),

            printLabel: null,
            setPrintLabel: (label) => set({ printLabel: label }),

            selectedCopies: ['ORIGINAL 3', 'COPIA 6', 'ORIGINAL 1', 'ORIGINAL 2', 'COPIA 4', 'COPIA 5'],
            setSelectedCopies: (copies) => set({ selectedCopies: copies }),

            history: [],
            addToHistory: (item) => set((state) => ({
                history: [item, ...state.history].slice(0, 10)
            })),
            removeFromHistory: (id) => set((state) => ({
                history: state.history.filter((i) => i.id !== id)
            })),

            drafts: {},
            saveDraft: (type, data) => set((state) => ({
                drafts: {
                    ...state.drafts,
                    [type]: {
                        data,
                        savedAt: new Date().toISOString(),
                        watermark: state.watermark
                    }
                }
            })),
            loadDraft: (type) => {
                const draft = get().drafts[type];
                if (draft) {
                    // Verify if we should restore watermark too
                    // It's better to let the component handle the restore logic using this data
                    return draft;
                }
                return null;
            },
            clearDraft: (type) => set((state) => {
                const newDrafts = { ...state.drafts };
                delete newDrafts[type];
                return { drafts: newDrafts };
            }),
        }),
        {
            name: 'sclcargo-store',
        }
    )
);
