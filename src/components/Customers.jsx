import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
  import Swal from 'sweetalert2';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../components/styles/Customers.css';
import { useToasts } from 'react-toast-notifications';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../FireBase';
import { BarLoader } from 'react-spinners';
import { environment } from '../environments.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut, faUserAlt, faSquarePen, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const Customers = ({ currentUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser);
  const [financeInfo, setFinanceInfo] = useState(null);
  const { id } = useParams();
  const { addToast } = useToasts();
  const today = new Date();
  today.setHours(today.getHours() - 5);
  const formattedDate = today.toISOString().split('T')[0];
  const [reservationsData, setReservationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl5, setImageUrl5] = useState('');
  const [imageUrl6, setImageUrl6] = useState('');
  const [imageUrl7, setImageUrl7] = useState('');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);
  const [showRenewButton, setShowRenewButton] = useState(false);
  const [termsModalIsOpen, setTermsModalIsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const checkTermsAccepted = async () => {
      try {
        const response = await fetch(`${environment.apiURL}/api/termsAndConditions/${id}`);
        if (response.ok) {
          const termsData = await response.json();
          if (!termsData.agreement) {
            setTermsModalIsOpen(true);
          }
        } else {
          // Si la respuesta no es 'ok', asumimos que el usuario no tiene términos aceptados
          setTermsModalIsOpen(true);
        }
      } catch (error) {
        console.error('Error al verificar términos y condiciones:', error);
        // Si hay un error, también mostramos el modal
        setTermsModalIsOpen(true);
      }
    };
    

    if (user) {
      checkTermsAccepted();
    }


    if (financeInfo && financeInfo.endDate) {
      const endDate = new Date(financeInfo.endDate);
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000; // milisegundos en un día

      if ((endDate - today) <= oneDay) {
        setShowRenewButton(true);
      }
    }
  }, [financeInfo]);

  const fetchFinanceData = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/finances/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener datos financieros');
      }
      const financeData = await response.json();
      setFinanceInfo(financeData);
    } catch (error) {
      console.error('Error al obtener datos financieros:', error);
    }
  };
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const imageRef5 = ref(storage, 'Recurso203.png');
        const imageRef6 = ref(storage, 'insta.png');
        const imageRef7 = ref(storage, 'WHAT.png');

        const url5 = await getDownloadURL(imageRef5);
        const url6 = await getDownloadURL(imageRef6);
        const url7 = await getDownloadURL(imageRef7);


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

    fetch(`${environment.apiURL}/api/reservations/${id}`)
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

    fetch(`${environment.apiURL}/api/users/${id}`)
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
    fetchFinanceData()


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

  }, [id, addToast]);

  if (!imagesLoaded) {
    return (
      <div className="loading-screen">
        <BarLoader color="#00BFFF" loading={!imagesLoaded} height={4} width={200} />
      </div>
    );
  }

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
  const handleRenewMembership = () => {
    Swal.fire({
      title: '¿Estás seguro de que quieres renovar tu mensualidad?',
      showCancelButton: true,
      confirmButtonText: 'Sí, renovar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const newStartDate = new Date();
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + 1);

        const financeData = {
          userId: user._id,
          Active: user.Active,
          FirstName: user.FirstName,
          LastName: user.LastName,
          IdentificationNumber: user.IdentificationNumber,
          Phone: user.Phone,
          Plan: user.Plan,
          startDate: newStartDate.toISOString().split('T')[0],
          endDate: newEndDate.toISOString().split('T')[0],
        };

        fetch(`${environment.apiURL}/api/finances`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(financeData),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error al renovar la membresía');
            }
            return response.json();
          })
          .then(data => {
            Swal.fire('Mensualidad renovada', 'Tu mensualidad ha sido renovada exitosamente.', 'success');
            setShowRenewButton(false);
          })
          .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo renovar la membresía.', 'error');
          });
      }
    });
  };
  const termText = (
    <div>
    <h2 style={{color:'black'}}>Términos y Condiciones</h2>
    <p><strong>BULLFIT</strong></p>
    <hr></hr>
    <p>(Andrés F. Tovar Morales | bullfitaxm@gmail.com)</p>
    <p>CONTRATO DE PRESTACION DE SERVICIOS</p>
    <p>1. Partes del Contrato: Entre los suscritos: ANDRÉS FELIPE TOVAR MORALES (BULLFIT.AXM) mayor de edad, identificado con documento No. 1.094.934.635 quien
      para los efectos del presente documento se denominará el CONTRATISTA y <strong>{user.FirstName} {user.LastName}</strong>, mayor de edad,
      identificado con la cédula de ciudadanía No. <strong>{user.IdentificationNumber}</strong> quien para los efectos de este documento se denominará el
      CONTRATANTE (ASESORADO).</p>
      ...
    <p>El CONTRATISTA en su calidad, se obliga para con El CONTRATANTE a prestar sus servicios de asesoría y acompañamiento en el entrenamiento físico
      2. Duración: correspondiente a partir del día {currentDay} del mes {currentMonth} del año {currentYear} y finalizará una vez el CONTRATANTE notifique su deseo de finalización.
      3. Valor: Dicho servicio por la suma de $125.000 (ciento veinticinco mil) pesos mensuales que el CONTRATANTE pagará oportunamente según mutuo acuerdo.
      4. Normas del entrenamiento: El contratante acepta y se compromete a cumplir con las normativas que se plantean (a continuación) para un entrenamiento seguro y adecuado. 
        4.1. Reservación: Todo entrenamiento debe ser agendado con al menos el tiempo mínimo que se ha estipulado (90 minutos)
        4.1.1 Modificaciones: Los Cambios de horarios se deben realizar con al menos 1 (una) horas de anticipación.
        4.2. Puntualidad: se debe llegar 5 minutos antes de la hora reservada para realizar un calentamiento previo al entrenamiento. 
        4.2.1 Penalización por impuntualidad: Se deben realizar 2 (dos) BURPEES por cada minuto de retraso en llegar al entrenamiento programado.
        4.3. Orden: EL CONTRATANTE se compromete a dejar en el lugar adecuado los implementos de entrenamiento (mancuernas, discos, barras, colchonetas, steps, lazos, balones, sacos) también a manipular de manera adecuada dichos elementos.
        4.4. Aseo: EL CONTRATANTE debe traer su propia toalla de uso personal.
      5. EL CONTRATANTE bajo su entera responsabilidad, manifiesta que cuenta con buen estado de salud y no tiene ninguna preexistencia o condición patológica que le emita restricción alguna. De lo contrario notificara al personal encargado de su entrenamiento.
      5.1 En virtud de lo anteriormente expuesto, declara y exonero de toda responsabilidad a ANDRÈS FELIPE TOVAR MORALES con C.c. 1094934635 (o) BULLFIT, asumiendo en totalidad las consecuencias y riesgos que representa la práctica del entrenamiento físico
    </p>
    <p>Para constancia, firmo el presente documento (de manera digital) en Armenia a los {currentDay} días del mes de {currentMonth} del año {currentYear}.</p>
    <p>CONTRATISTA: <strong>{user.FirstName} {user.LastName}</strong></p>
  </div>
  );

  const renderTermsToHtmlString = () => {
    const div = document.createElement('div');
    ReactDOM.render(termText, div);
    return div.innerHTML;
  };

