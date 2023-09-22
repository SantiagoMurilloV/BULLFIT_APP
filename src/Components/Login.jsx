import React, { useState } from 'react';
import '../Styles/Login.css';

function Login({ onLogin, usersData }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    onLogin(phone, password);
  };

  return (
    <div className="Login">
      <div className="center-content">
        <img
          src={`${process.env.PUBLIC_URL}/Image/logos/Recurso213.png`}
          alt="Logo del gimnasio"
          className="logo"
        />
        <div className="user">
          <h1>Usuario</h1>
          <input
            className="user-input"
            placeholder="Número de identificación"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <h1>Contraseña</h1>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="button-container">
          <button onClick={handleLogin}>Iniciar</button>
          <img
            src={`${process.env.PUBLIC_URL}/Image/Logos/Recurso219.png`}
            alt="Imagen encima del botón"
            className="image-over-button"
          />
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
}

export default Login;
