import { useState } from 'react';

const ClienteForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    ocupacion: '',
    edad: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos del cliente:', formData);
    // Aquí puedes agregar lógica para enviar los datos a tu backend
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Registrar nuevo cliente</h3>

      <label>Nombre:</label>
      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ display: 'block', marginBottom: '10px' }} />

      <label>Apellido:</label>
      <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required style={{ display: 'block', marginBottom: '10px' }} />

      <label>Teléfono:</label>
      <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required style={{ display: 'block', marginBottom: '10px' }} />

      <label>Ocupación:</label>
      <input type="text" name="ocupacion" value={formData.ocupacion} onChange={handleChange} required style={{ display: 'block', marginBottom: '10px' }} />

      <label>Edad:</label>
      <input type="number" name="edad" value={formData.edad} onChange={handleChange} required style={{ display: 'block', marginBottom: '10px' }} />

      <button type="submit" style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
        Guardar cliente
      </button>
    </form>
  );
};

export default ClienteForm;