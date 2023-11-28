import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`http://localhost:8084/api/reservations/${id}`);
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
        const response = await fetch(`http://localhost:8084/api/users/${id}`);
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
        const response = await fetch(`http://localhost:8084/api/reservationsid/${id}`);
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        const data = await response.json();
        setUserReservations(data);
        console.log(' fetchUserReservations', data)

        // Verificar si hay alguna reserva al cargar el componente
        checkAndSetReservationStatus(data);
      } catch (error) {
        console.error(error);
        Swal.fire('Error al obtener las reservas del usuario', 'Ha ocurrido un error al cargar las reservas del usuario.', 'error');
      }
    };

    // Nueva solicitud GET al inicializar el componente para obtener las reservas actualizadas del usuario
    fetchUserReservations();

    fetchReservations();
    fetchUser();
  }, [id]);

  const checkAndSetReservationStatus = (userReservationsData) => {
    // Verificar si hay reserva y actualizar el estado
    const reservation = userReservationsData.find(
      (reservation) => reservation.day === reservationStatus?.day && reservation.hour === reservationStatus?.hour
    );
    if (reservation) {
      setReservationStatus({ day: reservation.day, hour: reservation.hour });
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch(`http://localhost:8084/api/reservations/${id}`);
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
    setSelectedDate(moment(selectedDate).add(daysToAdd, 'days'));
  };

  const handleReserveClick = async (dayIndex, hour) => {
    const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
    const timeKey = `${hour < 10 ? '' : ''}${hour}:00`;

    const reservationForCell = userReservations.find(
      (reservation) => reservation.day === dateKey && reservation.hour === timeKey
    );

    if (reservationForCell) {
      Swal.fire('Hora ya reservada', 'Esta hora ya ha sido reservada por otro usuario.', 'warning');
    } else {
      try {
        const response = await fetch('http://localhost:8084/api/reservations', {
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
          // Actualizar las reservas después de una reserva exitosa
          const updatedReservations = { ...reservationsData };
          if (!updatedReservations[dateKey]) {
            updatedReservations[dateKey] = {};
          }
          updatedReservations[dateKey][timeKey] = user.IdentificationNumber;
          setReservationsData(updatedReservations);

          // Realizar la solicitud GET general después de un POST exitoso
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
              // Realizar la solicitud GET para verificar si hay reserva en este día y hora
              try {
                const getResponse = await fetch(`http://localhost:8084/api/reservations?userId=${user._id}&day=${dateKey}&hour=${timeKey}`);

                if (getResponse.ok) {
                  const data = await getResponse.json();
                  if (data.length > 0) {
                    // Si hay reserva, actualizar el estado para mostrar "Reservado"
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
  
      // Ajuste para manejar el formato de dos dígitos en la base de datos
      const formattedTimeKey = timeKey.length === 4 ? `0${timeKey}` : timeKey;
  
      return reservationsForDay[formattedTimeKey] && user ? reservationsForDay[formattedTimeKey] === user._id : false;
    }
  
    return false;
  };

  const getReservationsForDay = (dayIndex) => {
    const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
    return reservationsData[dateKey] || {};
  };

  const formatHour = (hour) => {
    return hour >= 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const renderTableRows = () => {
    return morningHours.map((hour) => (
      <tr key={hour}>
        <td>{formatHour(hour)}</td>
        {daysOfWeek.map((_, dayIndex) => {
          const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
          const reservationForCell = userReservations.find(
            (reservation) => reservation.day === dateKey && reservation.hour === `${hour}:00`
          );
  
          const isReserved = reservationStatus && reservationStatus.day === dateKey && reservationStatus.hour === `${hour}:00`;
  
          return (
            <td key={dayIndex}>
              {isHourValid(dayIndex, hour) && (
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
            </td>
          );
        })}
      </tr>
    ));
  };
  return (
    <div className="reservations-container">
      <h2>Horario de Reservas</h2>
      <div className="table-container">
        <div className="date-navigation-reservation">
          <Link to={`/customers/${id}`}>
            <button>Inicio</button>
          </Link>
          <button onClick={() => handleDateChange(-7)}>Semana Anterior</button>
          <button onClick={() => handleDateChange(7)}>Semana Siguiente</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              {daysOfWeek.map((day, i) => (
                <th key={i}>
                  {day}
                  <br />
                  {moment(selectedDate).add(i, 'days').format('MMMM D')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Reservations;