import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useParams, useNavigate } from 'react-router-dom'; 
import '../components/styles/RegisterUser.css';

const RegisterUsers = () => {
  const [userData, setUserData] = useState({
    FirstName: '',
    LastName: '',
    Phone: '',
    IdentificationNumber: '',
    Active: 'Sí',
    Plan: 'Semanal',
  });
  const { id } = useParams();
  const navigate = useNavigate(); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = () => {

    if (
      userData.FirstName &&
      userData.LastName &&
      userData.Phone &&
      userData.IdentificationNumber &&
      userData.Active &&
      userData.Plan
    ) {
      fetch('http://localhost:8084/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
        .then((response) => {
          if (response.ok) {
            return Swal.fire({
              icon: 'success',
              title: 'Registro exitoso',
              text: 'El usuario ha sido registrado correctamente.',
              showCancelButton: true,
              confirmButtonText: 'Registrar otro',
              cancelButtonText: 'Salir',
            }).then((result) => {
              if (result.isConfirmed) {

                setUserData({
                  FirstName: '',
                  LastName: '',
                  Phone: '',
                  IdentificationNumber: '',
                  Active: '',
                  Plan: '',
                });
              } else {
                navigate(`/admin/${id}`);
              }
            });
          } else {
            console.error('Error al registrar el usuario');
          }
        })
        .catch((error) => {
          console.error('Error al realizar la solicitud POST:', error);
        });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, complete todos los campos del formulario.',
      });
    }
  };
  return (
    <div className="RegisterUsers-container">
      <h2>Registrar Usuario</h2>
      <form className="RegisterUsers-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="FirstName"
              value={userData.FirstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Apellido:</label>
            <input
              type="text"
              name="LastName"
              value={userData.LastName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Número de Celular:</label>
            <input
              type="text"
              name="Phone"
              value={userData.Phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Cedula :</label>
            <input
              type="text"
              name="IdentificationNumber"
              value={userData.IdentificationNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Esta Activo ?:</label>
            <select
              name="Active"
              value={userData.Active}
              onChange={handleInputChange}
            >
              <option value=" "> </option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Plan:</label>
            <select
              name="Plan"
              value={userData.Plan}
              onChange={handleInputChange}
            >
               <option value=" "> </option>
              <option value="Semanal">Semanal</option>
              <option value="Mensual">Mensual</option>
            </select>
          </div>
        </div>
        <div className="form-row">
        </div>
        <button type="button" onClick={handleSubmit}>
          Registrar
        </button>
        <div className="profile-buttons">
          <Link to={`/admin/${id}`} className="button-link">
            <img
              src={`${process.env.PUBLIC_URL}/image/logos/logOut.png`}
              alt="Botón de Regresar"
              className="profile-button-image"
            />
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterUsers;
