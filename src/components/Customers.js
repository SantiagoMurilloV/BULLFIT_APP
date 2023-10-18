import React from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import '../components/styles/Customers.css';

const Customers = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Cerrando sesión', '', 'success');
        navigate('/');
      }
    });
  };

  return (
    <div className="StartScreen-container">
      <div className="profile-content">
        <img
          src={`${process.env.PUBLIC_URL}/Image/Logos/Recurso214.png`}
          alt="Imagen de perfil"
          className="profile-image"
          id="profile-image"
        />
        <span className="profile-text">{user.FullName}</span>
      </div>
      <div className="button-logout" onClick={handleLogout}>
        <img
          src={`${process.env.PUBLIC_URL}/Image/Logos/logout.png`}
          alt="Imagen de salir"
          className="logout-image"
          id="logout-image"
        />
      </div>
      <div className="info-box">
        <h1>Información:</h1>
        <p>Plan: {user.Plan}</p>
        <p>Activo: {user.Active}</p>
      </div>
      <div className="bottom-buttons">
        <div className="button-column">
          <button className="button-icon">
            <Link to="/reservations" className="button-link">
              <img
                src={`${process.env.PUBLIC_URL}/image/logos/calendario.png`}
                alt="Icono de Reservar"
                className="button-icon-image"
              />
              Reservar Clases
            </Link>
          </button>
        </div>
        <div className="button-column">
          <button className="button-icon">
          <Link to="" className="button-link">
            <img
              src={`${process.env.PUBLIC_URL}/image/logos/edit.png`}
              alt="Icono de Modificar"
              className="button-icon-image"
            />
            Modificar Reserva
            </Link>
          </button>
        </div>
      </div>
      <div className="instagram-logo-container">
        <a
          href="https://www.instagram.com/bullfit.axm/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={`${process.env.PUBLIC_URL}/Image/logos/INSTA.png`}
            alt="Logo de Instagram"
            className="instagram-logo"
          />
        </a>
        <a
          href="https://wa.me/573186011559?text=Hola,%20me%20podrias%20brindar%20informacion%20para%20hacer%20parte%20de%20la%20familia%20BULLFIT...!!!"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={`${process.env.PUBLIC_URL}/Image/logos/WHAT.png`}
            alt="Logo de Instagram"
            className="whatsapp-logo"
          />
        </a>
      </div>
    </div>
  );
};

export default Customers;
