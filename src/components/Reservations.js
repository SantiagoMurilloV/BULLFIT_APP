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
    fetch(`http://localhost:8084/api/reservations/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setReservationsData(data);
        console.log('reservation',data)
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

  const saveReservationsToServer = () => {
    const reservations = {};

    Object.keys(reservationsData).forEach((date) => {
      reservations[date] = Object.keys(reservationsData[date]);
    });

    fetch('http://localhost:8084/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user._id,
        reservations: reservations,
      }),
    })
      .then((response) => {
        if (response.status === 201) {
          Swal.fire('Reservas Guardadas', 'Tus reservas se han guardado con éxito.', 'success');
          navigate(`/customers/${id}`);
        }
      })
      .catch((error) => {
        console.error('Error al realizar la solicitud:', error);
        Swal.fire('Error al guardar las reservas', 'Ha ocurrido un error al guardar las reservas.', 'error');
      });
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
      <div className="save">
        <button onClick={saveReservationsToServer}>Guardar Reservas en el Servidor</button>
      </div>
    </div>
  );
};

export default Reservations;






// import React, { useState, useEffect } from 'react';
// import moment from 'moment';
// import { Link, useParams } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import { useNavigate } from 'react-router-dom';
// import 'moment/locale/es';
// import '../components/styles/Reservations.css';

// const morningHours = [...Array(16).keys()].map((hour) => hour + 6); // 6 am to 9 pm
// const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// const Reservations = () => {
//   const { id } = useParams();
//   const [user, setUser] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(moment().startOf('week'));
//   const [reservedHours, setReservedHours] = useState({});
//   const [reservationsData, setReservationsData] = useState({});

//   const navigate = useNavigate();

//   useEffect(() => {
//     // Realiza una solicitud GET para obtener las reservas del usuario
//     fetch(`http://localhost:8084/api/reservations/${id}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error('Error en la solicitud');
//         }
//         return response.json();
//       })
//       .then((data) => {
//         setReservationsData(data.reservations);
//         markReservedHours(data.reservations); // Llama a la función para marcar las horas reservadas
//       })
//       .catch((error) => {
//         console.error(error);
//         Swal.fire('Error al obtener las reservas', 'Ha ocurrido un error al cargar las reservas del usuario.', 'error');
//       });

//     // También puedes obtener los datos del usuario aquí si es necesario
//     fetch(`http://localhost:8084/api/users/${id}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw an Error('Error en la solicitud');
//         }
//         return response.json();
//       })
//       .then((data) => {
//         setUser(data);
//       })
//       .catch((error) => {
//         console.error(error);
//         Swal.fire('Error al obtener los datos del usuario', 'Ha ocurrido un error al cargar los datos del usuario.', 'error');
//       });
//   }, [id]);

//   const handleDateChange = (daysToAdd) => {
//     setSelectedDate(moment(selectedDate).add(daysToAdd, 'days'));
//   };

//   const markReservedHours = (reservations) => {
//     const reserved = {};

//     Object.keys(reservations).forEach((date) => {
//       const hours = reservations[date];
//       hours.forEach((hour) => {
//         reserved[`${date}-${hour}`] = true;
//       });
//     });

//     setReservedHours(reserved);
//   };

//   const getReservationsForDay = (dayIndex) => {
//     const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
//     return reservationsData[dateKey] || [];
//   };

//   const formatHour = (hour) => {
//     return hour >= 12 ? `${hour - 12} PM` : `${hour} AM`;
//   };

//   const handleReserveClick = (dayIndex, hour) => {
//     const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
//     const timeKey = `${hour}:00`;

//     if (reservedHours[`${dateKey}-${timeKey}`]) {
//       Swal.fire('Hora ya reservada', 'Esta hora ya ha sido reservada por otro usuario.', 'warning');
//       return;
//     }

//     setReservedHours({
//       ...reservedHours,
//       [`${dateKey}-${timeKey}`]: true,
//     });

//     setReservationsData((prevData) => {
//       const updatedData = { ...prevData };
//       if (!updatedData[dateKey]) {
//         updatedData[dateKey] = [];
//       }
//       updatedData[dateKey].push(timeKey);
//       return updatedData;
//     });
//   };

//   const isHourValid = (dayIndex, hour) => {
//     if (dayIndex === 5) {
//       return hour >= 7 && hour <= 10;
//     } else {
//       return (hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20);
//     }
//   };

//   const isHourReserved = (dayIndex, hour) => {
//     const dateKey = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
//     const timeKey = `${hour}:00`;

//     return reservedHours[`${dateKey}-${timeKey}`];
//   };

//   const renderTableRows = () => {
//     const tableRows = morningHours.map((hour) => (
//       <tr key={hour}>
//         <td>{formatHour(hour)}</td>
//         {daysOfWeek.map((_, i) => (
//           <td key={i}>
//             {isHourValid(i, hour) && (
//               <button
//                 className={`available-button${isHourReserved(i, hour) ? ' reserved' : ''}`}
//                 onClick={() => handleReserveClick(i, hour)}
//                 disabled={isHourReserved(i, hour)}
//               >
//                 {isHourReserved(i, hour) ? 'Reservado' : 'Reservar'}
//               </button>
//             )}
//           </td>
//         ))}
//       </tr>
//     ));
//     return tableRows;
//   };

//   const renderTableHeaders = () => {
//     const tableHeaders = daysOfWeek.map((day, i) => (
//       <th key={i}>
//         {day}
//         <br />
//         {moment(selectedDate).add(i, 'days').format('MMMM D')}
//       </th>
//     ));
//     return tableHeaders;
//   };

//   const saveReservationsToServer = () => {
//     const reservations = {};

//     Object.keys(reservationsData).forEach((date) => {
//       reservations[date] = reservationsData[date];
//     });

//     fetch('http://localhost:8084/api/reservations', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         userId: user._id,
//         reservations: reservations,
//       }),
//     })
//       .then((response) => {
//         if (response.status === 201) {
//           Swal.fire('Reservas Guardadas', 'Tus reservas se han guardado con éxito.', 'success');
//           navigate(`/customers/${id}`);
//         }
//       })
//       .catch((error) => {
//         console.error('Error al realizar la solicitud:', error);
//         Swal.fire('Error al guardar las reservas', 'Ha ocurrido un error al guardar las reservas.', 'error');
//       });
//   };

//   return (
//     <div className="reservations-container">
//       <h2>Horario de Reservas</h2>
//       <div className="table-container">
//         <div>
//           <Link to={`/customers/${id}`}>
//             <button>Regresar a Customers</button>
//           </Link>
//           <button onClick={() => handleDateChange(-7)}>Semana Anterior</button>
//           <button onClick={() => handleDateChange(7)}>Semana Siguiente</button>
//         </div>
//         <table>
//           <thead>
//             <tr>
//               <th>Hora</th>
//               {renderTableHeaders()}
//             </tr>
//           </thead>
//           <tbody>{renderTableRows()}</tbody>
//         </table>
//       </div>
//       <div className="save">
//         <button onClick={saveReservationsToServer}>Guardar Reservas en el Servidor</button>
//       </div>
//     </div>
//   );
// };

// export default Reservations;
