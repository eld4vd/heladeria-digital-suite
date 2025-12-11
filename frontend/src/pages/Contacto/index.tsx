import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ContactInfoCards from '../../components/public/Contacto/ContactInfoCards';
import ContactForm from '../../components/public/Contacto/ContactForm';
import LocationMap from '../../components/public/Contacto/LocationMap';
import SocialLinks from '../../components/public/Contacto/SocialLinks';
import FAQMini from '../../components/public/Contacto/FAQMini';
import QuickSupportCard from '../../components/public/Contacto/QuickSupportCard';

const Contacto = () => {
  const [searchParams] = useSearchParams();
  const promoId = searchParams.get('promo');

  const { initialType, initialMessage } = useMemo(() => {
    if (!promoId) {
      return { initialType: undefined, initialMessage: undefined };
    }

    return {
      initialType: 'pedido',
      initialMessage: `Hola, me interesa la promoción #${promoId}. ¿Podrían enviarme más detalles?`,
    };
  }, [promoId]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-600 to-cyan-700 text-white py-16 md:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04em0wIDI4YzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04em0yOCAwYzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04ek0zNiAwYzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04ek0wIDE0YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6bTAgMjhjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHpNMCAwYzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            ¿Cómo podemos ayudarte?
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Estamos aquí para conversar contigo
          </p>
        </div>
      </section>

      {/* Info Cards - Ahora más destacadas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <ContactInfoCards />
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Envíanos un mensaje</h2>
              <p className="text-sm text-slate-600 max-w-2xl">
                Completa el formulario y nos pondremos en contacto contigo
              </p>
            </div>
            <ContactForm initialType={initialType} initialMessage={initialMessage} />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <QuickSupportCard />
            <LocationMap />
            <FAQMini />
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;