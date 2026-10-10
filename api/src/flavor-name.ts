// Mantener este criterio alineado con la migracion product_flavor_relation.
// No corregir erratas automaticamente: "Vanila" y "Vainilla" pueden ser recetas distintas.
export function normalizeFlavorName(value: string) {
  const name = value.replace(/[ \t\n\r\f\v]+/g, ' ').replace(/^ +| +$/g, '');
  return { name, key: name.toLowerCase() };
}
