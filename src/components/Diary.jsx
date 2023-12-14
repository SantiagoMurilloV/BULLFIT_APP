import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import '../components/styles/Diary.css';
import { faTrash, faBan } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from 'date-fns';




const Diary = () => {
  const [weeklyReservations, setWeeklyReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [users, setUsers] = useState([])
  const [isMonthlyReservation, setIsMonthlyReservation] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    hour: '',
  });
  const maxSpacesPerHour = 12;
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

    const intervalId = setInterval(() => {
      fetchWeeklyReservations(currentDateInColombia.startOf('isoWeek').toDate());
    }, 60000);
    return () => clearInterval(intervalId)

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
          fetchWeeklyReservations(moment(currentDate).startOf('isoWeek').toDate());
        } else {
          console.error('Error al actualizar el entrenamiento de la reserva');
        }
      })
      .catch((error) => {
        console.error('Error al obtener datos actualizados:', error);
      });
  };

  const handleCreateReservationFromTable = (userId, day, hour) => {
    const reservationData = {
      userId,
      day,
      hour,
    };

    fetch('https://bullfit-back.onrender.com/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    })
      .then((response) => response.json())
      .then(() => {
        Swal.fire('Reserva Creada', 'La reserva ha sido creada exitosamente.', 'success');
        fetchWeeklyReservations(moment(currentDate).startOf('isoWeek').toDate());
      })
      .catch((error) => {
        console.error('Error al crear reserva:', error);
        Swal.fire('Error', 'No se pudo crear la reserva.', 'error');
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

  const handleOpenReservationForm = (date) => {
    const localDate = moment(date).tz('America/Bogota').toDate();
    setFormData({
      userId: '',
      date: localDate,
      hour: '',
    });
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

  const handlecancellation = (reservationId) => {
    Swal.fire({
      title: '¿Está seguro de cancelar esta reserva?',
      text: 'No podrá revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, Cancelar Reserva',
      cancelButtonText: 'No cancelar',
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
        fetch(`https://bullfit-back.onrender.com/api/reservations/${reservationId}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (response.ok) {
              Swal.fire('Eliminado', 'La reserva ha sido eliminada.', 'success');
              fetchWeeklyReservations(moment(currentDate).startOf('isoWeek').toDate());
            } else {
              Swal.fire('Error', 'No se pudo eliminar la reserva.', 'error');
            }
          });
      }
    });
  };


  const handleSaveMonthlyReservation = () => {
    const { userId, hour } = formData;
    const startDate = moment(formData.date);
    let endDateToUse;

    if (isMonthlyReservation) {
      // Calcula la fecha un mes después de la fecha de inicio
      endDateToUse = moment(startDate).add(1, 'month');
    } else {
      // Utiliza el final del mes actual
      endDateToUse = moment(startDate).endOf('month');
    }
    for (let date = moment(startDate); date.isSameOrBefore(endDateToUse, 'day'); date.add(1, 'days')) {
      if (date.isoWeekday() <= 5) { // Lunes a Viernes
        const reservationData = {
          userId: userId.value,
          day: date.format('YYYY-MM-DD'),
          hour: hour.value,
        };

        createReservation(reservationData);
        fetchWeeklyReservations(moment(currentDate).startOf('isoWeek').toDate());
      }
    }
    handleCloseReservationForm();
    Swal.fire('Reserva Creada', 'Las reservas mensuales están siendo procesadas.', 'success');
  };
  const handleMonthlyReservationChange = (e) => {
    const checked = e.target.checked;
    setIsMonthlyReservation(checked);
    if (checked) {
      const calculatedEndDate = moment(formData.date).add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD');
      setEndDate(calculatedEndDate);
    } else {
      setEndDate('');
    }
  };





  const createReservation = (reservationData) => {
    fetch('https://bullfit-back.onrender.com/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudo crear la reserva');
        }
      })
      .catch((error) => {
        console.error('Error al crear reserva:', error);
        Swal.fire('Error', 'No se pudo crear la reserva.', 'error');
      });
  };




  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const availableHours = [
    { value: '06:00', label: '06:00' },
    { value: '07:00', label: '07:00' },
    { value: '08:00', label: '08:00' },
    { value: '09:00', label: '09:00' },
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
        <th className="hour-column">Hora</th>
        {daysOfWeek.map((day, index) => {
          const dayHeaderClass = (() => {
            switch (index) {
              case 0:
              case 3:
                return 'red-background';
              case 1:
              case 4:
                return 'black-background';
              case 2:
              case 5:
                return 'gray-background';
              default:
                return '';
            }
          })();

          return (

            <th key={index} className={`header-cell ${isCurrentDay(day) ? 'current-day' : ''} ${dayHeaderClass}`}>
              {day} <br />
              {moment(currentDate).startOf('isoWeek').add(index, 'days').format('MM/DD')}
            </th>
          )
        })}
      </>
    );
  };


  const isCurrentDay = (day) => {
    const currentDay = moment().format('dddd');
    return day === currentDay;
  };

  const handleNextMonth = () => {
    const nextMonth = moment(currentDate).add(1, 'month').startOf('month');
    setCurrentDate(nextMonth);
    fetchWeeklyReservations(nextMonth.startOf('isoWeek').toDate());
  };

  const handleCurrentWeek = () => {
    const currentWeek = moment().startOf('isoWeek');
    setCurrentDate(currentWeek);
    fetchWeeklyReservations(currentWeek.toDate());
  };





  const renderTableRows = () => {
    const morningHours = ['06:00', '07:00', '08:00', '09:00', '10:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    const trainingTypeStyles = {
      'Tren Superior': { backgroundColor: 'rgb(15 69 255)', color: 'white' },
      'Jalon': { backgroundColor: '#add8e6' },
      'Empuje': { backgroundColor: '#87CEEB' },
      'Brazo': { backgroundColor: '#008000' },
      'Pierna': { backgroundColor: 'rgb(255 255 160)' },
      'Gluteo': { backgroundColor: '#ffc0cb' },
      'Cardio': { backgroundColor: 'rgb(149 239 149)' },
      'Primer dia': { backgroundColor: '#d8bfd8' },
    };
    const attendanceStyles = {
      ' ': { backgroundColor: 'white' },
      'Si': { backgroundColor: 'lime' },
      'No': { backgroundColor: '#fc4646' }
    }
    return morningHours.map((hour, hourIndex) => (
      <tr key={hourIndex}>
        <td className="first-column">{hour}</td>
        {moment.weekdays().slice(1).map((day, dayIndex) => {
          const currentDay = moment(currentDate).startOf('isoWeek').add(dayIndex, 'days').format('YYYY-MM-DD');
          const reservationsForCell = weeklyReservations.filter(
            (reservation) => reservation.day === currentDay && reservation.hour === hour
          );

          const reservationCells = [];
          for (let i = 0; i < maxSpacesPerHour; i++) {
            const reservation = reservationsForCell[i];
            if (reservation) {
              const userFullName = `${reservation.userName} ${reservation.userLastName}`;
              const trainingType = reservation.TrainingType || '';
              const trainingTypeClass = `training-type-${trainingType.toLowerCase().replace(/\s+/g, '-')}`;
              reservationCells.push(
                <div
                  key={reservation._id}
                  className={`reservation-cell bordered-cell ${reservation.Status === 'cancelled' ? 'cancelled' : ''}`}
                >
                  <div className="user-name">
                    {reservation.Status === 'cancelled' ?
                      `☒ ${userFullName} (Cancelado)` :
                      `☑ ${userFullName.length > 9 ? userFullName.slice(0, 10) + '...' : userFullName + ' ⋯'}`}
                    {reservation.Status !== 'cancelled' && (
                      <>
                        <FontAwesomeIcon
                          icon={faBan}
                          className="trash-icon"
                          onClick={() => handlecancellation(reservation._id)}
                        />
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="delete-icon"
                          onClick={() => handleDeleteReservation(reservation._id)}
                          style={{ color: 'red', cursor: 'pointer' }}
                        />
                      </>
                    )}
                  </div>
                  {reservation.Status !== 'cancelled' && (
                    <>
                      <select
                        style={trainingTypeStyles[reservation.TrainingType]}
                        className={`trainingType ${trainingTypeClass}`}
                        value={reservation.TrainingType}
                        onChange={(event) => updateTrainingType(reservation._id, event.target.value)}

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
                        style={attendanceStyles[reservation.Attendance]}
                        className={`Attendance ${reservation.TrainingType ? `training-type-${reservation.TrainingType.toLowerCase().replace(' ', '-')}` : ''}`}
                        value={reservation.Attendance}
                        onChange={(event) => {
                          const Attendance = event.target.value
                          handleAttendanceChange(reservation._id, Attendance)
                        }}
                      >
                        <option value=" "></option>
                        <option value="Si">✓</option>
                        <option value="No">✖</option>
                      </select>
                    </>
                  )}

                </div>
              );

            } else {
              reservationCells.push(
                <div key={`empty-${i}`} className="reservation-cell bordered-cell" style={{ width: '100%' }}>
                  <Select
                    options={users.map((user) => ({
                      value: user._id,
                      label: `${user.FirstName} ${user.LastName}`,
                    }))}
                    onChange={(selectedOption) => handleCreateReservationFromTable(selectedOption.value, currentDay, hour)}
                    placeholder=""
                    styles={{
                      container: (base) => ({ ...base, width: '100%' }),
                      control: (base) => ({
                        ...base,
                        minHeight: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.331)',
                      }),
                      valueContainer: (base) => ({ ...base, height: '20px' }),
                      input: (base) => ({ ...base, margin: 0, padding: 0 }),
                      dropdownIndicator: (base) => ({ ...base, padding: '0px' }),
                      clearIndicator: (base) => ({ ...base, padding: '2px' }),
                    }}
                  />
                </div>
              );
            }
          }
          return <td key={dayIndex}>{reservationCells}</td>;
        })}
      </tr>
    ));
  };

  return (
    <div className={`Diary-container ${loading ? 'fade-in' : 'fade-out'}`}>
      <h2 className='title'>Agenda Semanal</h2>
      <div className="filter-controls-diary">
        <button className='butom-day' onClick={handlePreviousWeek}>Semana Anterior</button>
        <button className='butom-day' onClick={handleNextWeek}>Siguiente Semana</button>
        <button className='butom-day' onClick={handleCurrentWeek}>Semana Actual</button>
        <button className='butom-day' onClick={handleNextMonth}>Siguiente Mes</button>
        <button className='butom-day' onClick={handleOpenReservationForm}>Nueva Reserva</button>
        <Link to={`/userList/${id}`}>
          <button className='butom-day' onClick={handleOpenReservationForm}>Usuarios</button>
        </Link>
        <Link to={`/admin/${id}`}>
          <button className='butom-day' onClick={handleOpenReservationForm}>Inicio</button>
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
            <DatePicker
              className='DatePicker'
              selected={formData.date ? new Date(formData.date) : null}
              onChange={(date) => handleChange('date', date)}
              dateFormat="yyyy-MM-dd"
            />
            <div className="reservation-form-checkbox">
              <input
                type="checkbox"
                checked={isMonthlyReservation}
                onChange={handleMonthlyReservationChange}
              />
              <label>Reserva Mensual</label>
            </div>
            {isMonthlyReservation && (
              <p className="reservation-form-end-date">Fecha de finalización: {endDate}</p>
            )}
            <button className='buttom-modal' onClick={handleSaveMonthlyReservation}>Reservar Mes</button>
            <button className='buttom-modal' onClick={handleSaveReservation}>Reservar día</button>
            <button className='buttom-modal' onClick={handleCloseReservationForm}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );

};

export default Diary;
