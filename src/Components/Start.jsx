import React, { useState } from 'react';
import '../Styles/StartScreen.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';


const StartScreen = ({ user, onLogout , onProfileClick}) => {
  const handleProfileClick = () => {
    window.location.href = '/profile';
    console.log("Haz clic en la imagen de perfil");
  };

  const handleLogoutClick = () => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout(); 
      }
    });
  };


  return (
    <div className="StartScreen-container">
  <div className="profile-content" onClick={onProfileClick}>
    <img
      src={`${process.env.PUBLIC_URL}/Image/Logos/Recurso214.png`}
      alt="Imagen de perfil"
      className="profile-image"
      id="profile-image"
    />
    <span className="profile-text">{user.FullName}</span>
  </div>
      <div className="button-logout">
        <img
          src={`${process.env.PUBLIC_URL}/Image/Logos/logout.png`}
          alt="Imagen de salir"
          className="logout-image"
          id="logout-image"
          onClick={handleLogoutClick}
        />
      </div>
      <div className="info-box">
        <h1>Informacion:</h1>
        <p>Plan: {user.Plan}</p>
        <p>Activo: {user.Active}</p>
      </div>

      <div className="bottom-buttons">
        <div className="button-row">
          <button>Modificar Reserva</button>
        </div>
        <div className="button-row">
          <button>Agendar Clase</button>
        </div>
      </div>
      <img
        src={`${process.env.PUBLIC_URL}/Image/logos/Recurso212.png`}
        alt="logo-bull"
        className="logo-bull"
      />
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

export default StartScreen;
