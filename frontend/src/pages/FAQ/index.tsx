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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
              Preguntas Frecuentes
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
              Encuentra respuestas rápidas a las dudas más comunes sobre nuestros productos y servicios
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-16 z-20 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border-2 border-slate-200 hover:border-cyan-300 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-base sm:text-lg pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <MdExpandLess className="w-6 h-6 text-cyan-600" />
                    ) : (
                      <MdExpandMore className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </button>
                
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2">
                    <div className="border-t-2 border-slate-100 pt-4">
                      <p className="text-slate-600 leading-relaxed">
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
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            ¿No encuentras tu respuesta?
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Nuestro equipo está listo para ayudarte con cualquier consulta adicional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Contáctanos
            </a>
            <a
              href="https://wa.me/59112345678"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
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
