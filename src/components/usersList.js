import React, { useState, useEffect } from 'react';
import {  Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';
import '../components/styles/UserList.css'
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8084/api/users');
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        const data = await response.json();
        setUsers(data);
        setLoading(false);
        const userResponse = await fetch(`http://localhost:8084/api/users/${id}`);
        if (!userResponse.ok) {
          throw new Error('Error en la solicitud de usuario');
        }
        const userData = await userResponse.json();
        setUser(userData);
      } catch (error) {
        console.error(error);
        Swal.fire('Error al cargar los datos', 'Ha ocurrido un error al cargar los datos.', 'error');
      }
    };

    fetchData();
  }, [id]);

  const handleStatusChange = async (userId, Active) => {
    try {
      const updatedUserData = { Active };
      const response = await fetch(`http://localhost:8084/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });
      if (response.ok) {
        const userResponse = await fetch(`http://localhost:8084/api/users/${id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
        Swal.fire('Estado actualizado', 'Se ha actualizado el estado del usuario con éxito.', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Error al actualizar el estado del usuario');
        Swal.fire('Error al actualizar el estado', 'Ha ocurrido un error al actualizar el estado del usuario.', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
      Swal.fire('Error al actualizar el estado', 'Ha ocurrido un error al actualizar el estado del usuario.', 'error');
    }
  };

  return (
    <div>
      <h2>Lista de Usuarios</h2>
      {loading ? (
        <p>Cargando usuarios...</p>
      
      ) : (
          <table className="user-table">
            
          <thead>
          <div><Link to={`/diary/${id}`} className="button-re">
        <button className="button-r">Agenda</button>
      </Link></div>
            <tr>
              <th>Nombre</th>
              <th>Celular</th>
              <th>Cédula</th>
              <th>Plan</th>
              <th>Estado $</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.FirstName + ' ' + user.LastName}</td>
                <td>{user.Phone}</td>
                <td>{user.IdentificationNumber}</td>
                <td>{user.Plan}</td>
                <td>
                  <Select
                    value={{ value: user.Active, label: user.Active }}
                    onChange={(selectedOption) => handleStatusChange(user._id, selectedOption.value)}
                    options={[
                      {value: ' ', label: ' '},
                      { value: 'Sí', label: 'Sí' },
                      { value: 'No', label: 'No' },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;
