'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import styles from './page.module.css';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Trek Marlin 5', category: 'Bicicletas MTB', price: 2500000, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 2, name: 'Specialized Allez', category: 'Bicicletas Ruta', price: 4200000, image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 3, name: 'Casco Giro Fixture', category: 'Accesorios', price: 280000, image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 4, name: 'Llanta Maxxis Ikon 29', category: 'Repuestos', price: 180000, image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 5, name: 'Luces LED Recargables', category: 'Accesorios', price: 85000, image: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: 6, name: 'Cadena Shimano 11v', category: 'Repuestos', price: 145000, image: 'https://images.unsplash.com/photo-1582200236087-0b5433a0026e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' }
];

export default function Tienda() {
  const { addToCart } = useCart();
  const [filter, setFilter] = useState('Todos');

  const categories = ['Todos', 'Bicicletas MTB', 'Bicicletas Ruta', 'Repuestos', 'Accesorios'];

  const filteredProducts = filter === 'Todos' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === filter);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className={`container ${styles.tiendaContainer}`}>
      <h1 className={styles.title}>Catálogo de Productos</h1>
      
      <div className={styles.filters}>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.productGrid}>
        {filteredProducts.map(product => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.imageContainer}>
              <img src={product.image} alt={product.name} className={styles.productImage} />
            </div>
            <div className={styles.productInfo}>
              <span className={styles.category}>{product.category}</span>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.price}>{formatPrice(product.price)}</p>
              <button 
                className="btn btn-primary" 
                style={{width: '100%'}}
                onClick={() => addToCart(product)}
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
