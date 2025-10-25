import MenuContent from '../../components/public/Gallery';

// Página de Menú renovada con:
// - Barra horizontal de categorías (scrollable)
// - Carruseles horizontales por categoría (snap)
// - Tarjetas compactas optimizadas para móviles y kiosko
// - Menor padding lateral en móviles
const Menu = () => {
  return (
    <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-5">
      <MenuContent />
    </div>
  );
};

export default Menu;