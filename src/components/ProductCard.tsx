// src/components/ProductoCard.tsx

import React from 'react';
import styles from '@/styles/Inventario.module.css';

// 🔑 Importamos los iconos específicos de Font Awesome
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

interface ProductoCardProps {
  producto: {
    id: number;
    nombre: string;
    marca: string;
    stock: number;
    precio: number;
    etiquetas: string[];
    descripcion: string;
  };
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAddStock: (id: number) => void;
}

const ProductoCard: React.FC<ProductoCardProps> = ({ producto, onEdit, onDelete, onAddStock }) => {
  const stockClass = producto.stock <= 2 ? styles.stockBajo : styles.stockNormal;
  const precioFormateado = `$${producto.precio.toFixed(2)}`;

  return (
    <div className={styles.productoCard}>
      
      <div className={styles.header}>
        <div className={styles.nombre}>{producto.nombre}</div>
        <div className={styles.acciones}>
          {/* 🔑 ICONO DE EDITAR (AZUL) */}
          <button className={`${styles.actionButton} ${styles.editIcon}`} onClick={() => onEdit(producto.id)}>
            <FaEdit /> {/* Componente de icono real */}
          </button>
          
          {/* 🔑 ICONO DE ELIMINAR (ROJO) */}
          <button className={`${styles.actionButton} ${styles.deleteIcon}`} onClick={() => onDelete(producto.id)}>
            <FaTrashAlt /> {/* Componente de icono real */}
          </button>
        </div>
      </div>

      <p className={styles.marca}>{producto.marca}</p>

      <div className={styles.etiquetas}>
        <span className={stockClass}>{producto.stock > 0 ? 'En Stock' : 'Sin Stock'}</span>
        {producto.etiquetas.map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>

      <p className={styles.descripcion}>{producto.descripcion}</p>

      <div className={styles.footer}>
        <div className={styles.dato}>
          <span className={styles.label}>Cantidad</span>
          <span className={styles.valor}>{producto.stock}</span>
        </div>
        <div className={styles.dato}>
          <span className={styles.label}>Precio</span>
          <span className={styles.valor}>{precioFormateado}</span>
        </div>
        <button className={styles.agregarButton} onClick={() => onAddStock(producto.id)}>
          + Agregar
        </button>
      </div>

    </div>
  );
};

export default ProductoCard;