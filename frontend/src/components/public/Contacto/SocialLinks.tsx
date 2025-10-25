import { SiGoogle, SiInstagram, SiWhatsapp, SiFacebook } from 'react-icons/si';
const social = [
  { name: 'Instagram', href: 'https://www.instagram.com/heladeriasimple', icon: <SiInstagram className="w-4 h-4" />, bg: 'bg-rose-600', hover: 'hover:bg-rose-700', label: 'Abrir Instagram en una pestaña nueva' },
  { name: 'Facebook', href: 'https://www.facebook.com/heladeriasimple', icon: <SiFacebook className="w-4 h-4" />, bg: 'bg-blue-600', hover: 'hover:bg-blue-700', label: 'Abrir Facebook en una pestaña nueva' },
  { name: 'WhatsApp', href: 'https://wa.me/59177712345', icon: <SiWhatsapp className="w-4 h-4" />, bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', label: 'Chatear con nosotros por WhatsApp' },
  { name: 'Sitio', href: 'https://heladeria-simple.com', icon: <SiGoogle className="w-4 h-4" />, bg: 'bg-cyan-600', hover: 'hover:bg-cyan-700', label: 'Visitar nuestro sitio corporativo' },
];

function SocialLinks() {
  return (
    <section aria-labelledby="siguenos-heading" className="space-y-3">
      <h2 id="siguenos-heading" className="text-lg font-bold text-gray-900">Síguenos</h2>
      <ul className="flex flex-wrap gap-2">
        {social.map(s => (
          <li key={s.name}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white ${s.bg} ${s.hover} shadow-sm hover:shadow-md transition-all duration-200`}
              aria-label={s.label}
            >
              {s.icon}
              <span>{s.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SocialLinks;
