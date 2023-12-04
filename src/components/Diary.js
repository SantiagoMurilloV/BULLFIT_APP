import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import '../components/styles/Diary.css';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';




const Diary = () => {
  const [weeklyReservations, setWeeklyReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [users, setUsers] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    hour: '',
  });

  const fetchWeeklyReservations = (startDate) => {
    const endDate = moment(startDate).endOf('isoWeek').toDate();
    fetch(`https://bullfit-back.onrender.com/api/reservations?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter((reservation) => {
          const reservationDate = moment.tz(reservation.day, 'America/Bogota').startOf('isoWeek').toDate();
          return reservationDate.getTime() === startDate.getTime();
        });

        setWeeklyReservations(filteredData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar la agenda semanal:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const currentDateInColombia = moment.tz(new Date(), 'America/Bogota');
    setCurrentDate(currentDateInColombia);
    fetchWeeklyReservations(currentDateInColombia.startOf('isoWeek').toDate());

    fetch('https://bullfit-back.onrender.com/api/users')
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error('Error al cargar la lista de usuarios:', error);
      });

  }, [id]);

  const updateTrainingType = (reservationId, TrainingType) => {
    fetch(`https://bullfit-back.onrender.com/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ TrainingType }),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire('Entrenamiento actualizado', 'Se ha actualizado el entrenamiento con éxito.', 'success');
          fetchWeeklyReservations(moment(currentDate).startOf('isoWeek').toDate());
        } else {
          console.error('Error al actualizar el entrenamiento de la reserva');
        }
      })
      .catch((error) => {
        console.error('Error al obtener datos actualizados:', error);
      });
  };

  const handleNextWeek = () => {
    const nextWeek = moment(currentDate).add(1, 'weeks').startOf('isoWeek').toDate();
    setCurrentDate(nextWeek);
    fetchWeeklyReservations(nextWeek);
  };

  const handlePreviousWeek = () => {
    const previousWeek = moment(currentDate).subtract(1, 'weeks').startOf('isoWeek').toDate();
    setCurrentDate(previousWeek);
    fetchWeeklyReservations(previousWeek);
  };

  const handleOpenReservationForm = () => {
    setShowReservationForm(true);
  };

  const handleCloseReservationForm = () => {
    setShowReservationForm(false);
    setFormData({
      userId: '',
      date: '',
      hour: '',
    });
  };

  const handleSaveReservation = () => {
    const reservationData = {
      userId: formData.userId.value,
      day: formData.date,
      hour: formData.hour.value,
    };

    fetch('https://bullfit-back.onrender.com/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire('Reserva exitosa', 'Se ha realizado la reserva con éxito.', 'success');
          fetchWeeklyReservations(moment(currentDate).startOf('isoWeek').toDate());
          handleCloseReservationForm();
        } else {
          console.error('Error en la solicitud POST al crear reserva');
        }
      })
      .catch((error) => {
        console.error('Error al realizar la solicitud POST:', error);
      });
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
          fetchWeeklyReservations(moment(currentDate).startOf('isoWeek').toDate());
        } else {
          console.error('Error al actualizar el estado de la reserva');
        }
      })
      .catch((error) => {
        console.error('Error al obtener datos actualizados:', error);
      });
  };

  const handleAttendanceChange = (reservationId, newAttendance) => {
    const updatedReservations = weeklyReservations.map((reservation) => {
      if (reservation._id === reservationId) {
        return { ...reservation, Attendance: newAttendance };
      }
      return reservation;
    });

    setWeeklyReservations(updatedReservations);
    const reservationToUpdate = weeklyReservations.find((reservation) => reservation._id === reservationId);
    if (reservationToUpdate && reservationToUpdate.Attendance !== newAttendance) {
      fetch(`https://bullfit-back.onrender.com/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Attendance: newAttendance }),
      })
        .then((response) => {
          if (!response.ok) {
            console.error('Error al actualizar la asistencia');
          }
        })
        .catch((error) => {
          console.error('Error al realizar la solicitud PUT:', error);
        });
    }
  };

  const handleDeleteReservation = (reservationId) => {
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
    { value: '6:00', label: '6:00' },
    { value: '7:00', label: '7:00' },
    { value: '8:00', label: '8:00' },
    { value: '9:00', label: '9:00' },
    { value: '10:00', label: '10:00' },
    { value: '16:00', label: '16:00' },
    { value: '17:00', label: '17:00' },
    { value: '18:00', label: '18:00' },
    { value: '19:00', label: '19:00' },
    { value: '20:00', label: '20:00' },
  ];
  const renderTableHeaders = () => {
    const daysOfWeek = moment.weekdays().slice(1);
    return (
      <>
        <th>Hora</th>
        {daysOfWeek.map((day, index) => (
          <th key={index} className={`header-cell ${isCurrentDay(day) ? 'current-day' : ''}`}>
            {day} <br />
            {moment(currentDate).startOf('isoWeek').add(index, 'days').format('MM/DD')}
          </th>
        ))}
      </>
    );
  };

  const isCurrentDay = (day) => {
    const currentDay = moment().format('dddd');
    return day === currentDay;
  };


  const renderTableRows = () => {
    const morningHours = ['06:00', '07:00', '08:00', '09:00', '10:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

    return morningHours.map((hour, hourIndex) => (
      <tr key={hourIndex}>
        <td className="first-column">{hour}</td>
        {moment.weekdays().slice(1).map((day, dayIndex) => {
          const currentDay = moment(currentDate).startOf('isoWeek').add(dayIndex, 'days').format('YYYY-MM-DD');
          const reservationsForCell = weeklyReservations.filter(
            (reservation) => reservation.day === currentDay && reservation.hour === hour
          );

          return (
            <td key={dayIndex}>
              {reservationsForCell.length > 0 ? (
                reservationsForCell.map((reservation, reservationIndex) => {
                  const userFullName = `${reservation.userName} ${reservation.userLastName}`;

                  return (
                    <div
                      key={reservationIndex}
                      className={`reservation-cell ${reservation.Status === 'cancelled' ? 'cancelled' : ''} ${reservation.TrainingType ? `training-type-${reservation.TrainingType.toLowerCase().replace(' ', '-')}` : ''
                        }`}
                    >
                      <div className="user-name">
                        {reservation.Status === 'cancelled' ?
                          `➤ ${userFullName} (Cancelad@)` :
                          `➤ ${userFullName.length > 20 ? userFullName.slice(0, 16) + ' ⋯' : userFullName + ' ⋯'}`}
                        {reservation.Status !== 'cancelled' && (
                          <>
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="trash-icon"
                              onClick={() => handleDeleteReservation(reservation._id)}
                            />
                          </>
                        )}
                      </div>
                      {reservation.Status !== 'cancelled' && (
                        <>
                          <select
                            className={`trainingType ${reservation.TrainingType ? `training-type-${reservation.TrainingType.toLowerCase().replace(' ', '-')}` : ''}`}
                            value={reservation.TrainingType}
                            onChange={(event) => {
                              const TrainingType = event.target.value;
                              updateTrainingType(reservation._id, TrainingType);
                            }}
                          >
                            <option value=' '> </option>
                            <option value='Tren Superior'>Tren Superior</option>
                            <option value='Jalon'>Jalon</option>
                            <option value='Empuje'>Empuje</option>
                            <option value='Brazo'>Brazo</option>
                            <option value='Pierna'>Pierna</option>
                            <option value='Gluteo'>Gluteo</option>
                            <option value='Cardio'>Cardio</option>
                            <option value='Primer dia'>Primer dia</option>
                          </select>
                          <select
                            className={`Attendance ${reservation.TrainingType ? `training-type-${reservation.TrainingType.toLowerCase().replace(' ', '-')}` : ''}`}
                            value={reservation.Attendance}
                            onChange={(event) => {
                              const Attendance = event.target.value
                              handleAttendanceChange(reservation._id, Attendance)
                            }}
                          >
                            <option value=" "></option>
                            <option value="Si">Sí</option>
                            <option value="No">No</option>
                          </select>
                        </>
                      )}

                    </div>
                  );
                })
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
      <h2 className='title'>Agenda Semanal</h2>
      <div className="filter-controls">

        <button className='butom-day' onClick={handlePreviousWeek}>Semana Anterior</button>
        <button className='butom-day' onClick={handleNextWeek}>Siguiente Semana</button>
        <button className='butom-day' onClick={handleOpenReservationForm}>Nueva Reserva</button>
        <Link to={`/userList/${id}`} >
          <img
            src={`${process.env.PUBLIC_URL}/image/logos/usersgroup.png`}
            alt="usuarios"
            className="button-l"
          />
        </Link>
        <Link to={`/admin/${id}`} >
          <img
            src={`${process.env.PUBLIC_URL}/image/logos/logOut-copia.png`}
            alt="Botón de Regresar"
            className="button-li"
          />
        </Link>
      </div>
      <table className="table-diary">
        <thead>
          <tr>{renderTableHeaders()}</tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>
      {showReservationForm && (
        <div className="overlay">
          <div className="reservation-form">
            <label>Usuario:</label>
            <Select
              options={users.map((user) => ({
                value: user._id,
                label: `${user.FirstName} ${user.LastName}`,
              }))}
              value={formData.userId}
              onChange={(selectedOption) => handleChange('userId', selectedOption)}
            />
            <label>Hora:</label>
            <Select
              options={availableHours}
              value={formData.hour}
              onChange={(selectedOption) => handleChange('hour', selectedOption)}
            />
            <label>Fecha:</label>
            <DatePicker className='DatePicker'
              selected={formData.date ? new Date(formData.date) : null}
              onChange={(date) => handleChange('date', moment(date).format('YYYY-MM-DD'))}
            />

            <button className='buttom-modal' onClick={handleSaveReservation}>Guardar</button>
            <button className='buttom-modal' onClick={handleCloseReservationForm}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diary;
