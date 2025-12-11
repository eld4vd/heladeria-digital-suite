import { useState } from 'react';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      category: 'productos',
      question: '¿Qué hace que sus helados sean artesanales?',
      answer: 'Nuestros helados son 100% artesanales porque los elaboramos diariamente en pequeños lotes, utilizando solo ingredientes naturales sin conservantes ni colorantes artificiales. Seguimos recetas tradicionales italianas y cada sabor es preparado a mano por nuestros maestros heladeros.'
    },
    {
      category: 'productos',
      question: '¿Tienen opciones sin lactosa o veganas?',
      answer: 'Sí, contamos con una línea completa de helados veganos elaborados con leches vegetales (coco, almendra, soja) y una selección de sorbetes naturales. También ofrecemos opciones sin lactosa y sin gluten. Todos están claramente identificados en nuestro menú.'
    },
    {
      category: 'productos',
      question: '¿Cómo conservan la frescura de los helados?',
      answer: 'Producimos nuestros helados diariamente en cantidades controladas para garantizar máxima frescura. Utilizamos vitrinas especializadas a temperatura óptima (-14°C a -18°C) y no mantenemos stock antiguo. Lo que compras hoy, fue hecho hoy.'
    },
    {
      category: 'ingredientes',
      question: '¿De dónde provienen sus ingredientes?',
      answer: 'Trabajamos con proveedores locales certificados para frutas y lácteos frescos. Los ingredientes especiales como pistachos sicilianos, vainilla de Madagascar y cacao venezolano son importados directamente de sus regiones de origen para garantizar autenticidad.'
    },
    {
      category: 'ingredientes',
      question: '¿Los helados contienen alérgenos?',
      answer: 'Algunos sabores contienen alérgenos comunes como lácteos, frutos secos, huevos o gluten. Cada producto está etiquetado con información completa de alérgenos. Si tienes alergias específicas, consulta con nuestro personal antes de ordenar.'
    },
    {
      category: 'pedidos',
      question: '¿Cómo funciona el sistema de pedidos online?',
      answer: 'Puedes agregar productos a tu carrito, seleccionar el método de entrega (delivery o pick-up) y proceder al pago. Recibirás una confirmación inmediata por email con los detalles de tu pedido y tiempo estimado de preparación.'
    },
    {
      category: 'pedidos',
      question: '¿Cuál es el tiempo de entrega?',
      answer: 'Para delivery dentro de la ciudad, el tiempo promedio es de 30-45 minutos. Para pedidos pick-up, tu orden estará lista en 15-20 minutos. Los pedidos realizados con anticipación (más de 2 horas) se entregan en el horario que especifiques.'
    },
    {
      category: 'pedidos',
      question: '¿Cuál es el pedido mínimo?',
      answer: 'No tenemos pedido mínimo para pick-up en tienda. Para delivery a domicilio, el pedido mínimo es de Bs. 50 dentro de nuestra zona de cobertura. Consulta nuestro mapa de zonas en la sección de contacto.'
    },
    {
      category: 'pagos',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos efectivo, tarjetas de débito/crédito (Visa, Mastercard), transferencias bancarias y códigos QR (todos los bancos). El pago se realiza contra entrega para delivery o al momento de recoger en tienda.'
    },
    {
      category: 'pagos',
      question: '¿Puedo cancelar o modificar mi pedido?',
      answer: 'Sí, puedes cancelar o modificar tu pedido sin costo llamándonos o escribiéndonos por WhatsApp hasta 30 minutos antes de la hora de entrega programada. Una vez iniciada la preparación, no es posible hacer cambios.'
    },
    {
      category: 'negocio',
      question: '¿Cuál es su horario de atención?',
      answer: 'Atendemos de lunes a domingo: Lunes a jueves de 10:00 AM a 10:00 PM, viernes y sábados de 10:00 AM a 11:00 PM, y domingos de 11:00 AM a 9:00 PM. Los pedidos online se reciben hasta 1 hora antes del cierre.'
    },
    {
      category: 'negocio',
      question: '¿Dónde están ubicados?',
      answer: 'Nuestra heladería principal está en el centro de la ciudad. Puedes encontrar la dirección exacta y un mapa interactivo en nuestra página de Contacto. También hacemos delivery a toda la zona metropolitana.'
    },
    {
      category: 'negocio',
      question: '¿Tienen programa de lealtad o descuentos?',
      answer: 'Sí, tenemos un sistema de puntos para clientes frecuentes. Por cada compra acumulas puntos que puedes canjear por descuentos. También ofrecemos promociones especiales los martes y jueves (consulta nuestra página de Ofertas).'
    },
    {
      category: 'eventos',
      question: '¿Hacen eventos o catering?',
      answer: 'Sí, ofrecemos servicio de catering para eventos como cumpleaños, bodas, eventos corporativos, etc. Contamos con carros de helados, barras personalizadas y paquetes especiales. Contáctanos con al menos 1 semana de anticipación para cotización.'
    },
    {
      category: 'eventos',
      question: '¿Puedo encargar tortas heladas personalizadas?',
      answer: 'Por supuesto. Hacemos tortas heladas personalizadas con los sabores que prefieras, decoración temática y tamaños desde 1kg hasta 5kg. Se requiere pedido con 48 horas de anticipación mínimo.'
    }
  ];

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'productos', label: 'Productos' },
    { id: 'ingredientes', label: 'Ingredientes' },
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'pagos', label: 'Pagos' },
    { id: 'negocio', label: 'Negocio' },
    { id: 'eventos', label: 'Eventos' }
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-600 to-cyan-700 text-white py-16 md:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04em0wIDI4YzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04em0yOCAwYzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04ek0zNiAwYzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04ek0wIDE0YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6bTAgMjhjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHpNMCAwYzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Preguntas Frecuentes
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Encuentra respuestas rápidas a tus dudas
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-[calc(4rem+1px)] z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-200 border ${
                  selectedCategory === category.id
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-cyan-50 hover:border-cyan-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 hover:border-cyan-300 transition-all duration-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 text-[15px] pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <MdExpandLess className="w-5 h-5 text-cyan-600" />
                    ) : (
                      <MdExpandMore className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>
                
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2">
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">
              No hay preguntas en esta categoría por el momento.
            </p>
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3 text-slate-900">
            ¿No encuentras tu respuesta?
          </h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Nuestro equipo está listo para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/contacto"
              className="inline-flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-semibold text-sm rounded-lg hover:bg-cyan-700 transition-all duration-200 shadow-sm"
            >
              Contáctanos
            </a>
            <a
              href="https://wa.me/59112345678"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold text-sm rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
