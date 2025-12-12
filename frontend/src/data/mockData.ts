// src/data/mockData.ts
export const mockProductos = [
  {
    id: 1,
    nombre: "Helado de Vainilla",
    descripcion: "Cremoso helado de vainilla natural",
    precio: 15,
    stock: 50,
    imagen: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
    categoria: { id: 1, nombre: "Clásicos" }
  },
  {
    id: 2,
    nombre: "Helado de Chocolate",
    descripcion: "Intenso sabor a chocolate belga",
    precio: 18,
    stock: 45,
    imagen: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
    categoria: { id: 1, nombre: "Clásicos" }
  },
  {
    id: 3,
    nombre: "Helado de Fresa",
    descripcion: "Refrescante helado de fresa natural",
    precio: 16,
    stock: 40,
    imagen: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400",
    categoria: { id: 2, nombre: "Frutales" }
  }
];

export const mockCategorias = [
  { id: 1, nombre: "Clásicos", descripcion: "Sabores tradicionales" },
  { id: 2, nombre: "Frutales", descripcion: "Sabores de frutas naturales" },
  { id: 3, nombre: "Especiales", descripcion: "Combinaciones únicas" }
];
