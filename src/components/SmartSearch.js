import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import styles from './SmartSearch.module.css';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    // Click outside to close
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/store/products?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
          setShowResults(true);
        }
      } catch (err) {
        console.error(err);
      }
      setIsSearching(false);
    };

    const debounce = setTimeout(() => {
      searchProducts();
    }, 400);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    openCart();
    setShowResults(false);
    setQuery('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className={styles.searchWrapper} ref={wrapperRef}>
      <div className={styles.inputContainer}>
        <span className={styles.searchIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="¿Qué estás buscando? Ej: Cadena 12 vel..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowResults(true); }}
        />
        {isSearching && <span className={styles.loadingSpinner}>Buscando...</span>}
      </div>

      {showResults && query.length >= 2 && (
        <div className={styles.resultsContainer}>
          {results.length > 0 ? (
            <div className={styles.resultsList}>
              <div className={styles.resultsHeader}>
                Sugerencias de productos
              </div>
              {results.map(product => {
                const isOutOfStock = (product.stock || 0) <= (product.min_stock_limit || 0);
                return (
                  <div key={product.id} className={`${styles.resultItem} ${isOutOfStock ? styles.outOfStock : ''}`}>
                    <div className={styles.resultImage}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className={styles.imagePlaceholder}>??</div>
                      )}
                    </div>
                    <div className={styles.resultInfo}>
                      <div className={styles.resultName}>{product.name}</div>
                      <div className={styles.resultPrice}>
                        {formatPrice(product.price)}
                        {isOutOfStock && <span className={styles.badge}>Agotado</span>}
                      </div>
                    </div>
                    <div className={styles.resultAction}>
                      {!isOutOfStock ? (
                        <button className={styles.addButton} onClick={(e) => handleAddToCart(e, product)}>
                          +
                        </button>
                      ) : (
                        <button className={styles.whatsappButton} onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://wa.me/573000000000?text=${encodeURIComponent('Hola, quiero encargar: ' + product.name)}`, '_blank');
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.noResults}>
              No encontramos productos que coincidan con "{query}".<br/>
              Intenta con otras palabras.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
