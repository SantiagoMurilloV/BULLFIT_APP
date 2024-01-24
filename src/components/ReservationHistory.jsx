
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faStore, faCalendarAlt, faClock, faBook, faDollarSign, faCalendarPlus, faCalendarDay, faCalendarMinus } from '@fortawesome/free-solid-svg-icons';

import '../components/styles/Finance.css';
import { environment } from '../environments';

Modal.setAppElement('#root');

const ReservationHistory = () => {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [activeTable, setActiveTable] = useState('both');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, [id, searchTerm, currentMonth]);




  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  const getFormattedMonth = () => {
    return currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };


  const fetchData = async () => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    try {
      const response = await fetch(`${environment.apiURL}/api/finances?month=${month}&year=${year}`);
      const countersResponse = await fetch(`${environment.apiURL}/api/counter`);

      if (!response.ok || !countersResponse.ok) throw new Error('Error al obtener datos');

      const data = await response.json();
      const countersData = await countersResponse.json();

      const updatedUsers = await Promise.all(data.map(async (user) => {
        const userStartDate = new Date(user.startDate);
        const startDateMonth = userStartDate.getMonth();
        const startDateYear = userStartDate.getFullYear();

        return { ...user, startDateMonth, startDateYear };
      }));

      setUsers(updatedUsers);
      setCount(countersData);
      setLoading(false);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const filterUsers = () => {
      const currentMonthIndex = currentMonth.getUTCMonth();
      const currentYear = currentMonth.getUTCFullYear();
      return users.filter(user => {
        const userStartDate = new Date(user.startDate + 'T00:00:00Z');
        const userMonthIndex = userStartDate.getUTCMonth();
        const userYear = userStartDate.getUTCFullYear();

        const matchesDate = userMonthIndex === currentMonthIndex && userYear === currentYear;


        const matchesName = user.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) || user.LastName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = selectedPlan ? user.Plan === selectedPlan.value : true;


        return matchesName && matchesPlan && matchesDate;
      });
    };

    setSearchResults(filterUsers());
  }, [users, searchTerm, selectedPlan, currentMonth]);

  const handleFinanceChange = async (finacesId, financeField, newValue) => {
    try {
      let updatedFinanceData = { [financeField]: newValue };
      const updateResponse = await fetch(`${environment.apiURL}/api/finance/${finacesId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFinanceData),
      });

      if (!updateResponse.ok) {
        throw new Error('No se pudo actualizar los datos financieros del usuario');
      }
      fetchData();
    } catch (error) {
      Swal.fire('Error', 'Ha ocurrido un error al actualizar los datos financieros.', 'error');
    }
  };



  return (
    <div>
      <h2 style={{ color: '#fffd00' }}>Historial de Pagos - {getFormattedMonth()}</h2>
      <div className="filters-container">
        <input
          className='input-search'
          type="text"
          placeholder="Buscar por nombre o apellido"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          className="filter-select"
          classNamePrefix="filter-select"
          value={selectedPlan}
          onChange={(selected) => setSelectedPlan(selected)}
          options={[
            { value: 'Diario', label: 'Diario' },
            { value: 'Mensual', label: 'Mensual' },
          ]}
          placeholder="Plan"
          isClearable
        />

        <button className='butom-day-finance' onClick={goToPreviousMonth}>
          <FontAwesomeIcon icon={faCalendarMinus} />
        </button>
        <button className='butom-day-finance' onClick={goToCurrentMonth}>
          <FontAwesomeIcon icon={faCalendarDay} />
        </button>
        <button className='butom-day-finance' onClick={goToNextMonth}>
          <FontAwesomeIcon icon={faCalendarPlus} />
        </button>
        <Link to={`/finances/${id}`}>
          <button className='butom-day-finance' >
            <FontAwesomeIcon icon={faDollarSign} />
          </button>
        </Link>
        <Link to={`/store/${id}`}>
          <button className='butom-day-finance' >
            <FontAwesomeIcon icon={faStore} />
          </button>
        </Link>
        <Link to={`/diary/${id}`}>
          <button className='butom-day-finance' >
            <FontAwesomeIcon icon={faBook} />
          </button>
        </Link>
        <Link to={`/admin/${id}`}>
          <button className='butom-day-finance' >
            <FontAwesomeIcon icon={faHome} />
          </button>
        </Link>

      </div>
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <>
          <>
            {(activeTable === 'monthly' || activeTable === 'both') && (
              <div>
                <h3 style={{ color: 'white', fontSize: '40px' }}>Mensualidades</h3>
                <table className="user-table-finance">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Inicio Mes</th>
                      <th>Fin Mes</th>
                      <th>Usuario Activo</th>
                      <th>Valor Pagado</th>
                      <th>Confirmación Pago</th>
                      <th>Fecha y hora del pago</th>
                      <th>Novedades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.filter(user => user.Plan === 'Mensual').map(user => {

                      if (user.reservationPaymentStatus === 'No') {
                        return null;
                      }
                      return (
                        <tr key={user._id}>
                          <td>{user.FirstName + ' ' + user.LastName}</td>
                          <td>{user.startDate || 'N/A'}</td>
                          <td>{user.endDate || 'N/A'}</td>
                          <td>{user.Active || ' '}</td>
                          <td style={{ color: user.reservationPaymentStatus === 'No' ? '#a62525' : 'green' }}>
                            {user.pendingBalance > 0 ? `$ ${user.pendingBalance}` : '$ 0'}
                          </td>
                          <td>{user.reservationPaymentStatus === 'Si' ? '✔' : '✖' || ' '}</td>
                          <td>{user.paymentDate || ''} {user.paymentTime || ''}  </td>
                          <td>
                            <input
                              type="text"
                              className='news'
                              value={user.news || ''}
                              onChange={(event) => handleFinanceChange(user._id, 'news', event.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {(activeTable === 'daily' || activeTable === 'both') && (
              <div>
                <h3 style={{ color: 'white', fontSize: '40px' }}>Plan Diario</h3>
                <table className="user-table-finance">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Fecha inicio</th>
                      <th># Reservas</th>
                      <th>Usuario Activo</th>
                      <th>Valor Pagado</th>
                      <th>Confirmación Pago</th>
                      <th>Fecha y hora del pago</th>
                      <th>Novedades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.filter(user => user.Plan === 'Diario').map(user => {
                      if (user.reservationPaymentStatus === 'No') {
                        return null;
                      }
                      return (
                        <tr key={user._id}>
                          <td>{user.FirstName + ' ' + user.LastName}</td>
                          <td>{user.startDate || 'N/A'}</td>
                          <td>{user.reservationCount || 0}</td>
                          <td>{user.Active || ' '}
                          </td>
                          <td style={{ color: user.reservationPaymentStatus === 'No' ? '#a62525' : 'green' }}>
                            {user.pendingBalance > 0 ? `$ ${user.pendingBalance}` : '$ 0'}
                          </td>
                          <td>{user.reservationPaymentStatus === 'Si' ? '✔' : '✖' || ' '}</td>
                          <td>{user.paymentDate || ''} {user.paymentTime || ''} </td>
                          <td>

                            <input
                              type="text"
                              className='news'
                              value={user.news || ''}
                              onChange={(event) => handleFinanceChange(user._id, 'news', event.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>
            )}
          </>

        </>
      )}
    </div>
  );
};

export default ReservationHistory;