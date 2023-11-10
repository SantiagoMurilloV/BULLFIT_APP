import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment';

const EditReservations = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userReservations, setUserReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del usuario
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

    // Cargar reservas del usuario
    fetch(`http://localhost:8084/api/reservations/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setUserReservations(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire('Error al obtener las reservas', 'Ha ocurrido un error al cargar las reservas del usuario.', 'error');
      });
  }, [id]);

  const handleUpdateReservationStatus = (reservationId, newStatus) => {
    // Realizar una solicitud PUT para actualizar el estado de la reserva en la API
    fetch(`http://localhost:8084/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => {
        if (response.ok) {
          // Actualizar el estado de la reserva en la interfaz
          setUserReservations((prevReservations) =>
            prevReservations.map((reservation) => {
              if (reservation._id === reservationId) {
                return { ...reservation, status: newStatus };
              }
              return reservation;
            })
          );
          Swal.fire('Estado de Reserva Actualizado', 'Se ha actualizado el estado de la reserva con éxito.', 'success');
        } else {
          Swal.fire('Error al Actualizar Estado', 'Ha ocurrido un error al actualizar el estado de la reserva.', 'error');
        }
      })
      .catch((error) => {
        console.error(error);
        Swal.fire('Error al Actualizar Estado', 'Ha ocurrido un error al actualizar el estado de la reserva.', 'error');
      });
  };

  const renderTableHeaders = () => {
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return daysOfWeek.map((day, index) => {
      const dateForDay = moment().day(index + 1).format('YYYY-MM-DD');
      return (
        <th key={index}>
          {day}
          <br />
          {dateForDay}
        </th>
      );
    });
  };

  const renderTableRows = () => {
    // Define el rango de horas
    const morningHours = [...Array(5).keys()].map((hour) => hour + 6); // 6 AM to 10 AM
    const eveningHours = [...Array(4).keys()].map((hour) => hour + 16); // 4 PM to 7 PM
    const hours = [...morningHours, ...eveningHours];

    const daysOfWeek = [1, 2, 3, 4, 5, 6, 7]; // Días de la semana en formato numérico

    const reservationsByDayAndHour = {};

    // Organizar las reservas en un objeto para facilitar su búsqueda
    userReservations.forEach((reservation) => {
      if (!reservationsByDayAndHour[reservation.day]) {
        reservationsByDayAndHour[reservation.day] = {};
      }
      reservationsByDayAndHour[reservation.day][reservation.hour] = reservation;
    });

    return hours.map((hour) => (
      <tr key={hour}>
        {daysOfWeek.map((day) => {
          const dayName = moment().day(day).format('dddd'); // Obtener el nombre del día
          const reservation = reservationsByDayAndHour[dayName] ? reservationsByDayAndHour[dayName][hour] : null;
          return (
            <td key={day}>
              {reservation ? (
                <div>
                  {reservation.status === 'reserved' ? (
                    <div className="reservation-dropdown">
                      <div className="dropdown-content">
                        <button onClick={() => handleUpdateReservationStatus(reservation._id, 'canceled')}>
                          Cancelar
                        </button>
                      </div>
                      Reservado
                    </div>
                  ) : (
                    'Cancelado'
                  )}
                </div>
              ) : (
                '-'
              )}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <div>
      <h2>Editar Reservas</h2>
      <Link to={`/customers/${id}`}>
        <button>Regresar a Perfil</button>
      </Link>
      {isLoading ? (
        <p>Cargando reservas...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              {renderTableHeaders()}
            </tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      )}
    </div>
  );
};

export default EditReservations;
