import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Modal from 'react-modal';
import '../components/styles/Finance.css';
import { environment } from '../environments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faStore, faCalendarAlt, faClock, faBook,  faHistory } from '@fortawesome/free-solid-svg-icons';


Modal.setAppElement('#root');
const Finance = () => {
  const [users, setUsers] = useState([]);
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedReservationPaymentStatus, setSelectedReservationPaymentStatus] = useState('');
  const [showPositivePayments, setShowPositivePayments] = useState(false);
  const [reservationsLoaded, setReservationsLoaded] = useState(false);
  const [editableValues, setEditableValues] = useState({});
  const [activeTable, setActiveTable] = useState('both');
  const [storeConsumptions, setStoreConsumptions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());


  const getUserOptions = () => {
    return users.map(user => ({
      value: user._id,
      label: `${user.FirstName} ${user.LastName}`
    }));
  };
  const showMonthlyTable = () => {
    setActiveTable('monthly');
  };

  const showDailyTable = () => {
    setActiveTable('daily');
  };

  const showBothTables = () => {
    setActiveTable('both');
  };
  useEffect(() => {
    fetchData();
  }, [id, searchTerm, currentMonth]);


  const togglePaymentStatusFilter = () => {
    setShowPositivePayments(!showPositivePayments);
  };
  useEffect(() => {
    const filterUsers = () => {
      return users.filter(user => {

        const userFinance = financeData.find(finance => finance.userId === user._id) || {};

        const matchesReservationPaymentStatus = selectedReservationPaymentStatus
          ? userFinance.reservationPaymentStatus === selectedReservationPaymentStatus.value
          : true;


        const matchesName = user.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) || user.LastName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = selectedPlan ? user.Plan === selectedPlan.value : true;
        const matchesStatus = selectedStatus ? user.Active === selectedStatus.value : true;

        return matchesName && matchesPlan && matchesStatus && matchesReservationPaymentStatus;
      });
    };

    setSearchResults(filterUsers());
  }, [users, financeData, searchTerm, selectedPlan, selectedStatus, selectedReservationPaymentStatus]);


  const fetchData = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/users`);
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      const data = await response.json();
      await fetchFinanceData();
      setUsers(data);
      setLoading(false);
      fetchReservations(data);

    } catch (error) {

    }
  };


  const fetchFinanceData = async () => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    try {
      const response = await fetch(`${environment.apiURL}/api/finances?month=${month}&year=${year}`);
      if (!response.ok) throw new Error('Error al obtener datos financieros');
      const financesData = await response.json();
      setFinanceData(financesData);

    } catch (error) {
      console.error('Error al obtener datos financieros:', error);
    }
  };

  const changeMonth = (increment) => {
    setCurrentMonth(prevMonth => {
      return new Date(prevMonth.getFullYear(), prevMonth.getMonth() + increment, 1);
    });
  };
  useEffect(() => {
    const newEditableValues = {};
    users.forEach(user => {
      const userFinance = financeData.find(f => f.userId === user._id) || {};
      newEditableValues[user._id] = {
        ...newEditableValues[user._id],
        reservationPaymentStatus: userFinance.reservationPaymentStatus || user.reservationPaymentStatus,
      };
    });
    setEditableValues(newEditableValues);
  }, [users, financeData]);

  useEffect(() => {
    if (users.length > 0 && !reservationsLoaded) {
      fetchReservations();

    }
  }, [users, reservationsLoaded]);

  const fetchReservations = async (users) => {
    if (!users || users.length === 0) {
      return;
    }
    try {
      const res = await fetch(`${environment.apiURL}/api/reservations`);
      const reservations = await res.json();
      countReservationsByUser(users, reservations);
    } catch (error) {

    }
  };

  const countReservationsByUser = async (users, reservations) => {

    const reservationCount = reservations.reduce((acc, reservation) => {
      if (reservation && reservation.userId && typeof reservation.userId === 'string') {
        acc[reservation.userId] = (acc[reservation.userId] || 0) + 1;
      } else {
        console.log("Reserva sin userId válido:", reservation);
      }
      return acc;
    }, {});

    const updatedUsers = users.map(user => {
      const reservationCost = user.Plan === 'Mensual' ? 125000 : reservationCount[user._id] * 10000;
      return {
        ...user,
        reservationCount: reservationCount[user._id] || 0,
        totalAmount: reservationCost,
        pendingBalance: reservationCost,
        reservationPaymentStatus: user.reservationPaymentStatus || 'No',

      };


    });

    setUsers(updatedUsers);

    updatedUsers.forEach(async (userToUpdate) => {
      try {
        const financeUpdateData = {
          reservationCount: userToUpdate.reservationCount,
          totalAmount: userToUpdate.totalAmount,
          pendingBalance: userToUpdate.pendingBalance,
          totalConsumption: userToUpdate.totalConsumption,
        };

        const updateResponse = await fetch(`${environment.apiURL}/api/finances/${userToUpdate._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(financeUpdateData),
        });
        fetchFinanceData()
        if (!updateResponse.ok) {
          throw new Error(`No se pudo actualizar los datos financieros del usuario con ID ${userToUpdate._id}`);
        }

      } catch (error) {
        console.error(`Error al actualizar los datos financieros `, error);
      }
    });
  };



  const handleFinanceChange = async (userId, financeField, newValue) => {
    try {
      let updatedFinanceData = { [financeField]: newValue };


      const updateResponse = await fetch(`${environment.apiURL}/api/finances/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFinanceData),
      });


      if (!updateResponse.ok) {
        throw new Error('No se pudo actualizar los datos financieros del usuario');
      }

      await fetchFinanceData();
      await fetchData();
    } catch (error) {
      Swal.fire('Error', 'Ha ocurrido un error al actualizar los datos financieros.', 'error');
    }
  };


  const handleStatusChange = async (userId, Active) => {
    try {
      const updatedUserData = { Active };
      const response = await fetch(`${environment.apiURL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });
      if (response.ok) {
        const userResponse = await fetch(`${environment.apiURL}/api/users/${id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
        fetchFinanceData()
        fetchData();
      } else {
        console.error('Error al actualizar el estado del usuario');
        Swal.fire('Error al actualizar el estado', 'Ha ocurrido un error al actualizar el estado del usuario.', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
      Swal.fire('Error al actualizar el estado', 'Ha ocurrido un error al actualizar el estado del usuario.', 'error');
    }
  };


  return (
    <div>
      <h2>Finanzas $</h2>
      <div className="filters-container">
        <input
          className='input-search'
          type="text"
          placeholder="Buscar por nombre o apellido"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          className='butom-day-finance-hist'
          onClick={togglePaymentStatusFilter}>
          {showPositivePayments ? 'Reservas Pagadas' : 'Reservas Pendientes'}
        </button>

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

        <Select
          className="filter-select"
          classNamePrefix="filter-select"
          value={selectedStatus}
          onChange={(selected) => setSelectedStatus(selected)}
          options={[
            { value: 'Sí', label: 'Sí' },
            { value: 'No', label: 'No' },
          ]}
          placeholder="Activo"
          isClearable
        />  
        <Link to={`/reservationHistory/${id}`}>
          <button className='butom-day-finance-hist' >
            <FontAwesomeIcon icon={faHistory} /> Historial
          </button>
        </Link>
        <button onClick={showMonthlyTable} className='butom-day-finance-hist'> <FontAwesomeIcon icon={faCalendarAlt} /> Mensual
        </button>
        <button onClick={showDailyTable} className='butom-day-finance-hist'><FontAwesomeIcon icon={faClock} /> Diario </button>
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
                      <th>$Pendiente Reservas</th>
                      <th>pago Reservas$</th>
                      <th>Novedades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.filter(user => user.Plan === 'Mensual').map(user => {
                      const userFinance = financeData.find(finance => finance.userId === user._id) || {};
                      if (showPositivePayments && userFinance.reservationPaymentStatus !== 'Si') {
                        return null;
                      } else if (!showPositivePayments && userFinance.reservationPaymentStatus !== 'No') {
                        return null;
                      }
                      return (
                        <tr key={user._id}>
                          <td>{userFinance.FirstName + ' ' + userFinance.LastName}</td>
                          <td>{userFinance.startDate || ' '}</td>
                          <td>{userFinance.endDate || ' '}</td>
                          <td>
                            <Select
                              value={{ value: user.Active, label: user.Active }}
                              onChange={(selectedOption) => handleStatusChange(user._id, selectedOption.value)}
                              options={[
                                { value: ' ', label: ' ' },
                                { value: 'Sí', label: 'Sí' },
                                { value: 'No', label: 'No' },
                              ]}
                            />
                          </td>
                          <td style={{ color: userFinance.reservationPaymentStatus === 'No' ? '#a62525' : 'green' }}>
                            {userFinance.pendingBalance  > 0 ? `$ ${userFinance.pendingBalance }` : '$ 0'}
                          </td>
                          <td>
                            <select
                              style={{ color: userFinance.reservationPaymentStatus === 'Si' ? '#0dab0d' : 'red' }}
                              value={userFinance.reservationPaymentStatus}
                              onChange={(event) => handleFinanceChange(user._id, 'reservationPaymentStatus', event.target.value)}
                            >
                              <option value="No">✖</option>
                              <option value="Si">✔</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className='news'
                              value={userFinance.news || ''}
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
                      <th>$Pendiente Reservas</th>
                      <th>pago Reservas$</th>
                      <th>Novedades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.filter(user => user.Plan === 'Diario').map(user => {
                      const userFinance = financeData.find(finance => finance.userId === user._id) || {};
                      if (showPositivePayments && userFinance.reservationPaymentStatus !== 'Si') {
                        return null;
                      } else if (!showPositivePayments && userFinance.reservationPaymentStatus !== 'No') {
                        return null;
                      }
                      return (
                        <tr key={user._id}>
                          <td>{user.FirstName + ' ' + user.LastName}</td>
                          <td>{userFinance.startDate || 'N/A'}</td>
                          <td>{user.reservationCount || 0}</td>
                          <td>
                            <Select
                              value={{ value: user.Active, label: user.Active }}
                              onChange={(selectedOption) => handleStatusChange(user._id, selectedOption.value)}
                              options={[
                                { value: ' ', label: ' ' },
                                { value: 'Sí', label: 'Sí' },
                                { value: 'No', label: 'No' },
                              ]}
                            />
                          </td>
                          <td style={{ color: userFinance.reservationPaymentStatus === 'No' ? '#a62525' : 'green' }}>
                            {userFinance.pendingBalance  > 0 ? `$ ${userFinance.pendingBalance }` : '$ 0'}
                          </td>
                          <td>
                            <select
                              style={{ color: userFinance.reservationPaymentStatus === 'Si' ? '#0dab0d' : 'red' }}
                              value={userFinance.reservationPaymentStatus}
                              onChange={(event) => handleFinanceChange(user._id, 'reservationPaymentStatus', event.target.value)}
                            >
                              <option value="No">✖</option>
                              <option value="Si">✔</option>
                            </select>

                          </td>
                          <td>
                            <input
                              type="text"
                              className='news'
                              value={userFinance.news || ''}
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

export default Finance;
