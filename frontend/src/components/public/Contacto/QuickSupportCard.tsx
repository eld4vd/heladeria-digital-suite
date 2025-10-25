import { MdHeadsetMic, MdVideoCall, MdPhone, MdEmail } from 'react-icons/md';

function QuickSupportCard() {
  return (
    <section
      aria-labelledby="soporte-heading"
      className="space-y-5 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-700 text-white p-6 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <MdHeadsetMic className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 id="soporte-heading" className="text-xl font-bold">
          Atención personalizada
        </h2>
      </div>
      <p className="text-sm text-white/95 leading-relaxed">
        ¿Necesitas hablar con un especialista? Respondemos en menos de 2 horas hábiles.
      </p>
      <div className="space-y-3 text-sm font-semibold">
        <a
          className="flex items-center gap-3 rounded-lg bg-white/15 px-4 py-3 transition-all hover:bg-white/25 hover:scale-[1.02]"
          href="tel:+59177712345"
        >
          <MdPhone className="h-5 w-5" />
          <span>(+591) 777-12345</span>
        </a>
        <a
          className="flex items-center gap-3 rounded-lg bg-white/15 px-4 py-3 transition-all hover:bg-white/25 hover:scale-[1.02]"
          href="mailto:relaciones@heladeria-simple.com?subject=Soporte%20personalizado"
        >
          <MdEmail className="h-5 w-5" />
          <span>relaciones@heladeria-simple.com</span>
        </a>
      </div>
      <div className="flex items-start gap-3 rounded-lg bg-white/10 backdrop-blur-sm px-4 py-3 text-sm text-white/90">
        <MdVideoCall className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
        <p>
          Agenda una videollamada en{' '}
          <a
            className="underline hover:text-white font-semibold transition-colors"
            href="https://calendly.com/heladeria-simple/asesoria"
            target="_blank"
            rel="noopener noreferrer"
          >
            nuestro calendario
          </a>
        </p>
      </div>
    </section>
  );
}

export default QuickSupportCard;
