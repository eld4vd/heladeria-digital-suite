import type { ReactNode } from "react";
import { MdPhone, MdEmail, MdLocationOn, MdAccessTime } from "react-icons/md";

const baseCard =
  "group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col gap-4";

type InfoCardProps = {
  icon: ReactNode;
  title: string;
  lines: string[];
  accent: string;
  accentSoft: string;
  textAccent: string;
};

const cards: InfoCardProps[] = [
  {
    icon: <MdPhone className="w-5 h-5" />,
    title: "Teléfonos",
    lines: ["(+591) 777-12345", "(+591) 764-98765"],
    accent: "bg-indigo-600",
    accentSoft: "bg-indigo-600/10",
    textAccent: "text-indigo-700",
  },
  {
    icon: <MdEmail className="w-5 h-5" />,
    title: "Correo",
    lines: ["hola@heladeria-simple.com", "ventas@heladeria-simple.com"],
    accent: "bg-cyan-600",
    accentSoft: "bg-cyan-600/10",
    textAccent: "text-cyan-700",
  },
  {
    icon: <MdLocationOn className="w-5 h-5" />,
    title: "Dirección",
    lines: ["Plaza 25 de Mayo #123", "Zona Centro, Sucre"],
    accent: "bg-sky-600",
    accentSoft: "bg-sky-600/10",
    textAccent: "text-sky-700",
  },
  {
    icon: <MdAccessTime className="w-5 h-5" />,
    title: "Horarios",
    lines: ["Lun - Sab: 10:00 - 21:30", "Dom: 11:00 - 20:00"],
    accent: "bg-emerald-600",
    accentSoft: "bg-emerald-600/10",
    textAccent: "text-emerald-700",
  },
];

function ContactInfoCards() {
  return (
    <section
      aria-labelledby="contact-info-heading"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <h2 id="contact-info-heading" className="sr-only">
        Información de contacto
      </h2>
      {cards.map((card) => (
        <InfoCard key={card.title} {...card} />
      ))}
    </section>
  );
}

function InfoCard({ icon, title, lines, accent, textAccent }: InfoCardProps) {
  return (
    <div className={baseCard}>
      <div className="relative flex items-center gap-3">
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${accent} text-white shadow-md`}> 
          {icon}
        </div>
        <h3 className={`text-base font-bold ${textAccent}`}>
          {title}
        </h3>
      </div>
      <ul className="relative text-sm font-medium text-gray-700 space-y-2">
        {lines.map((line) => (
          <li key={line} className="flex items-start gap-2">
            <span className="text-cyan-500 mt-1">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContactInfoCards;
