import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useParams, useNavigate } from 'react-router-dom'; 
import '../components/styles/RegisterUser.css';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../FireBase';
import { environment } from '../environments'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const RegisterUsers = () => {
  const [userData, setUserData] = useState({
    FirstName: '',
    LastName: '',
    Phone: '',
    IdentificationNumber: '',
    Active: 'Sí',
    Plan: '',
    startDate: '',
    endDate: '',
    registrationDate:''
  });
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const imageRef = ref(storage, 'logOut.png');
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
      } catch (error) {
        console.error('Error al obtener la URL de descarga de la imagen:', error);
      }
    };

    fetchImageUrl();
  }, [storage]);


  const calculateEndDate = (startDate) => {
    let date = new Date(startDate);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0]; // Formatear a yyyy-mm-dd
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newUserData = { ...userData, [name]: value };

    if (name === 'startDate' && userData.Plan === 'Mensual') {
      newUserData.endDate = calculateEndDate(value);
    }

    setUserData(newUserData);
  };
  const postFinanceData = async (userId) => {
    const financeData = {
      userId,
      Active: userData.Active || 'No',
      FirstName: userData.FirstName || '',
      LastName: userData.LastName || '',
      IdentificationNumber: userData.IdentificationNumber || '',
      Phone: userData.Phone || '',
      Plan: userData.Plan || '',
      startDate: userData.startDate || '',
      endDate: userData.endDate || ''
      
    };
  
    try {
      const response = await fetch(`${environment.apiURL}/api/finances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(financeData)
      });
  
      if (!response.ok) {
        throw new Error('No se pudo registrar la información financiera del usuario');
      }
      console.log('Información financiera registrada con éxito');
    } catch (error) {
      console.error('Error al registrar la información financiera:', error);
    }
  };
  

  const handleSubmit = async () => {
    if (
      userData.FirstName &&
      userData.LastName &&
      userData.Phone &&
      userData.IdentificationNumber &&
      userData.Active &&
      userData.Plan &&
      userData.startDate &&
      userData.registrationDate
    ) {
      try {
        const response = await fetch(`${environment.apiURL}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
  
        if (!response.ok) {
          throw new Error('Error al registrar el usuario');
        }
  
        const newUser = await response.json();
        await postFinanceData(newUser._id);
        const result = await Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'El usuario ha sido registrado correctamente.',
          showCancelButton: true,
          confirmButtonText: 'Registrar otro',
          cancelButtonText: 'Salir',
        });
  
        if (result.isConfirmed) {
          setUserData({
            FirstName: '',
            LastName: '',
            Phone: '',
            IdentificationNumber: '',
            Active: '',
            Plan: '',
            startDate: '',
            endDate: '',
            registrationDate:''
          });
        } else {
          navigate(`/admin/${id}`);
        }
      } catch (error) {
        console.error('Error al realizar la solicitud POST:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo completar el registro del usuario.',
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, complete todos los campos del formulario.',
      });
    }
  };
  

  
  return (
    <div className="RegisterUsers-container">
      <h2>Registrar Usuario</h2>
      <form className="RegisterUsers-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="FirstName"
              value={userData.FirstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Apellido:</label>
            <input
              type="text"
              name="LastName"
              value={userData.LastName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Número de Celular:</label>
            <input
              type="text"
              name="Phone"
              value={userData.Phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Cedula :</label>
            <input
              type="text"
              name="IdentificationNumber"
              value={userData.IdentificationNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Esta Activo ?:</label>
            <select
              name="Active"
              value={userData.Active}
              onChange={handleInputChange}
            >
              <option value=" "> </option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Plan:</label>
            <select
              name="Plan"
              value={userData.Plan}
              onChange={handleInputChange}
            >
              <option value=" "> </option>
              <option value="Diario">Diario</option>
              <option value="Mensual">Mensual</option>
            </select>
          </div>
        </div>
        <div className="form-row">
        <div className="form-group">
          <label>Fecha de Ingreso</label>
          <input
            type="date"
            name="registrationDate"
            value={userData.registrationDate}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Fecha de Inicio:</label>
          <input
            type="date"
            name="startDate"
            value={userData.startDate}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
        {userData.Plan === 'Mensual' && (
          <div className="form-group">
            <label>Fecha Final:</label>
            <input
              type="date"
              name="endDate"
              value={userData.endDate}
              onChange={handleInputChange}
            />
          </div>
        )}
        </div>
        </div>
        <button type="button" onClick={handleSubmit}>
          Registrar
        </button>
        <div className="profile-buttons">
          <Link to={`/admin/${id}`} className="button-link-register">
          <FontAwesomeIcon icon={faSignOutAlt} />
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterUsers;
