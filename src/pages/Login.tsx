import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import SHA256 from "crypto-js/sha256";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost/scl-cargo-back/gendoc";
      const API_KEY = import.meta.env.VITE_API_KEY || "";
      const claveHash = SHA256(clave).toString();

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, clave: claveHash, key: API_KEY })
      });

      const data = await res.json();

      if (data.status === 'SUCCESS' || data.return === true) {

        // =========================================================
        // 🔥 FIX: GUARDAR EL ID DEL USUARIO EN LOCALSTORAGE
        // =========================================================
        if (data.data && data.data.id) {
          localStorage.setItem("usuario_id", data.data.id.toString());

          // Opcional: También puedes guardar el nombre por si lo necesitas luego
          if (data.data.nombre_usuario) {
            localStorage.setItem("nombre_usuario", data.data.nombre_usuario);
          }
        }
        // =========================================================

        toast.success(data.message || data.mensaje || "Login exitoso");
        navigate("/dashboard");
      } else {
        toast.error(data.message || data.mensaje || data.error || "Credenciales incorrectas");
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative selection:bg-primary/30">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl shadow-xl border border-border/50">
        <div className="flex justify-center">
          <img
            src="https://storage.googleapis.com/sclcargo/web/Home/logo-largo.png"
            alt="SCLCargo Logo"
            style={{ width: "11.563vw", height: "3.385vw", minWidth: "150px", minHeight: "44px" }}
          />
        </div>
        <form onSubmit={handleLogin} className="space-y-6 mt-8">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
              Clave
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}