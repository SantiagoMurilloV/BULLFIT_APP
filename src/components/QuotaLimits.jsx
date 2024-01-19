import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { environment } from '../environments';
import '../../src/components/styles/EditReservations.css'; 
import '../components/styles/Diary.css';
import '../components/styles/QuotaLimits.css'
import '../components/styles/Reservations.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faHome} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';



const QuotaLimits = () => {
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'];
  const hours = ['06:00', '07:00', '08:00', '09:00','10:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  

  const { id } = useParams();
  const [cupos, setCupos] = useState({});
  const [createdSlots, setCreatedSlots] = useState({});

  useEffect(() => {
    fetchSlots();
  }, [id]);

  const fetchSlots = async () => {
    try {
      const response = await axios.get(`${environment.apiURL}/api/slots`);
      const fetchedCupos = {};
      const newCreatedSlots = {};
      response.data.forEach(slot => {
        const key = `${slot.day}-${slot.hour}`;
        fetchedCupos[key] = slot.slots;
        newCreatedSlots[key] = true; 
      });
      setCupos(fetchedCupos);
      setCreatedSlots(newCreatedSlots); 
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleCupoChange = async (day, hour, value) => {
    const key = `${day}-${hour}`;
    const newCupos = { ...cupos, [key]: value };
    setCupos(newCupos);

    if (createdSlots[key]) {
      try {
        await axios.put(`${environment.apiURL}/api/slots/${day}/${hour}`, { slots: value });
      } catch (error) {
        console.error('Error updating slot:', error);
      }
    } else {
      try {
        await axios.post(`${environment.apiURL}/api/slots`, { day, hour, slots: value });
        setCreatedSlots({ ...createdSlots, [key]: true });
      } catch (error) {
        console.error('Error creating slot:', error);
      }
    }
  };
  

  return (
    <div>
      <h2>Asignación de Cupos</h2>
      <Link to={`/diary/${id}`}>
        <button className='butom-day-finance'>
          <FontAwesomeIcon icon={faBook} />
        </button>
      </Link>
      <Link to={`/admin/${id}`}>
        <button className='butom-day-finance'>
          <FontAwesomeIcon icon={faHome} />
        </button>
      </Link>
      <table>
        <thead>
          <tr>
            <th className="hour-header">Hora</th>
            {daysOfWeek.map(day => (
              <th key={day} className={`${day.toLowerCase()}-header`}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour, index) => (
            <>
              <tr key={hour}>
                <td className='hour-cell'>{hour}</td>
                {daysOfWeek.map(day => (
                  <td key={`${day}-${hour}`}>
                    {!(day === 'Sabado' && !['07:00', '08:00', '09:00', '10:00'].includes(hour)) && (
                      <input 
                        className='slotNum'
                        min="0" 
                        value={cupos[`${day}-${hour}`] || ''} 
                        onChange={(e) => handleCupoChange(day, hour, e.target.value)} 
                      />
                    )}
                  </td>
                ))}
              </tr>
              {hour === '10:00' && (
                <tr>
                  <td colSpan={daysOfWeek.length + 1} className="separation-row">Break</td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
  
};

export default QuotaLimits;