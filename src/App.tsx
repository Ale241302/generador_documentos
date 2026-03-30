import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Cotizacion } from "./pages/Cotizacion";
import { Editor } from "./pages/Editor";
import { BlExport } from '@/pages/BlExport';
import { Bitacora } from "@/pages/Bitacora";
import { Airwilbil } from "@/pages/Airwilbil";
import { Invoices } from "@/pages/Invoices";
import { Manifiestos } from "@/pages/Manifiestos";
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="sclcargo-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cotizacion" element={<Cotizacion />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/bl-export" element={<BlExport />} />
          <Route path="/bitacora/:id" element={<Bitacora />} />
          <Route path="/awb" element={<Airwilbil />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/manifiestos" element={<Manifiestos />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
