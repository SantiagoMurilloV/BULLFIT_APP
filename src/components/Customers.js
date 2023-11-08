import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../components/styles/Customers.css';

const Customers = ({ currentUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser);
  const { id } = useParams();
  const today = new Date();
  today.setHours(today.getHours() - 5);
  const formattedDate = today.toISOString().split('T')[0];
  const [reservationsData, setReservationsData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch(`http://localhost:8084/api/reservations/${id}`)
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

    fetch(`http://localhost:8084/api/users/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        console.log('Datos del usuario:', data);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire('Error al obtener los datos del usuario', 'Ha ocurrido un error al cargar los datos del usuario.', 'error');
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
          <p>{currentDayReservation ? currentDayReservation.TrainingType : 'No tienes Entrenamiento asignado'}</p>
        </div>
      </div>
      <div className={`bottom-buttons ${loading ? 'fade-in' : ''}`}>
        <div className="button-column">
          <button className="button-icon" onClick={handleReserveClasses}>
            <Link to={`/reservations/${id}`} className="button-link">
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
            <Link to={`/EditReservation/${id}`} className="button-link">
              <img
                src={`${process.env.PUBLIC_URL}/image/logos/edit.png`}
                alt="Icono de Modificar"
                className="button-icon-image"
              />
              Modificar Reserva
            </Link>
          </button>
        </div>

        <div className="button-column">
          <button className="button-icon">
            <Link to={`/profile/${id}`} className="button-link">
              <img
                src={`${process.env.PUBLIC_URL}/Image/Logos/profile.png`}
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
              src={`${process.env.PUBLIC_URL}/Image/Logos/logOut.png`}
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
          src={`${process.env.PUBLIC_URL}/Image/Logos/Recurso203.png`}
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
  );
};

export default Customers;


