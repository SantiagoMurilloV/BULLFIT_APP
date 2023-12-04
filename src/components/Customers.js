import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../components/styles/Customers.css';
import { useToasts } from 'react-toast-notifications';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebaseConfig from './FireBase';


const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const Customers = ({ currentUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser);
  const { id } = useParams();
  const { addToast } = useToasts();
  const today = new Date();
  today.setHours(today.getHours() - 5);
  const formattedDate = today.toISOString().split('T')[0];
  const [reservationsData, setReservationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [imageUrl3, setImageUrl3] = useState('');
  const [imageUrl4, setImageUrl4] = useState('');
  const [imageUrl5, setImageUrl5] = useState('');
  const [imageUrl6, setImageUrl6] = useState('');
  const [imageUrl7, setImageUrl7] = useState('');

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const imageRef = ref(storage, 'profile.png');
        const imageRef2 = ref(storage, 'logOut.png');
        const imageRef3= ref(storage, 'calendario.png');
        const imageRef4 = ref(storage, 'edit.png');
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
      } catch (error) {
        console.error('Error al obtener la URL de descarga de la imagen:', error);
      }
    };

    fetchImageUrl();

    fetch(`https://bullfit-back.onrender.com/api/reservations/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setReservationsData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire('Error al obtener las reservas', 'Ha ocurrido un error al cargar las reservas del usuario.', 'error');
        setLoading(false);
      });

    fetch(`https://bullfit-back.onrender.com/api/users/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire('Error al obtener los datos del usuario', 'Ha ocurrido un error al cargar los datos del usuario.', 'error');
      });

      const showRandomNotification = () => {
        const notifications = [
          {
            title: 'ASEO',
            text: 'Trae toalla. A nadie le gusta el sudor de los demás.',
          },
          {
            title: 'PUNTUALIDAD',
            text: 'Debes llegar al menos 5 minutos antes. 2 Burpees por minuto tarde.',
          },
          {
            title: 'COMPROMISO',
            text: 'Toda reserva se debe pagar, aunque faltes.',
          },
          {
            title: 'RESERVAS',
            text: 'Se deben realizar con dos horas de antelación.',
          },
        ];
  
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
  
        addToast(randomNotification.text, {
          appearance: 'info',
          autoDismiss: true,
          autoDismissTimeout: 10000, 
          placement: 'top-right', 
        });
      };
  
      const intervalId = setInterval(showRandomNotification, 100000); 
  
      return () => clearInterval(intervalId);
  
  },[id, addToast]);

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
    if (user && user.Active === 'Sí') {
      navigate(`/reservations/${user._id}`);
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

  const currentDayReservation = reservationsData.find((reservation) => reservation.day === formattedDate);

  return (
    <div className={`StartScreen-container ${loading ? 'fade-in' : ''}`}>
      <div className={`info-box ${loading ? 'fade-in' : ''}`}>
        <h1>Información:</h1>
        <div className="info-box-d1">
          <h3>Fecha: </h3>
          <p>{formattedDate}</p>
        </div>
        <div className="info-box-d2">
          <h3>Entrenamiento: </h3>
          <p>
            {currentDayReservation ? (
              currentDayReservation.Status !== 'cancelled' && currentDayReservation.TrainingType !== ' ' ? (
                currentDayReservation.TrainingType
              ) : (
                'No Asignado'
              )
            ) : (
              'No hay reservas'
            )}


          </p>
        </div>

        {/* {user && user.Active === 'No'  && user.Active !== null  ? (
          <div className="info-box-d3">
            <h3>Estado: </h3>
            <p>Pago pendiente</p>
          </div>
        ) : (
          <p></p>
        )} */}
      </div>
      <div className={`bottom-buttons ${loading ? 'fade-in' : ''}`}>
        <div className="button-column">
          <button className="button-icon" onClick={handleReserveClasses}>
            {user && user.Active === 'No' && user.Active !== null ? (
              <div className="button-link">
                <img
                  src={imageUrl3 || `${process.env.PUBLIC_URL}/image/logos/calendario.png`}
                  alt="Icono de Reservar"
                  className="button-icon-image"
                />
                <span className="profile-text">Reservar Clase </span>
              </div>
            ) : (
              <Link to={`/reservations/${id}`} className="button-link">
                <img
                  src={imageUrl3 || `${process.env.PUBLIC_URL}/image/logos/calendario.png`}
                  alt="Icono de Reservar"
                  className="button-icon-image"
                />
                <span className="profile-text">Reservar Clase </span>
              </Link>
            )}
          </button>
        </div>
        <div className="button-column">
          <button className="button-icon" >
            {user && user.Active === 'No' && user.Active !== null ? (
              <div className="button-link">
                <img
                  src={imageUrl4 || `${process.env.PUBLIC_URL}/image/logos/edit.png`}
                  alt="Icono de Reservar"
                  className="button-icon-image"
                />
                <span className="profile-text">Modificar Reserva </span>
              </div>
            ) : (
              <Link to={`/EditReservation/${id}`} className="button-link">
                <img
                  src={imageUrl4 || `${process.env.PUBLIC_URL}/image/logos/edit.png`}
                  alt="Icono de Reservar"
                  className="button-icon-image"
                />
                <span className="profile-text">Modificar Reserva </span>
              </Link>
            )}
          </button>
        </div>

        <div className="button-column">
          <button className="button-icon">
            <Link to={`/profile/${id}`} className="button-link">
              <img
                src={imageUrl || `${process.env.PUBLIC_URL}/Image/Logos/profile.png`}
                alt="Imagen de perfil"
                className="profile-image"
                id="profile-image"
              />
            </Link>
            <span className="profile-text">{user ? user.FirstName + user.LastName : 'N/A'}</span>
          </button>
        </div>

        <div className="button-column">
          <button className="button-icon" onClick={handleLogout} >
            <img
              src={imageUrl2 || `${process.env.PUBLIC_URL}/Image/Logos/logOut.png`}
              alt="Imagen de salir"
              className="logout"
              id="logout-image"
            />
            <span className="profile-text">Salir</span>
          </button>
        </div>
      </div>
      <div className="header">
        <img
          src={imageUrl5 || `${process.env.PUBLIC_URL}/Image/Logos/Recurso203.png`}
          alt="Imagen de perfil"
          className="header"
          id="profile-image"
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
              src={imageUrl6 ||`${process.env.PUBLIC_URL}/Image/logos/insta.png`}
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
            src={imageUrl7 || `${process.env.PUBLIC_URL}/Image/logos/WHAT.png`}
            alt="Logo de Instagram"
            className="whatsapp-logo-customers"
          />
        </a>
      </div>
    </div>
  );
};

export default Customers;



