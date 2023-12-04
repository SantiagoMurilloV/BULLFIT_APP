import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebaseConfig from './FireBase';
import '../components/styles/Login.css';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const Login = ({ handleLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [image2Loaded, setImage2Loaded] = useState(false);
  const [image3Loaded, setImage3Loaded] = useState(false);
  const [image4Loaded, setImage4Loaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImageUrl = async (imageRef, setLoaded) => {
      try {
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
        setLoaded(true);
      } catch (error) {
        console.error('Error al obtener la URL de descarga de la imagen:', error);
      }
    };

    const imageRef = ref(storage, '213.png');
    fetchImageUrl(imageRef, setImage2Loaded);

    const imageRef2 = ref(storage, '219.png');
    fetchImageUrl(imageRef2, setImageLoaded);

    const imageRef3 = ref(storage, 'insta.png');
    fetchImageUrl(imageRef3, setImage3Loaded);

    const imageRef4 = ref(storage, 'WHAT.png');
    fetchImageUrl(imageRef4, setImage4Loaded);
  }, []);

  const performLogin = () => {
    fetch('https://bullfit-back.onrender.com/api/users')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al obtener la información de los usuarios');
        }
        return response.json();
      })
      .then((users) => {
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
          if (user.Phone === '0000' && user.IdentificationNumber === '12345') {
            navigate(`/admin/${user._id}`);
          } else {
            navigate(`/customers/${user._id}`);
          }
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
          src={image2Loaded || `${process.env.PUBLIC_URL}/Image/logos/213.png`}
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
            src={imageLoaded || `${process.env.PUBLIC_URL}/Image/logos/219.png`}
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
                src={image3Loaded || `${process.env.PUBLIC_URL}/Image/logos/insta.png`}
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
              src={image4Loaded || `${process.env.PUBLIC_URL}/Image/logos/WHAT.png`}
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
