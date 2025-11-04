// src/types/index.ts
// Basado en tu tabla PRODUCTO de PostgreSQL
export interface Producto {
    id_prod: number;
    nombre: string;
    marca: string;
    precio: number;
    stock: number;
    etiquetas: string[];
    descripcion: string;
}

// (Puedes añadir más interfaces aquí: Cliente, Barbero, etc.)