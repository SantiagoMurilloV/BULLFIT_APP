import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';
import '../components/styles/Diary.css';

const Diary = () => {
  const [dailyReservations, setDailyReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [hourFilter, setHourFilter] = useState(null); 

  const fetchDailyReservations = (formattedDate) => {
    fetch(`http://localhost:8084/api/reservations?day=${formattedDate}`)
      .then((response) => response.json())
      .then((data) => {
        setDailyReservations(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar la agenda diaria:', error);
        setLoading(false); 
      });
  };

  useEffect(() => {
    const currentDateInColombia = new Date(currentDate.getTime() - 5 * 60 * 60 * 1000);
    const formattedDate = currentDateInColombia.toISOString().split('T')[0];
    fetchDailyReservations(formattedDate);
  }, [currentDate, id]);

  const updateTrainingType = (reservationId, TrainingType) => {
    fetch(`http://localhost:8084/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ TrainingType }),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire('Entrenamiento actualizado', 'Se ha actualizado el entrenamiento con éxito.', 'success');
          const formattedDate = currentDate.toISOString().split('T')[0];
          fetchDailyReservations(formattedDate);
        } else {
          console.error('Error al actualizar el entrenamiento de la reserva');
        }
      })
      .catch((error) => {
        console.error('Error al obtener datos actualizados:', error);
      });
  };

  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDate);
  };

  const handlePreviousDay = () => {
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(previousDate);
  };

  const handleFilterByHour = (selectedOption) => {
    setHourFilter(selectedOption);
  };

  const handleClearFilter = () => {
    setHourFilter(null);
  };


  const formattedDate = currentDate.toISOString().split('T')[0];

  const currentDayReservations = dailyReservations.filter((reservation) => reservation.day === formattedDate);

  return (
    <div className={`Diary-container ${loading ? 'fade-in' : 'fade-out'}`}>
      <h2>Agenda Diaria - {formattedDate}</h2>
      <div className="filter-controls">
        <Select
          value={hourFilter}
          onChange={handleFilterByHour}
          options={[
            { value: '6:00', label: '6:00 Am' },
            { value: '7:00', label: '7:00 Am' },
            { value: '8:00', label: '8:00 Am' },
            { value: '9:00', label: '9:00 Am' },
            { value: '10:00', label: '10:00 Am' },
            { value: '16:00', label: '4:00 pm' },
            { value: '17:00', label: '5:00 pm' },
            { value: '18:00', label: '6:00 pm' },
            { value: '19:00', label: '7:00 pm' },
            { value: '20:00', label: '8:00 pm' },
          ]}
          placeholder="Filtrar por hora"
        />
        <img onClick={handleClearFilter}
            src={`${process.env.PUBLIC_URL}/image/logos/trash.png`}
            alt="Botón de Regresar"
            className="button-trash"
          />
        <button className='butom-day' onClick={handlePreviousDay}>Día Anterior</button>
        <button className='butom-day' onClick={handleNextDay}>Siguiente Día</button>
      </div>
      <table className="table-diary">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Usuario</th>
            <th>Entrenamiento</th>
          </tr>
        </thead>
        <tbody>
          {currentDayReservations
            .filter((reservation) => !hourFilter || reservation.hour === hourFilter.value) 
            .map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.hour}</td>
                <td>{reservation.userName + ' ' + reservation.userLastName}</td>
                <td>
                  <Select
                    value={{ value: reservation.TrainingType, label: reservation.TrainingType }}
                    onChange={(selectedOption) => {
                      const TrainingType = selectedOption.value;
                      updateTrainingType(reservation._id, TrainingType);
                    }}
                    options={[
                    { value: 'Tren Superior', label: 'Tren Superior' },
                    { value: 'Jalon', label: 'Jalon' },
                    { value: 'Empuje', label: 'Empuje' },
                    { value: 'Brazo', label: 'Brazo' },
                    { value: 'Pierna', label: 'Pierna' },
                    { value: 'Gluteo', label: 'Gluteo' },
                    { value: 'Cardio', label: 'Cardio' },
                    { value: 'Primer dia', label: 'Primer dia' },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="profile-buttons">
        <Link to={`/admin/${id}`} className="button-link">
          <img
            src={`${process.env.PUBLIC_URL}/image/logos/logOut-copia.png`}
            alt="Botón de Regresar"
            className="profile-button-image"
          />
        </Link>
      </div>
    </div>
  );
};

export default Diary;
