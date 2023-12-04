import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../components/styles/Admin.css';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../FireBase'
import { BarLoader } from 'react-spinners';


const app = initializeApp(firebaseConfig);
const storage = getStorage(app);




const Admin = ({ currentUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [imageUrl3, setImageUrl3] = useState('');
  const [imageUrl4, setImageUrl4] = useState('');
  const [imageUrl5, setImageUrl5] = useState('');
  const [imageUrl6, setImageUrl6] = useState('');
  const [imageUrl7, setImageUrl7] = useState('');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);




  useEffect(() => {

    const fetchImageUrl = async () => {
      try {
        const imageRef = ref(storage, 'finanzas.png');
        const imageRef2 = ref(storage, 'logOut.png');
        const imageRef3= ref(storage, 'agenda.png');
        const imageRef4 = ref(storage, 'new-user.png');
        const imageRef5= ref(storage, 'Recurso203.png');
        const imageRef6 = ref(storage, 'insta.png');
        const imageRef7 = ref(storage, 'WHAT.png');

        const url = await getDownloadURL(imageRef);
        const url2 = await getDownloadURL(imageRef2);
        const url3 = await getDownloadURL(imageRef3);
        const url4 = await getDownloadURL(imageRef4);
        const url5 = await getDownloadURL(imageRef5);
        const url6 = await getDownloadURL(imageRef6);
        const url7 = await getDownloadURL(imageRef7);
        setImageUrl(url);
        setImageUrl2(url2);

        setImageUrl3(url3);
        setImageUrl4(url4);
        
        setImageUrl5(url5);
        setImageUrl6(url6);
        setImageUrl7(url7);
        setImagesLoaded(true);
        setTimeout(() => {
          setFormLoaded(true);
        }, 1290);
      } catch (error) {
        console.error('Error al obtener la URL de descarga de la imagen:', error);
      }
    };

    fetchImageUrl();

    fetch(`https://bullfit-back.onrender.com/api/users/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire('Error al obtener los datos del usuario', 'Ha ocurrido un error al cargar los datos del usuario.', 'error');
        setLoading(false);
      });
  }, [id]);

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
        setUser(null);
        navigate('/');
      }
    });
  };

  const handleReserveClasses = () => {
    if (user) {
      navigate(`/registerUsers/${user._id}`);
    } else if (user) {
      Swal.fire({
        title: 'Usuario no activo',
        text: 'Debes hacer efectivo el pago para poder reservar clases.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    } else {
      Swal.fire('Cargando usuario', 'Por favor, espera mientras se cargan los datos del usuario.', 'info');
    }
  };
  if (!imagesLoaded) {
    return (
      <div className="loading-screen">
        <BarLoader color="#00BFFF" loading={!imagesLoaded} height={4} width={200} />
      </div>
    );
  }

  return (
    <div className={`StartScreen-container ${loading ? 'fade-in' : 'fade-out'}`}>
      <div className={`button-logout ${loading ? 'fade-in' : 'fade-out'}`}>

      </div>

      <div className={`bottom-buttons ${loading ? 'fade-in' : 'fade-out'}`}>

        <div className="button-column">
          <button className="button-icon" onClick={handleReserveClasses}>
            <Link to={`/reservations/${id}`} className="button-link">
              <img
                src={imageUrl4}
                alt=""
                className="button-icon-image"
              />
            </Link>
            Registrar Usuario
          </button>
        </div>
        <div className="button-column">
          <button className="button-icon">
            <Link className="button-link">
              <img
                src={imageUrl}
                alt=""
                className="button-icon-image"
              />
            </Link>
            Finanzas
          </button>
        </div>

        <div className="button-column">
          <button className="button-icon">
            <Link to={`/diary/${id}`} className="button-link">
              <img
                src={imageUrl3}
                alt=""
                className="user-image"
                id="profile-image"
              />

            </Link>
            Agenda y Usuarios
          </button>
        </div>

        <div className="button-column">
          <button className="button-icon" onClick={handleLogout} >
            <img
              src={imageUrl2}
              alt=""
              className="logout"
              id="logout-image"
            />
            <span className="profile-text">Salir</span>
          </button>
        </div>
      </div>
      <div className={`header- ${loading ? 'fade-in' : 'fade-out'}`}>
        <img
          src={imageUrl5}
          alt=""
          className="header"
          id="profile-image"
        />
      </div>
      <div className={`instagram-logo-container ${loading ? 'fade-in' : 'fade-out'}`}>
        <div>
          <a
            href="https://www.instagram.com/bullfit.axm/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={imageUrl6}
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
            src={imageUrl7}
            alt=""
            className="whatsapp-logo-customers"
          />
        </a>
      </div>
    </div>
  );
};

export default Admin;