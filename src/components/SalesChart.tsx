// src/components/SalesChart.tsx
import React from 'react';

const SalesChart: React.FC = () => {
  return (
    // Altura adecuada para un gráfico y un estilo de contenedor interno más sutil
    <div className="h-96 w-full flex items-center justify-center text-gray-500 border border-dashed border-gray-700 rounded-lg">
      <p>ÁREA PARA GRÁFICO: Se conectará a las tablas SERVICIO_REALIZADO y VENTA.</p>
    </div>
  );
};

export default SalesChart;