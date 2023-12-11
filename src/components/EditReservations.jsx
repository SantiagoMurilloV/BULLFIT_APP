import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import '../components/styles/Diary.css';
import '../../src/components/styles/EditReservations.css';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import Select from 'react-select';


const EditReservations = () => {
  const [userReservations, setUserReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { id  } = useParams();
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formData, setFormData] = useState({
    reservationId: '',
    date: '',
    hour: '',
  });

  const fetchUserReservations = (id , startDate) => {
    const endDate = moment(startDate).endOf('isoWeek').toDate();
    fetch(`https://bullfit-back.onrender.com/api/reservationsid/${id }`)
      .then((response) => response.json())
      .then((data) => {
        setUserReservations(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar las reservas del usuario:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const currentDateInColombia = moment.tz(new Date(), 'America/Bogota');
    setCurrentDate(currentDateInColombia);
    fetchUserReservations(id , currentDateInColombia.startOf('isoWeek').toDate());
  }, [id ]);

  const handleNextWeek = () => {
    const nextWeek = moment(currentDate).add(1, 'weeks').startOf('isoWeek').toDate();
    setCurrentDate(nextWeek);
    fetchUserReservations(id , nextWeek);
  };

  const updateReservationStatus = (reservationId, Status) => {
    fetch(`https://bullfit-back.onrender.com/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Status }),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire('Reserva actualizada', 'La reserva ha sido actualizada con éxito.', 'success');
          fetchUserReservations(id , moment(currentDate).startOf('isoWeek').toDate());
        } else {
          console.error('Error al actualizar el estado de la reserva');
        }
      })
      .catch((error) => {
        console.error('Error al obtener datos actualizados:', error);
      });
  };

  const handleCancelReservation = (reservationId) => {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'No podrá revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        updateReservationStatus(reservationId, 'cancelled');
      }
    });
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const availableHours = [
    { value: '06:00', label: '6:00' },
    { value: '07:00', label: '7:00' },
    { value: '08:00', label: '8:00' },
    { value: '09:00', label: '9:00' },
    { value: '10:00', label: '10:00' },
    { value: '16:00', label: '16:00' },
    { value: '17:00', label: '17:00' },
    { value: '18:00', label: '18:00' },
    { value: '19:00', label: '19:00' },
    { value: '20:00', label: '20:00' },
  ];

  const handleOpenReservationForm = (reservationId, date, hour) => {
    setFormData({
      reservationId,
      date,
      hour: { value: hour, label: hour },
    });
    setShowReservationForm(true);
  };

  const handleCloseReservationForm = () => {
    setShowReservationForm(false);
    setFormData({
      reservationId: '',
      date: '',
      hour: '',
    });
  };

  const handleSaveReservation = () => {
    const { reservationId, hour } = formData;

    fetch(`https://bullfit-back.onrender.com/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({hour: hour.value }),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire('Reserva actualizada', 'La reserva ha sido actualizada con éxito.', 'success');
          fetchUserReservations(id , moment(currentDate).startOf('isoWeek').toDate());
          handleCloseReservationForm();
        } else {
          console.error('Error al actualizar la reserva');
        }
      })
      .catch((error) => {
        console.error('Error al realizar la solicitud PUT:', error);
      });
  };

  const handlePreviousWeek = () => {
    const previousWeek = moment(currentDate).subtract(1, 'weeks').startOf('isoWeek').toDate();
    setCurrentDate(previousWeek);
    fetchUserReservations(id , previousWeek);
  };

  const renderTableHeaders = () => {
    const headers = [
      'Horas',
      ...moment.weekdays().slice(1).map((day, dayIndex) =>
        moment(currentDate).startOf('isoWeek').add(dayIndex, 'days').format('dddd (DD/MM)')
      ),
    ];
  
    const headerClasses = [
      'blue', 
      'red', 
      'black', 
      'grey', 
      'red', 
      'black', 
      'grey', 
      'blue', 
    ];
  
    return headers.map((header, index) => (
      <th key={index} className={headerClasses[index]}>
        {header}
      </th>
    ));
  };
  

  const renderTableRows = () => {
    const morningHours = ['06:00', '07:00', '08:00', '09:00', '10:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

    return morningHours.map((hour, hourIndex) => (
      <tr key={hourIndex}>
        <td className="first-column">{hour}</td>
        {moment.weekdays().slice(1).map((day, dayIndex) => {
          const currentDay = moment(currentDate).startOf('isoWeek').add(dayIndex, 'days').format('YYYY-MM-DD');

          const reservationForCell = userReservations.find(
            (reservation) => reservation.day === currentDay && reservation.hour === hour && reservation.userId === id
          );

          return (
            <td key={dayIndex}>
              {reservationForCell ? (
                <div className={`reservation-cell ${reservationForCell.Status === 'cancelled' ? 'cancelled' : ''}`}>
                  <div className="user-name">
                    {reservationForCell.Status === 'cancelled' ? (
                      `Reserva (Cancelad@)`
                    ) : (
                      `Reservado`
                    )}
                  </div>
                  {reservationForCell.Status !== 'cancelled' && (
                    <>
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="trash-icon"
                        onClick={() => handleCancelReservation(reservationForCell._id)}
                      />
                      <FontAwesomeIcon
                        icon={faEdit}
                        className="edit-icon"
                        onClick={() =>
                          handleOpenReservationForm(
                            reservationForCell._id,
                            reservationForCell.day,
                            reservationForCell.hour
                          )
                        }
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="reservation-cell">-</div>
              )}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <div className={`Diary-container ${loading ? 'fade-in' : 'fade-out'}`}>
      <div className="diary-header">
        <div className="diary-title">
          <h1>Editar Reservas</h1>
        </div>
        <div className="date-navigation">
          <button className="nav-button" onClick={handlePreviousWeek}>
            Semana Anterior
          </button>
          <span className="current-week">{`Semana del ${moment(currentDate).format('DD/MM/YYYY')}`}</span>
          <button className="nav-button" onClick={handleNextWeek}>
            Próxima Semana
          </button>
          <Link to={`/customers/${id }`} >
          <button className="nav-button" >
            Inicio
          </button>
        </Link>
        </div>
      </div>
      <div className="edit-table">
        <table>
          <thead>
            <tr>{renderTableHeaders()}</tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
        {showReservationForm && (
          <div className="overlay">
            <div className="reservation-form">
              <label>Hora:</label>
              <Select
                options={availableHours}
                value={formData.hour}
                onChange={(selectedOption) => handleChange('hour', selectedOption)}
              />
              <label>Fecha:</label>
              <DatePicker
                className="DatePicker"
                selected={formData.date ? new Date(formData.date) : null}
                onChange={(date) => handleChange('date', moment(date).format('YYYY-MM-DD'))}
              />

              <button className="buttom-modal" onClick={handleSaveReservation}>
                Guardar
              </button>
              <button className="buttom-modal" onClick={handleCloseReservationForm}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditReservations;
