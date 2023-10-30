import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Login.css';

const Login = ({ handleLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const performLogin = () => {
    fetch('http://localhost:8084/api/users')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al obtener la información de los usuarios');
        }
        return response.json();
      })
      .then((users) => {
        console.log(users);

        const user = users.find(
          (userData) => userData.Phone === phone && userData.IdentificationNumber === password
        );

        if (user) {
          Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            text: '¡Bienvenido!',
          });
          localStorage.setItem('user', JSON.stringify(user));
          handleLogin(user);
          navigate(`/customers/${user._id}`);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: 'Las credenciales son incorrectas. Por favor, inténtalo de nuevo.',
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
        });
      });
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
            placeholder="Número de celular"
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
          <button type="button" onClick={performLogin}>
            Iniciar
          </button>
          <img
            src={`${process.env.PUBLIC_URL}/Image/Logos/Recurso219.png`}
            alt="Imagen encima del botón"
            className="image-over-button"
          />
        </div>
        <div className="instagram-logo-container">
      <div>
      <a
          href="https://www.instagram.com/bullfit.axm/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={`${process.env.PUBLIC_URL}/Image/logos/insta.png`}
            alt="Logo de Instagram"
            className="instagram-logo-customers"
          />
        </a>
        </div>
        <a
          href="https://wa.me/573186011559?text=Hola,%20me%20podrias%20brindar%20informacion%20para%20hacer%20parte%20de%20la%20familia%20BULLFIT...!!!"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={`${process.env.PUBLIC_URL}/Image/logos/WHAT.png`}
            alt="Logo de Instagram"
            className="whatsapp-logo-customers"
          />
        </a>

      </div>
      </div>
    </div>
  );
};

export default Login;
