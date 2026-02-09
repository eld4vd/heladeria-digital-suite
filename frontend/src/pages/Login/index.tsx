import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/useAuth";
import { Link } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(usuario, clave);
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Brand minimalista */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-3">
            <div className="text-[#3E2723] text-sm font-medium tracking-wide uppercase">
              Heladería Digital
            </div>
            <div className="h-px bg-[#8B7355]/20 mt-2" />
          </div>
          <h1 className="text-2xl font-medium text-[#3E2723] tracking-tight">
            Acceso al sistema
          </h1>
        </div>

        {/* Formulario como papel */}
        <div className="bg-[#FFF8E7] border border-[#8B7355]/10 rounded-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuario */}
            <div>
              <label 
                htmlFor="login-usuario" 
                className="block text-sm font-medium text-[#6B5B4F] mb-2 tracking-wide"
              >
                Usuario
              </label>
              <input
                id="login-usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-0 py-2.5 bg-[#F5F1E8] border-b border-[#8B7355]/20 text-[#3E2723] placeholder-[#8B7355]/40 focus:outline-none focus:border-[#8B7355]/60 focus:bg-[#F5F1E8] transition-[border-color,background-color] duration-200 text-base"
                placeholder="ej: admin"
                autoComplete="username"
                autoFocus
                required
                minLength={4}
                maxLength={20}
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label 
                htmlFor="login-clave" 
                className="block text-sm font-medium text-[#6B5B4F] mb-2 tracking-wide"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-clave"
                  type={showPassword ? "text" : "password"}
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  className="w-full px-0 pr-10 py-2.5 bg-[#F5F1E8] border-b border-[#8B7355]/20 text-[#3E2723] placeholder-[#8B7355]/40 focus:outline-none focus:border-[#8B7355]/60 focus:bg-[#F5F1E8] transition-[border-color,background-color] duration-200 text-base"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-0 bottom-2 text-[#8B7355]/50 hover:text-[#6B5B4F] transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <MdVisibilityOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <MdVisibility className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-[#FFFBF0] border border-[#B76E79]/30 rounded-sm">
                <p className="text-sm text-[#8B4049] leading-relaxed">{error}</p>
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A3933] text-[#FFF8E7] py-3 rounded-sm font-medium hover:bg-[#3E2723] disabled:opacity-60 disabled:cursor-not-allowed transition-[background-color] duration-200 text-base tracking-wide"
            >
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </button>
          </form>

          {/* Footer discreto */}
          <div className="mt-8 pt-6 border-t border-[#8B7355]/10">
            <p className="text-center text-xs text-[#8B7355]/60 tracking-wide">
              Sistema de gestión · {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Link volver */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#6B5B4F] hover:text-[#4A3933] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
