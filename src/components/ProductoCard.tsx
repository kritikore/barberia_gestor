// src/components/ProductoCard.tsx
import React from 'react';
import styles from '@/styles/Inventario.module.css'; 
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Producto } from '@/types/index'; // 🔑 Importamos la interfaz central

// 🔑 Actualizamos las props para que solo sean funciones
interface ProductoCardProps {
  producto: Producto;
  onEdit: () => void;
  onDelete: () => void;
  onAddStock: () => void;
}

const ProductoCard: React.FC<ProductoCardProps> = ({ producto, onEdit, onDelete, onAddStock }) => {
  const stockClass = producto.stock <= 10 ? (producto.stock === 0 ? styles.sinStock : styles.stockBajo) : styles.stockNormal;
  const precioFormateado = `$${producto.precio.toFixed(2)}`;

  return (
    <div className={styles.productoCard}>
      
      <div className={styles.header}>
        <div className={styles.nombre}>{producto.nombre}</div>
        <div className={styles.acciones}>
          {/* 🔑 Llama a las props directamente */}
          <button className={`${styles.actionButton} ${styles.editIcon}`} onClick={onEdit}>
            <FaEdit />
          </button>
          <button className={`${styles.actionButton} ${styles.deleteIcon}`} onClick={onDelete}>
            <FaTrashAlt />
          </button>
        </div>
      </div>

      <p className={styles.marca}>{producto.marca}</p>

      <div className={styles.etiquetas}>
        <span className={`${styles.tag} ${stockClass}`}>
          {producto.stock === 0 ? 'Sin Stock' : (producto.stock <= 10 ? 'Stock Bajo' : 'En Stock')}
        </span>
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
        {/* 🔑 Llama a la prop directamente */}
        <button className={styles.agregarButton} onClick={onAddStock}>
          + Agregar
        </button>
      </div>

    </div>
  );
};

export default ProductoCard;