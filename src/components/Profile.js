import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useParams } from 'react-router-dom';
import '../components/styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const { id } = useParams();

  useEffect(() => {
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

  return (
    <div className="Profile-container">
      <div className="profile-header">
        <img
          src={`${process.env.PUBLIC_URL}/image/logos/profile.png`}
          alt="Imagen de perfil"
          className="profile-image"
        />
        <h1>{user ? user.FullName : 'N/A'}</h1>
      </div>
      <div className="profile-info">
        <div className="profile-details">
          <p>
            <strong>Fecha de nacimiento</strong> {user ? user.Birthday : 'N/A'}
          </p>
          <p>
            <strong>Teléfono:</strong> {user ? user.Phone : 'N/A'}
          </p>
          <p>
            <strong>Eps:</strong> {user ? user.Eps : 'N/A'}
          </p>
          <p>
            <strong>Plan:</strong> {user ? user.Plan : 'N/A'}
          </p>
        </div>
      </div>
      <div className="profile-buttons">
        <Link to={`/customers/${id}`} className="button-link">
          <button className="profile-button">
            <img
              src={`${process.env.PUBLIC_URL}/image/logos/logOut.png`}
              alt="Botón de Regresar"
              className="profile-button-image"
            />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Profile;
