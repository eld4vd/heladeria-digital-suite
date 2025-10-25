import { NavLink } from "react-router-dom";
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaTiktok, 
  FaWhatsapp,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer
      role="contentinfo"
      aria-label="Pie de página"
      className="relative bg-slate-900 text-white py-20 overflow-hidden"
      style={{ contain: "layout" }}
    >
      {/* Decoración superior simplificada */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-600" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Columna 1: Marca */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-3xl font-bold tracking-tight text-white">
                Heladería Delicias
              </h3>
              <p className="text-base leading-relaxed text-slate-300">
                Disfruta de los mejores helados artesanales hechos con amor y los
                ingredientes más frescos. ¡Visítanos y endulza tu día!
              </p>
            </div>
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-cyan-600/10 border border-cyan-500/30">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
                Artesanal & Fresco
              </span>
            </div>
          </div>

          {/* Columna 2: Enlaces */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1 w-8 bg-cyan-500 rounded" />
              Enlaces Rápidos
            </h3>
            <ul className="space-y-4 text-base">
              <li>
                <NavLink
                  to="/menu"
                  className="group inline-flex items-center gap-3 text-slate-300 transition-all hover:text-cyan-400 hover:translate-x-1"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all group-hover:bg-slate-700 group-hover:border-cyan-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </span>
                  Menú
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/"
                  className="group inline-flex items-center gap-3 text-slate-300 transition-all hover:text-cyan-400 hover:translate-x-1"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all group-hover:bg-slate-700 group-hover:border-cyan-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </span>
                  Sobre Nosotros
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contacto"
                  className="group inline-flex items-center gap-3 text-slate-300 transition-all hover:text-cyan-400 hover:translate-x-1"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all group-hover:bg-slate-700 group-hover:border-cyan-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </span>
                  Contacto
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/promos"
                  className="group inline-flex items-center gap-3 text-slate-300 transition-all hover:text-cyan-400 hover:translate-x-1"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all group-hover:bg-slate-700 group-hover:border-cyan-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </span>
                  Promociones
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-1 w-8 bg-cyan-500 rounded" />
              Contáctanos
            </h3>
            <div className="space-y-4 text-base text-slate-300">
              <a href="#" className="group flex items-start gap-4 transition-all hover:translate-x-1">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all group-hover:bg-slate-700 group-hover:border-cyan-500">
                  <FaMapMarkerAlt className="h-5 w-5 text-cyan-400" />
                </div>
                <span className="group-hover:text-cyan-300 transition-colors">Av. Dulce Sabor 123, Ciudad</span>
              </a>
              <a href="tel:+1234567890" className="group flex items-center gap-4 transition-all hover:translate-x-1">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all group-hover:bg-slate-700 group-hover:border-cyan-500">
                  <FaPhoneAlt className="h-5 w-5 text-cyan-400" />
                </div>
                <span className="group-hover:text-cyan-300 transition-colors">+123 456 7890</span>
              </a>
              <a href="mailto:info@heladeriadelicias.com" className="group flex items-center gap-4 transition-all hover:translate-x-1">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all group-hover:bg-slate-700 group-hover:border-cyan-500">
                  <FaEnvelope className="h-5 w-5 text-cyan-400" />
                </div>
                <span className="group-hover:text-cyan-300 transition-colors">info@heladeriadelicias.com</span>
              </a>
            </div>
            
            {/* Redes sociales con react-icons */}
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Síguenos</h4>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all hover:bg-blue-600 hover:border-blue-600 hover:scale-110"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="w-5 h-5 text-slate-300" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all hover:bg-pink-600 hover:border-pink-600 hover:scale-110"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-5 h-5 text-slate-300" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all hover:bg-sky-500 hover:border-sky-500 hover:scale-110"
                  aria-label="Twitter"
                >
                  <FaTwitter className="w-5 h-5 text-slate-300" />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all hover:bg-slate-950 hover:border-slate-950 hover:scale-110"
                  aria-label="TikTok"
                >
                  <FaTiktok className="w-5 h-5 text-slate-300" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all hover:bg-red-600 hover:border-red-600 hover:scale-110"
                  aria-label="YouTube"
                >
                  <FaYoutube className="w-5 h-5 text-slate-300" />
                </a>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-all hover:bg-green-600 hover:border-green-600 hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="w-5 h-5 text-slate-300" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-10 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-base text-slate-400">
            <p className="flex items-center gap-2">
              <span>&copy; {new Date().getFullYear()}</span>
              <span className="font-bold text-white">
                Heladería Delicias
              </span>
              <span>·</span>
              <span>Todos los derechos reservados.</span>
            </p>
            <p className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="text-slate-500">Desarrollado por</span>
              <span className="font-bold text-cyan-400">
                ELd4vd
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
