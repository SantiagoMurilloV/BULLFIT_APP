import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import 'moment/locale/es';
import '../components/styles/Reservations.css';

const morningHours = [...Array(16).keys()].map((hour) => hour + 6); // 6 am to 9 pm
const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const Reservations = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment().startOf('week'));
  const [reservedHours, setReservedHours] = useState({});
  const [reservationsData, setReservationsData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {

    const storedReservations = JSON.parse(localStorage.getItem(`reservationsData_${id}`));
    if (storedReservations) {
      setReservationsData(storedReservations);
    }

    fetch(`http://localhost:8084/api/reservations/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setReservationsData(data);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire('Error al obtener las reservas', 'Ha ocurrido un error al cargar las reservas del usuario.', 'error');
      });

    fetch(`http://localhost:8084/api/users/${id}`)
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

  }, [id]);

  const handleDateChange = (daysToAdd) => {
    setSelectedDate(moment(selectedDate).add(daysToAdd, 'days'));
  };

  const getReservationsForDay = (dayIndex) => {
    const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
    return reservationsData[dateKey] || {};
  };

  const formatHour = (hour) => {
    return hour >= 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  
  const handleReserveClick = (dayIndex, hour) => {
    const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
    const timeKey = `${hour}:00`;

    if (reservationsData[dateKey] && reservationsData[dateKey][timeKey]) {
      Swal.fire('Hora ya reservada', 'Esta hora ya ha sido reservada por otro usuario.', 'warning');
      return;
    }

    fetch('http://localhost:8084/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user._id,
        day: dateKey,
        hour: timeKey,
      }),
    })
      .then((response) => {
        if (response.status === 201) {
          Swal.fire('Reserva Exitosa', 'Has reservado con éxito.', 'success');


          const updatedReservations = {
            ...reservationsData,
            [dateKey]: {
              ...reservationsData[dateKey],
              [timeKey]: user.IdentificationNumber,
            },
          };
          setReservationsData(updatedReservations);
          localStorage.setItem(`reservationsData_${id}`, JSON.stringify(updatedReservations));

          return fetch(`http://localhost:8084/api/reservations/${id}`);
        }
      })
      .then((response) => {
        if (response && response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        setReservationsData(data);
      })
      .catch((error) => {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error al guardar la reserva', 'Ha ocurrido un error al guardar la reserva.', 'error');
      });
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
      return reservationsForDay[timeKey] && user ? reservationsForDay[timeKey] === user.IdentificationNumber : false;
    }
  
    return false;
  };
  

  const renderTableRows = () => {
    const tableRows = morningHours.map((hour) => (
      <tr key={hour}>
        <td>{formatHour(hour)}</td>
        {daysOfWeek.map((_, i) => (
          <td key={i}>
            {isHourValid(i, hour) && (
              <button
                className={`available-button${isHourReserved(i, hour) ? ' reserved' : ''}`}
                onClick={() => handleReserveClick(i, hour)}
                disabled={isHourReserved(i, hour)}
              >
                {isHourReserved(i, hour) ? 'Reservado' : 'Reservar'}
              </button>
            )}
          </td>
        ))}
      </tr>
    ));
    return tableRows;
  };

  const renderTableHeaders = () => {
    const tableHeaders = daysOfWeek.map((day, i) => (
      <th key={i}>
        {day}
        <br />
        {moment(selectedDate).add(i, 'days').format('MMMM D')}
      </th>
    ));
    return tableHeaders;
  };

  return (
    <div className="reservations-container">
      <h2>Horario de Reservas</h2>
      <div className="table-container">
        <div>
          <Link to={`/customers/${id}`}>
            <button>Regresar a Customers</button>
          </Link>
          <button onClick={() => handleDateChange(-7)}>Semana Anterior</button>
          <button onClick={() => handleDateChange(7)}>Semana Siguiente</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              {renderTableHeaders()}
            </tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Reservations;