const handleTermsAcceptance = async (event) => {
  event.preventDefault(); 
  const termsHtmlString = renderTermsToHtmlString();
  try {
    const response = await fetch(`${environment.apiURL}/api/termsAndConditions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user._id,
        document: termsHtmlString, 
        agreement: termsAccepted
      }),
    });

    if (response.ok) {
      setTermsModalIsOpen(false);
      setTermsAccepted(true);
    } else {

      throw new Error('No se pudo aceptar los términos y condiciones');
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire('Error', 'No se pudo aceptar los términos y condiciones.', 'error');
  }
};



  const currentDayReservation = reservationsData.find((reservation) => reservation.day === formattedDate);


  return (
    <div className={`StartScreen-container-customers ${loading ? 'fade-in' : ''}`}>
      <div className={`info-box-customers ${loading ? 'fade-in' : ''}`}>
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
        <div >
          {showRenewButton && (
            <button
              className='button-renew'
              onClick={handleRenewMembership}>Renovar Mensualidad</button>
          )}
        </div>

      </div>
      <div className={`bottom-buttons ${loading ? 'fade-in' : ''}`}>
        <div className="button-column-customers">
          <button className="button-icon" onClick={handleReserveClasses}>
            {user && user.Active === 'No' && user.Active !== null ? (
              <div className="button-link">
                <FontAwesomeIcon className="button-icon-image" icon={faCalendarDays} />
              </div>

            ) : (

              <Link to={`/reservations/${id}`} className="button-link">
                <FontAwesomeIcon className="button-icon-image" icon={faCalendarDays} />
              </Link>

            )}
            <span className="profile-text">Reservar Clase</span>
          </button>
        </div>
        <div className="button-column-customers">
          <button className="button-icon" >
            {user && user.Active === 'No' && user.Active !== null ? (
              <div className="button-link">
                <FontAwesomeIcon className="button-icon-image-" icon={faSquarePen} />
              </div>
            ) : (
              <Link to={`/EditReservation/${id}`} className="button-link">
                <FontAwesomeIcon className="button-icon-image" icon={faSquarePen} />
              </Link>

            )}
            <span className="profile-text">Modificar Reservas</span>
          </button>
        </div>

        <div className="button-column-customers">
          <button className="button-icon">
            <Link to={`/profile/${id}`} className="button-link">
              <FontAwesomeIcon className="button-icon-image" icon={faUserAlt} />
            </Link>
            <span className="profile-text">{user ? user.FirstName + user.LastName : 'N/A'}</span>
          </button>
        </div>

        <div className="button-column-customers">
          <button className="button-icon" onClick={handleLogout} >
            <div className="button-link">
              <FontAwesomeIcon className="button-icon-image" icon={faSignOut} />
            </div>

            <span className="profile-text">Salir</span>
          </button>
        </div>
      </div>
      <div className="header-customers">
        <img
          src={imageUrl5}
          alt="Imagen de perfil"
          className="header-customers"
          id="profile-image"
        />
      </div>
      <div className="instagram-logo-container-customers">
        <div>
          <a
            href="https://www.instagram.com/bullfit.axm/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={imageUrl6}
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
            src={imageUrl7}
            alt="Logo de Instagram"
            className="whatsapp-logo-customers"
          />
        </a>
      </div>
      <Modal
        isOpen={termsModalIsOpen}
        contentLabel="Términos y Condiciones"
        className="Modal-termAnsCondition"
        overlayClassName="Overlay"
      >
      {termText}
        <form onSubmit={handleTermsAcceptance}>
          <label className="checkbox-container"> 
          Acepto los términos y condiciones
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <span className="checkbox-custom"></span>
            
          </label>
          <button type="submit" disabled={!termsAccepted}>Continuar</button>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;



