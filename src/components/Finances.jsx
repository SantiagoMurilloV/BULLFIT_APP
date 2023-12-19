import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { environment } from '../environments';

const Finances = () => {
  const [usersFinances, setUsersFinances] = useState([]);
  const { id } = useParams();
  useEffect(() => {
    fetchUsersFinances();
    const intervalId = setInterval(fetchUsersFinances, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchUsersFinances = () => {
  };
  const calculateFinances = async () => {
    try {
      const response = await fetch('http://localhost:PORT/api/calculate-finances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Incluye aquí otros headers necesarios, como tokens de autenticación si es requerido
        }
      });
  
      if (!response.ok) {
        throw new Error('Hubo un problema al calcular las finanzas');
      }
  
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <div className="finance-screen">
      <h1>Finanzas</h1>
      <button onClick={calculateFinances}>Calcular Finanzas</button>
      <div className="users-finances-list">
        {/* Listado de finanzas de los usuarios aquí */}
        {usersFinances.map((userFinance) => (
          <div key={userFinance.userId} className="user-finance">
            <p>Nombre: {userFinance.userName}</p>
            <p>Plan: {userFinance.plan}</p>
            {/* Lógica para mostrar fechas de inicio y fin si es plan mensual */}
            {/* Lógica para mostrar el total calculado */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Finances;
