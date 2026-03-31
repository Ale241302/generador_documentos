import { RefreshCw, LogOut, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { DocumentTypeBadge } from "./DocumentTypeBadge";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/stores/documentStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function AppHeader({ children }: { children?: React.ReactNode }) {
    const { activeDocumentType, setActiveDocumentType } = useDocumentStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("usuario_id");
        localStorage.removeItem("nombre_usuario");
        toast.success("Sesión cerrada correctamente");
        navigate("/login");
    };

    const userName = localStorage.getItem("nombre_usuario");

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center pl-4 pr-4 max-w-full border-x-0">
                {children}
                <div className="mr-4 hidden md:flex">
                    <a className="mr-6 flex items-center space-x-2 transition-opacity hover:opacity-80" href="/dashboard">
                        <img
                            src="https://storage.googleapis.com/sclcargo/web/Home/logo-largo.png"
                            alt="SCLCargo"
                            className="h-9 w-auto"
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
                    </div>
                    <nav className="flex items-center space-x-1 lg:space-x-2">
                        {activeDocumentType && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground h-9 shadow-sm"
                                onClick={() => setActiveDocumentType(null)}
                            >
                                <RefreshCw className="h-4 w-4" />
                                Cambiar Tipo
                            </Button>
                        )}

                        <ThemeToggle />

                        <div className="hidden sm:flex items-center h-9 px-3 border-l border-r border-border/50 gap-2 bg-muted/30">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                                {userName || "Usuario"}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            onClick={handleLogout}
                            title="Cerrar Sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>

                    </nav>
                </div>
            </div>
        </header>
    )
}
