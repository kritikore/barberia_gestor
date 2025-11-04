// src/components/TopProducts.tsx
import React from 'react';

const TopProducts: React.FC = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Top 5 Productos Vendidos</h2>
      <p className="text-gray-400">Aquí irá la lista de los productos con mayor cantidad vendida.</p>
    </div>
  );
};

export default TopProducts;