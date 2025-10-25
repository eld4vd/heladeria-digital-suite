import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { MdSend } from "react-icons/md";

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  tipo: string;
  mensaje: string;
  acepta: boolean;
  website: string;
}

const initialState: FormState = {
  nombre: "",
  email: "",
  telefono: "",
  tipo: "general",
  mensaje: "",
  acepta: false,
  website: "",
};

interface ContactFormProps {
  initialType?: string;
  initialMessage?: string;
}

function ContactForm({ initialType, initialMessage }: ContactFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!touched && initialType) {
      setForm((prev) => ({ ...prev, tipo: initialType }));
    }
  }, [initialType, touched]);

  useEffect(() => {
    if (!touched && initialMessage) {
      setForm((prev) => ({ ...prev, mensaje: initialMessage }));
    }
  }, [initialMessage, touched]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name !== "website") {
      setTouched(true);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.website.trim().length > 0) {
      // Honeypot activado: abortamos silenciosamente para evitar spam automatizado.
      return;
    }
    // Validaciones simples
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Correo inválido");
      return;
    }
    if (form.nombre.trim().length < 2) {
      setError("Nombre demasiado corto");
      return;
    }
    if (form.mensaje.trim().length < 10) {
      setError("Por favor detalla un poco más tu mensaje");
      return;
    }
    setSending(true);
    // Simulación de envío
    setTimeout(() => {
      setSending(false);
      setSuccess("Mensaje enviado. Te responderemos pronto.");
      setForm(initialState);
      setTouched(false);
    }, 1200);
  };

  return (
    <section aria-labelledby="form-contacto" className="relative">
      <h2
        id="form-contacto"
        className="text-xl font-bold tracking-tight mb-4 text-gray-900"
      >
        Envíanos un mensaje
      </h2>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="hidden" aria-hidden="true">
          <label>
            <span>Déjanos tu sitio (si eres humano, deja esto vacío)</span>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre" required>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              minLength={2}
              className={inputCls}
              autoComplete="name"
              aria-describedby="form-feedback"
              placeholder="Tu nombre"
            />
          </Field>
          <Field label="Correo" required>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={inputCls}
              autoComplete="email"
              aria-describedby="form-feedback"
              placeholder="tucorreo@mail.com"
            />
          </Field>
          <Field label="Teléfono (opcional)">
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className={inputCls}
              type="tel"
              inputMode="tel"
              pattern="[0-9+\-\s]{6,}"
              autoComplete="tel"
              aria-describedby="form-feedback"
              placeholder="Ej: 77712345"
            />
          </Field>
          <Field label="Tipo de consulta">
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className={inputCls}
              aria-describedby="form-feedback"
            >
              <option value="general">Consulta general</option>
              <option value="pedido">Pedido especial</option>
              <option value="franquicia">Franquicia</option>
            </select>
          </Field>
        </div>
        <Field label="Mensaje" required>
          <textarea
            name="mensaje"
            value={form.mensaje}
            onChange={handleChange}
            required
            minLength={10}
            rows={5}
            className={inputCls + " resize-none"}
            aria-describedby="form-feedback"
            placeholder="Cuéntanos tu idea o consulta"
          />
        </Field>
        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            name="acepta"
            checked={form.acepta}
            onChange={handleChange}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
          />
          <span>Quiero recibir novedades y promociones.</span>
        </label>
        <div id="form-feedback" className="space-y-2" aria-live="polite">
          {error && (
            <p
              role="alert"
              className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-md"
            >
              {success}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            disabled={sending}
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-semibold shadow-sm hover:bg-cyan-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <MdSend className={`w-4 h-4 ${sending ? "animate-pulse" : ""}`} />
            {sending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </section>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder:text-gray-400 transition-shadow duration-200";

type FieldProps = {
  label: string;
  children: ReactNode;
  required?: boolean;
};

function Field({ label, children, required }: FieldProps) {
  return (
    <label className="text-xs font-medium text-gray-600 flex flex-col gap-1">
      <span className="uppercase tracking-wide text-[11px] font-semibold text-gray-500">
        {label}
        {required && <span className="text-cyan-600"> *</span>}
      </span>
      {children}
    </label>
  );
}

export default ContactForm;

/*
  -Este componente extenso sirve para el formulario de contacto, es muy extenso porque incluye:
   * Validaciones simples (formato de email, longitud mínima de nombre y mensaje)
   * Estados para manejar el formulario (valores, envío, éxito, error)
   * Un componente auxiliar FIELD para los campos del formulario, que incluye la etiqueta y el estilo común.
  -FIELD es un componente auxiliar para los campos del formulario, que incluye la etiqueta y el estilo común.
*/
