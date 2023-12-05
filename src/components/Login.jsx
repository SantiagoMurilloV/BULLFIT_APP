import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { BarLoader } from 'react-spinners';
import firebaseConfig from '../FireBase';
import '../components/styles/Login.css';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const Login = ({ handleLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [imageUrl3, setImageUrl3] = useState('');
  const [imageUrl4, setImageUrl4] = useState('');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);
  const [isReadyForInstall, setIsReadyForInstall] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (event) => {
      // Prevent the mini-infobar from appearing on mobile.
      event.preventDefault();
      console.log("👍", "beforeinstallprompt", event);
      // Stash the event so it can be triggered later.
      window.deferredPrompt = event;
      // Remove the 'hidden' class from the install button container.
      setIsReadyForInstall(true);
    });
    const fetchImageUrl = async () => {
      try {
        const imageRef = ref(storage, '219.png');
        const imageRef2 = ref(storage, '213.png');
        const imageRef3 = ref(storage, 'insta.png');
        const imageRef4 = ref(storage, 'WHAT.png');
        const url = await getDownloadURL(imageRef);
        const url2 = await getDownloadURL(imageRef2);
        const url3 = await getDownloadURL(imageRef3);
        const url4 = await getDownloadURL(imageRef4);
        setImageUrl(url);
        setImageUrl2(url2);
        setImageUrl3(url3);
        setImageUrl4(url4);
        setImagesLoaded(true);
        setTimeout(() => {
          setFormLoaded(true);
        }, 100);
      } catch (error) {
        console.error('Error al obtener la URL de descarga de la imagen:', error);
      }
    };

    fetchImageUrl();
  }, [storage]);

  if (!imagesLoaded) {
    return (
      <div className="loading-screen">
        <BarLoader color="#00BFFF" loading={!imagesLoaded} height={4} width={200} />
      </div>
    );
  }

  async function downloadApp() {
    console.log("👍", "butInstall-clicked");
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) {
      // The deferred prompt isn't available.
      console.log("oops, no prompt event guardado en window");
      return;
    }
    // Show the install prompt.
    promptEvent.prompt();
    // Log the result
    const result = await promptEvent.userChoice;
    console.log("👍", "userChoice", result);
    // Reset the deferred prompt variable, since
    // prompt() can only be called once.
    window.deferredPrompt = null;
    // Hide the install button.
    setIsReadyForInstall(false);
  }

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
        <div className='App'>
        <header>
          {isReadyForInstall && <button onClick={downloadApp}>Descargar</button>}
        </header>
        </div>
        <img
          src={imageUrl2}
          alt="Logo del gimnasio"
          className="logo"
        />
        {formLoaded && (
          <>
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
                src={imageUrl}
                alt=""
                className="image-over-button"
              />
            </div>
          </>
        )}
        <div className="instagram-logo-container">
          <div>
            <a
              href="https://www.instagram.com/bullfit.axm/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={imageUrl3}
                alt=""
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
              src={imageUrl4}
              alt=""
              className="whatsapp-logo-customers"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;

