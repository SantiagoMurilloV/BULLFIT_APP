import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'moment/locale/es';
import '../components/styles/Reservations.css';

const EditReservations = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment().startOf('week'));
  const [reservedHours, setReservedHours] = useState({});
  const [reservationsData, setReservationsData] = useState({});
  const morningHours = [...Array(16).keys()].map((hour) => hour + 6); // 6 am to 9 pm
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];


  useEffect(() => {
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
    const reservationsForDay = getReservationsForDay(dayIndex);

    if (reservationsForDay[`${hour}:00`]) {
      Swal.fire('Hora ya reservada', 'Esta hora ya ha sido reservada por otro usuario.', 'warning');
      return;
    }

    setReservedHours({
      ...reservedHours,
      [`${dayIndex}-${hour}`]: true,
    });

    const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
    const timeKey = `${hour}:00`;


    setReservationsData((prevData) => ({
      ...prevData,
      [dateKey]: {
        ...(prevData[dateKey] || {}),
        [timeKey]: user.IdentificationNumber,
      },
    }));
  };


  const handleEditOrDeleteReserve = (dayIndex, hour) => {

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

    if (reservationsForDay && reservationsForDay[`${hour}:00`] && user) {
      return reservationsForDay[`${hour}:00`] === user.IdentificationNumber;
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
              <div className="reservation-cell">
                {isHourReserved(i, hour) ? (
                  <button className="reserved-button" onClick={() => handleEditOrDeleteReserve(i, hour)}>
                    Reservado
                  </button>
                ) : (
                  <button
                    className={`available-button${isHourReserved(i, hour) ? ' reserved' : ''}`}
                    onClick={() => handleReserveClick(i, hour)}
                    disabled={isHourReserved(i, hour)}
                  >
                    Reservar
                  </button>
                )}
              </div>
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
      <h2>Editar Reservas</h2>
      <div className="table-container">
        <div>
          <Link to={`/customers/${id}`}>
            <button>Regresar a Perfil</button>
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

export default EditReservations;
