import { useRef, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

import { FormPanel } from "@/components/layout/FormPanel";
import { PreviewPanel } from "@/components/layout/PreviewPanel";
import { ExportFAB } from "@/components/shared/ExportFAB";
import { useDocumentStore } from "@/stores/documentStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function Editor() {
  const activeDocumentType = useDocumentStore(state => state.activeDocumentType);
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If we land on editor without document type, go back
    if (!activeDocumentType) {
        navigate("/dashboard");
    }
  }, [activeDocumentType, navigate]);

  const showContent = !!activeDocumentType;

  return (
      <div className="flex h-screen flex-col bg-background overflow-hidden w-full">
        <AppHeader>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hidden md:flex items-center gap-1 mr-4">
                <ArrowLeft className="w-4 h-4" /> Volver
            </Button>
        </AppHeader>

        <main className="flex-1 overflow-hidden relative">
          {!showContent ? (
            <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
              <p>Redirigiendo al dashboard...</p>
            </div>
          ) : (
            <div className="h-full flex flex-col md:flex-row">
              {/* Mobile View */}
              <div className="md:hidden flex-1 flex flex-col">
                <Tabs defaultValue="form" className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 rounded-none h-12">
                    <TabsTrigger value="form">📝 Formulario</TabsTrigger>
                    <TabsTrigger value="preview">👁️ Vista Previa</TabsTrigger>
                  </TabsList>
                  <TabsContent value="form" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col">
                    <FormPanel />
                  </TabsContent>
                  <TabsContent value="preview" className="flex-1 overflow-hidden mt-0 bg-secondary/10 data-[state=active]:flex flex-col">
                    <PreviewPanel previewRef={previewRef} />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Desktop View */}
              <div className="hidden md:block w-2/5 border-r h-full overflow-hidden">
                <FormPanel />
              </div>
              <div className="hidden md:block w-3/5 h-full overflow-hidden bg-secondary/10">
                <PreviewPanel previewRef={previewRef} />
              </div>
            </div>
          )}
        </main>

        {showContent && <ExportFAB documentRef={previewRef} />}
      </div>
  );
}
