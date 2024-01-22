import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import '../components/styles/Diary.css';
import { faArrowLeft, faArrowRight, faCalendarDay, faCalendarPlus, faHome, faUserFriends, faCalendarMinus, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { environment } from '../environments';



const Diary = () => {
  const [weeklyReservations, setWeeklyReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [users, setUsers] = useState([])
  const [isMonthlyReservation, setIsMonthlyReservation] = useState(false)
  const [weekOptions, setWeekOptions] = useState([]);;
  const [isWeeklyReservation, setIsWeeklyReservation] = useState(false);
  const [selectEnabled, setSelectEnabled] = useState({});
  const [resetCounter, setResetCounter] = useState(0);
  const [endDate, setEndDate] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    hour: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [deletionDate, setDeletionDate] = useState(new Date());


  const morningHours = ['06:00', '07:00', '08:00', '09:00', '10:00'];
  const afternoonHours = ['16:00', '17:00', '18:00', '19:00', '20:00'];
  const maxSpacesPerHour = 12;
  const getCapitalizedDayOfWeek = (date) => {
    const dayOfWeek = moment(date).format('dddd');
    return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  };

  const fetchWeeklyReservations = (startDate) => {
    const endDate = moment(startDate).endOf('isoWeek').toDate();
    fetch(`${environment.apiURL}/api/reservations?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
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
    generateWeekOptions();
    fetch(`${environment.apiURL}/api/users`)
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
    fetch(`${environment.apiURL}/api/reservations/${reservationId}`, {
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
    const capitalizedDayOfWeek = getCapitalizedDayOfWeek(day);

    const reservationData = {
      userId,
      day,
      dayOfWeek: capitalizedDayOfWeek,
      hour,
    };

    fetch(`${environment.apiURL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    })
      .then((response) => response.json())
      .then(() => {
        resetSelects();
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
  const resetSelects = () => {
    setResetCounter(prev => prev + 1);
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
  const handleUserSelection = (userId) => {
    setSelectedUserId(userId);
  };

  const handleDeletionDateChange = (date) => {
    setDeletionDate(date);
  };

  const handleDeleteUserReservations = async () => {
    const formattedDeletionDate = moment(deletionDate).format('YYYY-MM-DD');

    try {
      const response = await fetch(`${environment.apiURL}/api/reservations?userId=${selectedUserId}`);
      if (!response.ok) throw new Error('Error al recuperar reservas');

      const reservations = await response.json();
      const reservationsToDelete = reservations.filter(reservation => moment(reservation.day).isAfter(formattedDeletionDate));

      for (const reservation of reservationsToDelete) {
        const deleteResponse = await fetch(`${environment.apiURL}/api/reservations/${reservation._id}`, {
          method: 'DELETE'
        });
        if (!deleteResponse.ok) throw new Error('Error al eliminar reserva');
      }
      fetchWeeklyReservations(moment(currentDate).startOf('isoWeek').toDate());
      Swal.fire('Eliminado', 'Las reservas han sido eliminadas.', 'success');
      fetchWeeklyReservations(currentDate);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo eliminar las reservas.', 'error');
    }

    setShowDeleteModal(false);
  };




  const handleSaveReservation = () => {
    const formattedDate = moment(formData.date).format('YYYY-MM-DD');
    const reservationData = {
      userId: formData.userId.value,
      day: formattedDate,
      dayOfWeek: getCapitalizedDayOfWeek(formattedDate),
      hour: formData.hour.value,
    };

    fetch(`${environment.apiURL}/api/reservations`, {
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
      fetch(`${environment.apiURL}/api/reservations/${reservationId}`, {
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
  const generateWeekOptions = () => {
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    let week = startOfMonth.clone();
    const options = [];

    while (week.isBefore(endOfMonth)) {
      const weekStart = week.format('YYYY-MM-DD');
      const weekEnd = week.clone().endOf('isoWeek').format('YYYY-MM-DD');
      options.push({ value: weekStart, label: `Semana del ${weekStart} al ${weekEnd}` });
      week.add(1, 'week');
    }

    setWeekOptions(options);
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
        fetch(`${environment.apiURL}/api/reservations/${reservationId}`, {
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
    if (!isMonthlyReservation) {
      Swal.fire('Por favor, selecciona reservar mes');
      return;
    }

    const { userId, hour } = formData;
    const startDate = moment(formData.date);
    let endDateToUse;

    if (isMonthlyReservation) {
      endDateToUse = moment(startDate).add(1, 'month');
    } else {
      endDateToUse = moment(startDate).endOf('month');
    }
    for (let date = moment(startDate); date.isSameOrBefore(endDateToUse, 'day'); date.add(1, 'days')) {
      if (date.isoWeekday() <= 5) {
        const dayOfWeek = date.format('dddd');
        const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
        const reservationData = {
          userId: userId.value,
          day: date.format('YYYY-MM-DD'),
          dayOfWeek: capitalizedDayOfWeek,
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

  const handleSaveWeeklyReservation = () => {
    if (!formData.week) {
      Swal.fire('Por favor, selecciona una semana.');
      return;
    }
    const startOfWeek = moment(formData.week.value).startOf('isoWeek');
    const endOfWeek = startOfWeek.clone().add(4, 'days');

    Swal.fire(`Reservando desde ${startOfWeek.format('YYYY-MM-DD')} hasta ${endOfWeek.format('YYYY-MM-DD')}`);

    for (let day = moment(startOfWeek); day.isSameOrBefore(endOfWeek, 'day'); day.add(1, 'days')) {
      const dayOfWeek = day.format('dddd');
      const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

      const reservationData = {
        userId: formData.userId.value,
        day: day.format('YYYY-MM-DD'),
        dayOfWeek: capitalizedDayOfWeek,
        hour: formData.hour.value,
      };

      createReservation(reservationData);
      fetchWeeklyReservations(moment(currentDate).startOf('isoWeek').toDate());
    }

    handleCloseReservationForm();
    setIsWeeklyReservation(false);
  };





  const createReservation = (reservationData) => {
    fetch(`${environment.apiURL}/api/reservations`, {
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
    { value: '16:00', label: '04:00 pm' },
    { value: '17:00', label: '05:00 pm' },
    { value: '18:00', label: '06:00 pm' },
    { value: '19:00', label: '07:00 pm' },
    { value: '20:00', label: '08:00 pm' },
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
  const handlePreviousMonth = () => {
    const previousMonth = moment(currentDate).subtract(1, 'month').startOf('month').toDate();
    setCurrentDate(previousMonth);
    fetchWeeklyReservations(previousMonth);
  };

  const handleCurrentWeek = () => {
    const currentWeek = moment().startOf('isoWeek');
    setCurrentDate(currentWeek);
    fetchWeeklyReservations(currentWeek.toDate());
  };

  const getSpaceAvailable = (day, hour) => {
    const morningHours = ['06:00', '07:00', '08:00', '09:00', '10:00'];
    const isMorning = morningHours.includes(hour);
    const isSaturday = day === 'Sábado';

    return Array(maxSpacesPerHour).fill(!isSaturday || isMorning);
  };




  const renderTableRows = () => {
    const allHours = [...morningHours, ...afternoonHours];

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
      'No': { backgroundColor: '#fc4646' },
    };

    return allHours.map((hour, hourIndex) => (
      <tr key={hourIndex} className={hour === '10:00' ? 'morning-end-row' : ''}>
        <td className="first-column">{hour}</td>
        {moment.weekdays().slice(1).map((day, dayIndex) => {
          if (day === 'sábado' && !morningHours.includes(hour)) {
            return <td key={dayIndex} style={{ backgroundColor: 'gray' }}> </td>;
          }
          const key = `${day}-${hour}`;
          const isEnabled = selectEnabled[key] !== false;
          const currentDay = moment(currentDate).startOf('isoWeek').add(dayIndex, 'days').format('YYYY-MM-DD');
          const reservationsForCell = weeklyReservations.filter(
            (reservation) => reservation.day === currentDay && reservation.hour === hour
          );
          const spaceAvailable = getSpaceAvailable(day, hour);

          const reservationCells = spaceAvailable.map((available, index) => {
            const reservation = reservationsForCell[index];

            if (available) {
              if (reservation) {
                const fullName = `${reservation.userName} ${reservation.userLastName}`;
                const userFullName = fullName.length > 20 ? fullName.slice(0, 20) + '...' : fullName;
                return (
                  <div key={reservation._id} className="reservation-cell bordered-cell">
                    <div className="subcolumn name">{userFullName}</div>
                    <div className="subcolumn training-type">
                      <select
                        style={trainingTypeStyles[reservation.TrainingType]}
                        className="trainingType"
                        value={reservation.TrainingType}
                        onChange={(event) => updateTrainingType(reservation._id, event.target.value)}
                      >
                        <option value=' '> </option>
                        <option value='Tren Superior'>Superior</option>
                        <option value='Jalon'>Jalon</option>
                        <option value='Empuje'>Empuje</option>
                        <option value='Brazo'>Brazo</option>
                        <option value='Pierna'>Pierna</option>
                        <option value='Gluteo'>Gluteo</option>
                        <option value='Cardio'>Cardio</option>
                        <option value='Primer dia'>FullBody</option>
                      </select>
                    </div>
                    <div className="subcolumn attendance">
                      <select
                        style={attendanceStyles[reservation.Attendance]}
                        className="attendance"
                        value={reservation.Attendance}
                        onChange={(event) => handleAttendanceChange(reservation._id, event.target.value)}
                      >
                        <option value=" "></option>
                        <option value="No">✖</option>
                      </select>
                    </div>
                    <div className="subcolumn actions">
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="delete-icon"
                        onClick={() => handleDeleteReservation(reservation._id)}
                        style={{ color: 'red', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={`empty-${index}`} className="reservation-cell bordered-cell">
                    <Select
                      key={`select-user-${resetCounter}`}
                      options={users.map((user) => ({
                        value: user._id,
                        label: `${user.FirstName} ${user.LastName}`,
                      }))}
                      onChange={(selectedOption) => handleCreateReservationFromTable(selectedOption.value, currentDay, hour)}
                      isDisabled={!isEnabled}
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
            } else {
              return <div key={`disabled-${index}`} className="reservation-cell-disabled"></div>;
            }
          });

          return <td key={dayIndex}>{reservationCells}</td>;
        })}
      </tr>
    ));
  };



  return (
    <div className={`Diary-container ${loading ? 'fade-in' : 'fade-out'}`}>
      <h2 className='title'>Agenda Semanal</h2>
      <div className="filter-controls-diary">
        <button className='butom-day-diary' onClick={handlePreviousWeek}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button className='butom-day-diary' onClick={handleCurrentWeek}>
          <FontAwesomeIcon icon={faCalendarDay} />
        </button>
        <button className='butom-day-diary' onClick={handleNextWeek}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
        <button className='butom-day-diary' onClick={handlePreviousMonth}>
          <FontAwesomeIcon icon={faCalendarMinus} />
        </button>
        <button className='butom-day-diary' onClick={handleNextMonth}>
          <FontAwesomeIcon icon={faCalendarPlus} />
        </button>
        <button className='butom-day-diary' onClick={handleOpenReservationForm}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <Link to={`/userList/${id}`}>
          <button className='butom-day-diary' >
            <FontAwesomeIcon icon={faUserFriends} />
          </button>
        </Link>
        <Link to={`/finances/${id}`}>
          <button className='butom-day-diary' >
            <FontAwesomeIcon icon={faDollarSign} />
          </button>
        </Link>
        <Link to={`/quotaLimits/${id}`}>
          <button className='butom-day-diary-avilable' >
            Cupos/hora
          </button>
        </Link>
        <button className='butom-delete' onClick={() => setShowDeleteModal(true)}>
          Eliminar Reservas
        </button>
        <Link to={`/admin/${id}`}>
          <button className='butom-day-diary' >
            <FontAwesomeIcon icon={faHome} />
          </button>
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
              required
            />
            <label>Hora:</label>
            <Select
              options={availableHours}
              value={formData.hour}
              onChange={(selectedOption) => handleChange('hour', selectedOption)}
              required
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
            <div className="reservation-form-checkbox">
              <input
                type="checkbox"
                id="weekly-reservation-checkbox"
                checked={isWeeklyReservation}
                onChange={(e) => setIsWeeklyReservation(e.target.checked)}
              />
              <label htmlFor="weekly-reservation-checkbox">Reservar Semana</label>
            </div>
            {isWeeklyReservation && (
              <>
                <label>Seleccionar Semana:</label>
                <Select
                  options={weekOptions}
                  onChange={(selectedOption) => handleChange('week', selectedOption)}
                />
              </>
            )}
            <button className='buttom-modal' onClick={handleSaveMonthlyReservation}>Reservar Mes</button>
            <button className='buttom-modal' onClick={handleSaveWeeklyReservation}>Reservar Semana</button>
            <button className='buttom-modal' onClick={handleSaveReservation}>Reservar día</button>
            <button className='buttom-modal' onClick={handleCloseReservationForm}>Cancelar</button>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="overlay">
          <div className="reservation-form">
            <h3>Eliminar Reservas </h3>
            <Select
              options={users.map((user) => ({
                value: user._id,
                label: `${user.FirstName} ${user.LastName}`,
              }))}
              onChange={(selectedOption) => handleUserSelection(selectedOption.value)}
              placeholder="Seleccionar usuario"
            />
            <DatePicker
              selected={deletionDate}
              onChange={handleDeletionDateChange}
              dateFormat="yyyy-MM-dd"
            />
            <button className='buttom-modal' onClick={handleDeleteUserReservations}>Eliminar</button>
            <button className='buttom-modal' onClick={() => setShowDeleteModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

    </div>
  );

};

export default Diary;
