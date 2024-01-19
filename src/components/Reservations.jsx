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
import { environment } from '../environments';
import axios from 'axios';

const morningHours = [...Array(15).keys()].map((hour) => (hour + 6).toString().padStart(2, '0')); // 06:00 am to 08:00 pm
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
  const [slotInfo, setSlotInfo] = useState({});
  const [monthlyReservationData, setMonthlyReservationData] = useState({
    hour: '',
    startDate: '',
    endDate: '',
  });



  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`${environment.apiURL}/api/reservations/${id}`);
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
        const response = await fetch(`${environment.apiURL}/api/users/${id}`);
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
        const response = await fetch(`${environment.apiURL}/api/reservationsid/${id}`);
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

  const fetchAllReservations = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/reservations`);
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      const data = await response.json();
      const reservationsByDayAndHour = {};
      data.forEach((reservation) => {
        const dayHourKey = `${reservation.dayOfWeek}-${reservation.hour}`;
        if (!reservationsByDayAndHour[dayHourKey]) {
          reservationsByDayAndHour[dayHourKey] = 0;
        }
        reservationsByDayAndHour[dayHourKey]++;
      });
  
      setReservationsData(reservationsByDayAndHour);
    } catch (error) {
      console.error(error);
      Swal.fire('Error al obtener las reservas', 'Ha ocurrido un error al cargar las reservas del usuario.', 'error');
    }
  };
  const fetchSlotInfo = async () => {
    try {
      const response = await axios.get(`${environment.apiURL}/api/slots`);
      const slots = response.data.reduce((acc, slot) => {
        const slotKey = `${slot.day}-${slot.hour}`;
        acc[slotKey] = slot.slots;
        return acc;
      }, {});
      setSlotInfo(slots);
    } catch (error) {
      console.error('Error fetching slot info:', error);
    }
  };

  

  useEffect(() => {
    fetchAllReservations()
    fetchSlotInfo();
  }, []); 


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
      const response = await fetch(`${environment.apiURL}/api/reservations/${id}`);
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
    const timeKey = `${hour < 10 ? '0' : ''}${hour}:00`;
    const dayOfWeek = daysOfWeek[dayIndex];
    const now = moment().tz('America/Bogota');
    const reservationDateTime = moment.tz(`${dayOfWeek} ${timeKey}`, 'America/Bogota');
    
    const currentReservationsCount = reservationsData[`${dayOfWeek}-${timeKey}`] || 0;
    const availableSlots = slotInfo[`${dayOfWeek}-${timeKey}`] || 0;
    console.log('Slot Info State:', slotInfo);
    console.log('Reservations Data State:', reservationsData);
    console.log('Current Reservations Count:', currentReservationsCount);
    console.log('Available Slots:', availableSlots);
    
    const currentTime = moment();
    const isCurrentTimeRestricted = currentTime.hour() >= 21 || currentTime.hour() < 5 || 
                                  (currentTime.hour() === 5 && currentTime.minute() < 30);
    
    if (isCurrentTimeRestricted) {
      Swal.fire('Reserva No Permitida', 'No se puede realizar reservas entre las 9 PM y las 5:30 AM.', 'error');
      return;
    }
    
    if (currentReservationsCount >= availableSlots) {
      Swal.fire('Cupo lleno', 'No hay más cupos disponibles para esta hora.', 'warning');
      return;
    }

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
          const response = await fetch(`${environment.apiURL}/api/reservations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user._id,
              day: dateKey,
              dayOfWeek: dayOfWeek,
              hour: timeKey,
            }),
          });

          if (response.ok) {
            const updatedReservations = { ...reservationsData };
            console.log(reservationsData)
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
                  const getResponse = await fetch(`${environment.apiURL}/api/reservations?userId=${user._id}&day=${dateKey}&hour=${timeKey}`);
                  fetchReservations();
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


  const handleSaveMonthlyReservation = async () => {
    const startDate = moment(monthlyReservationData.startDate);
    const endDate = moment(startDate).add(1, 'month');

    for (let date = moment(startDate); date.isBefore(endDate); date.add(1, 'day')) {
      if (date.isoWeekday() <= 5) {
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

    return morningHours.map((hour, hourIndex) => {
      const hourInt = parseInt(hour, 10);

      if (hourInt >= 11 && hourInt <= 15) {
        return (
          <tr key={hour} >
            {daysOfWeek.map((_, dayIndex) => {
              if (dayIndex === 0 && hourInt === hourInt >= 11 && hourInt <= 15) {
                return <td key={dayIndex} rowSpan="4" colSpan={daysOfWeek.length} className={hour === '10' ? 'morning-end-row-reservation' : ''}></td>;
              }
              return null;
            })}
          </tr>
        );
      } else {
        return (
          <tr key={hour} className={hour === '10' ? 'morning-end-row-reservation' : ''}>
            <td className="hour-cell">{formatHour(hourInt)}</td>
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
              const isCurrentHourOrPast = isCurrentDay && currentHour >= hourInt;

              return (
                <td key={dayIndex}>
                  {isHourValid(dayIndex, hourInt) && (
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
                                  onClick={() => handleReserveClick(dayIndex, hourInt)}
                                  disabled={isHourReserved(dayIndex, hourInt)}
                                  className={isHourReserved(dayIndex, hourInt) ? 'reserved-button' : ''}
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
        );
      }
    });
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