import { useState } from 'react';

const faqs = [
  { q: '¿Hacen pedidos para eventos?', a: 'Sí, podemos preparar helados personalizados y en grandes cantidades. Escríbenos tu idea.' },
  { q: '¿Tienen opciones sin lactosa?', a: 'Contamos con una línea de sabores a base de agua y algunas alternativas vegetales.' },
  { q: '¿Puedo solicitar franquicia?', a: 'Estamos evaluando expandirnos. Elige "Franquicia" en el formulario y cuéntanos tu propuesta.' },
];

const FAQMini = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section aria-labelledby="faq-heading" className="space-y-4 rounded-xl bg-white border border-slate-200 p-6 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-white">
          <span className="text-lg font-bold">?</span>
        </div>
        <h2 id="faq-heading" className="text-lg font-bold text-slate-800">Preguntas frecuentes</h2>
      </div>
      <ul className="space-y-3">
        {faqs.map((f,i) => {
          const active = open === i;
          return (
            <li key={f.q} className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
              <button onClick={() => setOpen(active ? null : i)} className="w-full flex items-center justify-between text-left px-4 py-3 hover:bg-slate-100 transition-colors">
                <span className="text-sm font-semibold text-slate-700 pr-4">{f.q}</span>
                <span className={`text-cyan-600 text-lg font-bold transition-transform ${active ? 'rotate-45' : ''}`}>+</span>
              </button>
              <div className={`grid transition-all duration-300 ${active ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]' } px-4`}>
                <div className="overflow-hidden">
                  <p className="text-sm leading-relaxed text-slate-600 pb-4">{f.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FAQMini;
