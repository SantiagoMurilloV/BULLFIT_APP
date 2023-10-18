import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom'; 

import 'moment/locale/es';
import '../components/styles/Reservations.css';

const morningHours = [...Array(16).keys()].map((hour) => hour + 6); // 6 am to 9 pm
const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const Reservations = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState(moment().startOf('week'));

  const [reservedHours, setReservedHours] = useState({});
  const [reservationsData, setReservationsData] = useState({});

  useEffect(() => {
    const storedReservations = localStorage.getItem('reservationsData');
    if (storedReservations) {
      setReservationsData(JSON.parse(storedReservations));
    }
  }, []);

  const handleDateChange = (daysToAdd) => {
    setSelectedDate(moment(selectedDate).add(daysToAdd, 'days'));
  };

  const formatHour = (hour) => {
    return hour >= 12 ? `${hour - 12} PM` : `${hour} AM`;
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

  const isHourValid = (dayIndex, hour) => {
    if (dayIndex === 5) {
      // Saturday: Only allow reservations between 7 AM and 10 AM
      return hour >= 7 && hour <= 10;
    } else {
      // Weekdays: Allow reservations in the morning (6 AM to 10 AM) and afternoon (after 4 PM)
      return (hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20);
    }
  };

  const handleReserveClick = (dayIndex, hour) => {
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

    localStorage.setItem('reservationsData', JSON.stringify(reservationsData));
  };

  const renderTableRows = () => {
    const tableRows = morningHours.map((hour) => (
      <tr key={hour}>
        <td>{formatHour(hour)}</td>
        {daysOfWeek.map((_, i) => (
          <td key={i}>
            {isHourValid(i, hour) && (
              <button
                className={`available-button${reservedHours[`${i}-${hour}`] ? ' reserved' : ''}`}
                onClick={() => handleReserveClick(i, hour)}
                disabled={reservedHours[`${i}-${hour}`]}
              >
                {reservedHours[`${i}-${hour}`] ? 'Reservado' : 'Reservar'}
              </button>
            )}
          </td>
        ))}
      </tr>
    ));
    return tableRows;
  };

  return (
    <div className="reservations-container">
      <h2>Horario de Reservas</h2>
      <div className="table-container">
        <div>
        <Link to="/customers"> {/* Esto redirigirá al usuario a la vista "Customers" */}
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
