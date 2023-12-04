import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../components/styles/Admin.css';


const Admin = ({ currentUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);



  useEffect(() => {
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

  return (
    <div className={`StartScreen-container ${loading ? 'fade-in' : 'fade-out'}`}>
      <div className={`button-logout ${loading ? 'fade-in' : 'fade-out'}`}>

      </div>

      <div className={`bottom-buttons ${loading ? 'fade-in' : 'fade-out'}`}>

        <div className="button-column">
          <button className="button-icon" onClick={handleReserveClasses}>
            <Link to={`/reservations/${id}`} className="button-link">
              <img
                src={`${process.env.PUBLIC_URL}/Image/Logos/new-user.png`}
                alt="Icono de Reservar"
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
                src={`${process.env.PUBLIC_URL}/image/logos/$.png`}
                alt="Icono de Modificar"
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
                src={`${process.env.PUBLIC_URL}/Image/Logos/agenda.png`}
                alt="Imagen de perfil"
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
              src={`${process.env.PUBLIC_URL}/Image/Logos/logOut.png`}
              alt="Imagen de salir"
              className="logout"
              id="logout-image"
            />
            <span className="profile-text">Salir</span>
          </button>
        </div>
      </div>
      <div className={`header- ${loading ? 'fade-in' : 'fade-out'}`}>
        <img
          src={`${process.env.PUBLIC_URL}/Image/Logos/Recurso203.png`}
          alt="Imagen de perfil"
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

export default Admin;