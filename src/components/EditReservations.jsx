import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import '../components/styles/Diary.css';
import '../../src/components/styles/EditReservations.css';
import { faTrash, faEdit, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { environment } from '../environments';

const EditReservations = () => {
  const [userReservations, setUserReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formData, setFormData] = useState({
    reservationId: '',
    date: '',
    hour: '',
  });

  const fetchUserReservations = (id, startDate) => {
    const endDate = moment(startDate).endOf('isoWeek').toDate();
    fetch(`${environment.apiURL}/api/reservationsid/${id}`)
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
    fetchUserReservations(id, currentDateInColombia.startOf('isoWeek').toDate());
  }, [id]);

  const handleNextWeek = () => {
    const nextWeek = moment(currentDate).add(1, 'weeks').startOf('isoWeek').toDate();
    setCurrentDate(nextWeek);
    fetchUserReservations(id, nextWeek);
  };

  const updateReservationStatus = (reservationId, Status) => {
    fetch(`${environment.apiURL}/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Status }),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire('Reserva actualizada', 'La reserva ha sido actualizada con éxito.', 'success');
          fetchUserReservations(id, moment(currentDate).startOf('isoWeek').toDate());
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
      title: '¿Está seguro que quieres cancelar la reserva?',
      text: 'No podrá revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, Cancelar Reserva',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        updateReservationStatus(reservationId, 'cancelled');
      }
    });
  };
  const handleDeleteReservation = (reservationId) => {
    Swal.fire({
      title: '¿Está seguro de eliminar esta reserva?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${environment.apiURL}/api/reservations/${reservationId}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (response.ok) {
              Swal.fire('Eliminado', 'La reserva ha sido eliminada.', 'success');
              const updatedReservations = userReservations.filter(reservation => reservation._id !== reservationId);
              setUserReservations(updatedReservations);
            } else {
              Swal.fire('Error', 'No se pudo eliminar la reserva.', 'error');
            }
          });
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
    const localDate = moment(date).tz('America/Bogota').toDate();
    setFormData({
      reservationId,
      date: localDate,
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

    fetch(`${environment.apiURL}/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hour: hour.value }),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire('Reserva actualizada', 'La reserva ha sido actualizada con éxito.', 'success');
          fetchUserReservations(id, moment(currentDate).startOf('isoWeek').toDate());
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
    fetchUserReservations(id, previousWeek);
  };
  const handleCurrentWeek = () => {
    const currentWeek = moment().tz('America/Bogota').startOf('isoWeek');
    setCurrentDate(currentWeek);
    fetchUserReservations(id, currentWeek.toDate());
  };

  const handleNextMonth = () => {
    const nextMonth = moment(currentDate).add(1, 'month').startOf('isoWeek');
    setCurrentDate(nextMonth);
    fetchUserReservations(id, nextMonth.toDate());
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
    const morningHours = ['06:00', '07:00', '08:00', '09:00', '10:00'];
    const afternoonHours = ['16:00', '17:00', '18:00', '19:00', '20:00'];
    const allHours = [...morningHours, 'separator', ...afternoonHours];
  
    return allHours.map((hour, hourIndex) => {
      if (hour === 'separator') {
        return (
          <tr key="separator">
            <td colSpan="8" style={{ backgroundColor: 'rgb(92 92 92)', textAlign: 'center', color: 'black' }}>Break</td>
          </tr>
        );
      } else {
        return (
          <tr key={hour}>
            <td className="first-column">{hour}</td>
            {moment.weekdays().slice(1).map((day, dayIndex) => {
              const currentDayStr = moment(currentDate).startOf('isoWeek').add(dayIndex, 'days').format('YYYY-MM-DD');
              const reservationTime = moment(`${currentDayStr} ${hour}`);
              const currentTime = moment();
              const canDelete = reservationTime.diff(currentTime, 'hours') >= 2;
  
              const reservationForCell = userReservations.find(
                (reservation) => reservation.day === currentDayStr && reservation.hour === hour && reservation.userId === id
              );
  
              return (
                <td key={dayIndex}>
                  {reservationForCell ? (
                    <div className={`reservation-cell ${reservationForCell.Status === 'cancelled' ? 'cancelled' : ''}`}>
                      <div className="user-name">
                        {reservationForCell.Status === 'cancelled' ? (
                          `Reserva (Cancelada)`
                        ) : (
                          `Reservado`
                        )}
                      </div>
                      {reservationForCell.Status !== 'cancelled' && (
                        <>
                          {canDelete ? (
                            <>
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="delete-icon"
                                onClick={() => handleDeleteReservation(reservationForCell._id)}
                                style={{ color: '#b80f0f', cursor: 'pointer' }}
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
                                style={{ cursor: 'pointer' }}
                              />
                            </>
                          ) : (
                            <FontAwesomeIcon
                              icon={faBan}
                              className="cancel-icon"
                              style={{ color: 'rgb(255 154 112)' }}
                            />
                          )}
  
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="reservation-cell">☒</div>
                  )}
                </td>
              );
            })}
          </tr>
        );
      }
    });
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
          <button className="nav-button" onClick={handleCurrentWeek}>Semana Actual</button>
          <button className="nav-button" onClick={handleNextMonth}>Siguiente Mes</button>

          <Link to={`/customers/${id}`} >
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
                className='DatePicker'
                selected={formData.date ? new Date(formData.date) : null}
                onChange={(date) => handleChange('date', date)}
                dateFormat="yyyy-MM-dd"
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
