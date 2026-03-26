import { RefreshCw } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { DocumentTypeBadge } from "./DocumentTypeBadge";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/stores/documentStore";

export function AppHeader({ children }: { children?: React.ReactNode }) {
    const { activeDocumentType, setActiveDocumentType } = useDocumentStore();

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center pl-4 pr-4 max-w-full">
                {children}
                <div className="mr-4 hidden md:flex">
                    <a className="mr-6 flex items-center space-x-2" href="/dashboard">
                        <img
                            src="https://storage.googleapis.com/sclcargo/web/Home/logo-largo.png"
                            alt="SCLCargo"
                            className="h-10 w-auto"
                        />
                    </a>
                </div>

                {/* Mobile Logo */}
                <div className="flex md:hidden mr-2">
                    <img
                        src="https://storage.googleapis.com/sclcargo/web/favicon.png"
                        alt="SCLCargo"
                        className="h-8 w-8"
                    />
                </div>

                <DocumentTypeBadge />

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search/Command would go here if needed */}
                    </div>
                    <nav className="flex items-center space-x-2">
                        {activeDocumentType && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground"
                                onClick={() => setActiveDocumentType(null)}
                            >
                                <RefreshCw className="h-4 w-4" />
                                Cambiar Tipo
                            </Button>
                        )}



                    </nav>
                </div>
            </div>
        </header>
    )
}
