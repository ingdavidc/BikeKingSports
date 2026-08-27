
const fs = require('fs');
let code = fs.readFileSync('src/app/tienda/page.js', 'utf8');

code = code.replace(
  'import { useState, useEffect } from \'react\';',
  'import { useState, useEffect, Suspense } from \'react\';\nimport { useSearchParams } from \'next/navigation\';'
);

code = code.replace(
  'export default function Tienda() {',
  'function TiendaContent() {\n  const searchParams = useSearchParams();'
);

const oldSearchBlock = \    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('ofertas') === 'true') {
        setFilter('Ofertas');
      } else if (params.get('categoria')) {
        const catParam = params.get('categoria');
        // Find matching category case-insensitively
        const MAIN_CATEGORIES = ['Bicicletas', 'Componentes', 'Accesorios', 'Ropa', 'Gym'];
        const matched = MAIN_CATEGORIES.find(c => c.toLowerCase() === catParam.toLowerCase());
        if (matched) {
          setFilter(matched);
        }
      }
    }\;

const newSearchBlock = \    if (searchParams.get('ofertas') === 'true') {
      setFilter('Ofertas');
    } else if (searchParams.get('categoria')) {
      const catParam = searchParams.get('categoria');
      const MAIN_CATEGORIES = ['Bicicletas', 'Componentes', 'Accesorios', 'Ropa', 'Gym'];
      const matched = MAIN_CATEGORIES.find(c => c.toLowerCase() === catParam.toLowerCase());
      if (matched) setFilter(matched);
      else setFilter('Todos');
    } else {
      setFilter('Todos');
    }\;

code = code.replace(oldSearchBlock, newSearchBlock);

code = code.replace(
  'fetchProducts();\n    }, []);',
  'fetchProducts();\n    }, [searchParams]);'
);

code += '\nexport default function Tienda() {\n  return (\n    <Suspense fallback={<div style={{ textAlign: \'center\', padding: \'50px\' }}>Cargando catálogo...</div>}>\n      <TiendaContent />\n    </Suspense>\n  );\n}\n';

fs.writeFileSync('src/app/tienda/page.js', code);
console.log('Done');

