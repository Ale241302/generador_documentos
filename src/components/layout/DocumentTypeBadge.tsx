import { useDocumentStore } from "@/stores/documentStore";

export function DocumentTypeBadge() {
    const activeType = useDocumentStore(state => state.activeDocumentType);

    if (!activeType) return null;

    const labels = {
        'bl-original': 'Bill of Lading Original',
        'bl-export': 'Bill of Lading Export',
        'airwaybill': 'Air Waybill',
        'manifest': 'Cargo Manifest Aéreo',
    };

    return (
        <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-medium animate-in fade-in zoom-in">
            <span className="mr-2">📄</span>
            {labels[activeType]}
        </div>
    );
}
