import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import 'moment/locale/es';
import '../components/styles/Reservations.css';


const morningHours = [...Array(16).keys()].map((hour) => (hour + 6).toString().padStart(2, '0')); // 06:00 am to 09:00 pm
const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const Reservations = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment().startOf('week'));
  const [reservationsData, setReservationsData] = useState({});
  const [userReservations, setUserReservations] = useState([]);
  const [reservationStatus, setReservationStatus] = useState(null);
  const navigate = useNavigate();
  const [showMonthlyReservationForm, setShowMonthlyReservationForm] = useState(false);
  const [monthlyReservationData, setMonthlyReservationData] = useState({
    hour: '',
    startDate: '',
    endDate: '',
  });



  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`https://bullfit-back.onrender.com/api/reservations/${id}`);
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        const data = await response.json();
        setReservationsData(data);
      } catch (error) {
        console.error(error);
        Swal.fire('Error al obtener las reservas', 'Ha ocurrido un error al cargar las reservas del usuario.', 'error');
      }
    };

    const fetchUser = async () => {
      try {
        const response = await fetch(`https://bullfit-back.onrender.com/api/users/${id}`);
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        Swal.fire('Error al obtener los datos del usuario', 'Ha ocurrido un error al cargar los datos del usuario.', 'error');
      }
    };

    const fetchUserReservations = async () => {
      try {
        const response = await fetch(`https://bullfit-back.onrender.com/api/reservationsid/${id}`);
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        const data = await response.json();
        setUserReservations(data);

        checkAndSetReservationStatus(data);
      } catch (error) {
        console.error(error);
        Swal.fire('Error al obtener las reservas del usuario', 'Ha ocurrido un error al cargar las reservas del usuario.', 'error');
      }
    };

    fetchUserReservations();
    fetchReservations();
    fetchUser();
  }, [id]);

  const checkAndSetReservationStatus = (userReservationsData) => {
    const reservation = userReservationsData.find(
      (reservation) => reservation.day === reservationStatus?.day && reservation.hour === reservationStatus?.hour
    );
    if (reservation) {
      setReservationStatus({ day: reservation.day, hour: reservation.hour });
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch(`https://bullfit-back.onrender.com/api/reservations/${id}`);
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      const data = await response.json();
      setReservationsData(data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error al obtener las reservas', 'Ha ocurrido un error al cargar las reservas del usuario.', 'error');
    }
  };



  const handleDateChange = (daysToAdd) => {
    const newSelectedDate = moment(selectedDate).add(daysToAdd, 'days').startOf('week');
    setSelectedDate(newSelectedDate);
  };
  const handleOpenMonthlyReservationForm = () => {
    setShowMonthlyReservationForm(true);
  };
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    const newEndDate = moment(newStartDate).add(1, 'month').format('YYYY-MM-DD');

    setMonthlyReservationData({
      ...monthlyReservationData,
      startDate: newStartDate,
      endDate: newEndDate,
    });
  };


  const getReservationsCountForDay = (dateKey) => {
    const reservationsForDay = reservationsData[dateKey] || {};
    return Object.values(reservationsForDay).length;
  };

  const handleReserveClick = async (dayIndex, hour) => {
    const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
    const timeKey = `${hour < 10 ? '' : ''}${hour}:00`;

    const now = moment().utcOffset(-5);
    const reservationDateTime = moment.tz(`${dateKey} ${timeKey}`, 'America/Bogota');

    if (reservationDateTime.diff(now, 'hours') < 2) {
      Swal.fire('Error en la reserva', 'Solo puedes reservar hasta dos horas antes del evento.', 'error');
      return;
    }

    const reservationsCountForDay = getReservationsCountForDay(dateKey);
    const maxReservationsPerDay = 8;

    if (reservationsCountForDay >= maxReservationsPerDay) {
      Swal.fire('Cupo lleno', 'No hay más cupos disponibles para este día.', 'warning');
    } else {

      const existingReservationForDay = userReservations.find(
        (reservation) => reservation.day === dateKey && reservation.userId === id
      );

      if (existingReservationForDay) {
        Swal.fire('Ya has reservado para este día', 'Solo se permite una reserva por día.', 'warning');
        return;
      } else {
        try {
          const response = await fetch('https://bullfit-back.onrender.com/api/reservations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user._id,
              day: dateKey,
              hour: timeKey,
            }),
          });

          if (response.ok) {
            const updatedReservations = { ...reservationsData };
            if (!updatedReservations[dateKey]) {
              updatedReservations[dateKey] = {};
            }
            updatedReservations[dateKey][timeKey] = user._id;
            setReservationsData(updatedReservations);

            await fetchReservations();

            Swal.fire({
              title: 'Reserva Exitosa',
              text: 'Has reservado con éxito.',
              icon: 'success',
              showCancelButton: true,
              confirmButtonText: 'Seguir reservando',
              cancelButtonText: 'Salir',
            }).then(async (result) => {
              if (!result.isConfirmed) {
                navigate(`/customers/${id}`);
              } else {
                try {
                  const getResponse = await fetch(`https://bullfit-back.onrender.com/api/reservations?userId=${user._id}&day=${dateKey}&hour=${timeKey}`);

                  if (getResponse.ok) {
                    const data = await getResponse.json();
                    if (data.length > 0) {
                      setReservationStatus({ day: dateKey, hour: timeKey });
                    }
                  } else {
                    console.error('Error al obtener la reserva');
                  }
                  window.location.reload();
                } catch (error) {
                  console.error('Error al realizar la solicitud:', error);
                }
              }
            });
          } else {
            console.error('Error al realizar la reserva');
            Swal.fire('Error al guardar la reserva', 'Ha ocurrido un error al guardar la reserva.', 'error');
          }

        } catch (error) {
          console.error('Error al realizar la solicitud:', error);
          Swal.fire('Error al guardar la reserva', 'Ha ocurrido un error al guardar la reserva.', 'error');
        }
      }
    }
  };

  const isHourValid = (dayIndex, hour) => {
    if (dayIndex === 5) {
      return hour >= 7 && hour <= 10;
    } else {
      return (hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20);
    }
  };

  const isHourReserved = (dayIndex, hour) => {
    const reservationsForDay = getReservationsForDay(dayIndex);

    if (reservationsForDay) {
      const timeKey = `${hour < 10 ? '0' : ''}${hour}:00`;
      const formattedTimeKey = timeKey.length === 4 ? `0${timeKey}` : timeKey;

      return reservationsForDay[formattedTimeKey] && user ? reservationsForDay[formattedTimeKey] === user._id : false;
    }

    return false;
  };

  const getReservationsForDay = (dayIndex) => {
    const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
    return reservationsData[dateKey] || {};
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


  const handleSaveMonthlyReservation = async () => {
    const startDate = moment(monthlyReservationData.startDate);
    const endDate = moment(startDate).add(1, 'month');
  
    for (let date = moment(startDate); date.isBefore(endDate); date.add(1, 'day')) {
      if (date.isoWeekday() <= 5) { // Lunes a Viernes
        const reservationData = {
          userId: id,
          day: date.format('YYYY-MM-DD'),
          hour: monthlyReservationData.hour ? monthlyReservationData.hour.value : null,
        };
  
        try {
          await createReservation(reservationData);
        } catch (error) {
          console.error('Error al crear reserva:', error);
        }
      }
    }
  
    setShowMonthlyReservationForm(false);
    Swal.fire({
      title: 'Reserva Creada',
      text: 'Las reservas mensuales están siendo procesadas.',
      icon: 'success'
    }).then(() => {
      fetchReservations(); 
      window.location.reload();
    });
  };
  

  const handleChange = (name, value) => {
    setMonthlyReservationData({
      ...monthlyReservationData,
      [name]: value,
    });
  };
  const availableHours = [
    { value: ' ', label: ' ' },
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

  const formatHour = (hour) => {
    return hour >= 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const renderTableHeaders = () => {
    return (
      <tr>
        <th className="hour-column">Hora</th>
        {daysOfWeek.map((day, i) => {
          const dayHeaderClass = (() => {
            switch (i) {
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
            <th key={i} className={dayHeaderClass}>
              {day} {moment(selectedDate).add(i, 'days').format('D')}
            </th>
          );
        })}
      </tr>
    );
  };



  const renderTableRows = () => {
    const currentDay = moment().startOf('day');
    const currentHour = moment().hour();

    return morningHours.map((hour) => (
      <tr key={hour}>
        <td className="hour-cell">{formatHour(hour)}</td>
        {daysOfWeek.map((_, dayIndex) => {
          const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
          const reservationForCell = userReservations.find(
            (reservation) =>
              reservation.day === dateKey &&
              reservation.hour === `${hour}:00` &&
              reservation.userId === id
          );

          const isReserved = reservationStatus && reservationStatus.day === dateKey && reservationStatus.hour === `${hour}:00`;

          const isPastDay = moment(dateKey).isBefore(moment().startOf('day'), 'day');
          const isCurrentDay = moment(dateKey).isSame(currentDay, 'day');
          const isCurrentHourOrPast = isCurrentDay && currentHour >= parseInt(hour, 10);

          return (
            <td key={dayIndex} >
              {isHourValid(dayIndex, hour) && (
                <>
                  {isCurrentHourOrPast ? (
                    <FontAwesomeIcon icon={faClock} className="past-day-icon" />
                  ) : (
                    <>
                      {isPastDay ? (
                        <FontAwesomeIcon icon={faClock} className="past-day-icon" />
                      ) : (
                        <>
                          {reservationForCell || isReserved ? (
                            <span className="reserved-text">Reservado</span>
                          ) : (
                            <button
                              onClick={() => handleReserveClick(dayIndex, hour)}
                              disabled={isHourReserved(dayIndex, hour)}
                              className={isHourReserved(dayIndex, hour) ? 'reserved-button' : ''}
                            >
                              Reservar
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <div className="reservations-container">
      <h2>Horario de Reservas de {moment(selectedDate).format('MMMM')}</h2>
      <div className="table-container">
      <div className="date-navigation-reservation">
        <Link to={`/customers/${id}`}>
          <button>Inicio</button>
        </Link>
        {user && user.Plan === 'Mensual' && (
          <button onClick={handleOpenMonthlyReservationForm}>Reserva Mensual</button>
        )}
        <button onClick={() => handleDateChange(-7)}>Semana Anterior</button>
        <button onClick={() => handleDateChange(7)}>Semana Siguiente</button>
      </div>
        <table>
          <thead>
            {renderTableHeaders()}
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </div>
      {showMonthlyReservationForm && (
        <div className="overlay">
          <div className="reservation-form">
            <label>Hora:</label>
            <Select
              options={availableHours}
              value={monthlyReservationData.hour}
              onChange={(selectedOption) => handleChange('hour', selectedOption)}
              placeholder="Selecciona una hora"
            />

            <label>Fecha de inicio:</label>
            <input
              type="date"
              value={monthlyReservationData.startDate}
              onChange={handleStartDateChange}
            />
            {monthlyReservationData.startDate && (
              <p>Fecha de finalización: {monthlyReservationData.endDate}</p>
            )}
            <button onClick={handleSaveMonthlyReservation}>Guardar Reservas</button>
            <button onClick={() => setShowMonthlyReservationForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reservations;