import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Modal from 'react-modal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faStore, faCalendarAlt, faClock, faBook, faHistory, faChartColumn } from '@fortawesome/free-solid-svg-icons';
import '../components/styles/Finance.css';
import { environment } from '../environments';
import { format } from 'date-fns';

Modal.setAppElement('#root');

const Finance = () => {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedReservationPaymentStatus, setSelectedReservationPaymentStatus] = useState('');
  const [showPositivePayments, setShowPositivePayments] = useState(false);
  const [editableValues, setEditableValues] = useState({});
  const [activeTable, setActiveTable] = useState('both');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, [id, searchTerm, currentMonth]);

  const togglePaymentStatusFilter = () => {
    setShowPositivePayments(!showPositivePayments);
  };
  const calculatePendingReservationAmount = (user, reservationCountForMonth) => {
    return user.Plan === 'Mensual' ? 125000 : reservationCountForMonth * 10000;
  };

  const updateUserFinanceData = async (userId, newFinanceData) => {
    try {
      const response = await fetch(`${environment.apiURL}/api/userFinance/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFinanceData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar los datos financieros del usuario');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud PUT:', error);
      Swal.fire('Error', 'Ha ocurrido un error al actualizar los datos financieros.', 'error');
    }
  };

  const updateFinanceData = async (userId, newFinanceData) => {
    try {
      const response = await fetch(`${environment.apiURL}/api/finance/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFinanceData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar los datos financieros del usuario');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud PUT:', error);
      Swal.fire('Error', 'Ha ocurrido un error al actualizar los datos financieros.', 'error');
    }
  };

  const fetchData = async () => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    try {
      const response = await fetch(`${environment.apiURL}/api/finances?month=${month}&year=${year}`);
      const countersResponse = await fetch(`${environment.apiURL}/api/counter`);

      if (!response.ok || !countersResponse.ok) throw new Error('Error al obtener datos');

      const data = await response.json();
      const countersData = await countersResponse.json();

      const updatedUsers = await Promise.all(data.map(async (user) => {
        const currentMonthString = month.toString().padStart(2, '0');
        const userCounter = countersData.find(counter => counter.userId === user.userId);
        const reservationCountForMonth = userCounter ? userCounter.counts[currentMonthString] || 0 : 0;
        const pendingBalance = calculatePendingReservationAmount(user, reservationCountForMonth);
        await updateFinanceData(user._id, { reservationCount: reservationCountForMonth });
        await updateFinanceData(user._id, { pendingBalance: pendingBalance });
        return { ...user, pendingBalance: pendingBalance, reservationCount: reservationCountForMonth };
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
      return users.filter(user => {
        const matchesReservationPaymentStatus = selectedReservationPaymentStatus
          ? user.reservationPaymentStatus === selectedReservationPaymentStatus.value
          : true;

        const matchesName = user.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) || user.LastName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = selectedPlan ? user.Plan === selectedPlan.value : true;
        const matchesStatus = selectedStatus ? user.Active === selectedStatus.value : true;

        return matchesName && matchesPlan && matchesStatus && matchesReservationPaymentStatus;
      });
    };

    setSearchResults(filterUsers());
  }, [users, searchTerm, selectedPlan, selectedStatus, selectedReservationPaymentStatus]);

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


  const handleStatusChange = async (userId, Active) => {
    try {
      const updatedUserData = { Active };
      const userResponse = await fetch(`${environment.apiURL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!userResponse.ok) throw new Error('Error al actualizar el usuario');
      await fetch(`${environment.apiURL}/api/userFinance/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData),
      });

      fetchData();

    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
      Swal.fire('Error al actualizar el estado', 'Ha ocurrido un error al actualizar el estado del usuario.', 'error');
    }
  };
  const handlePlanChange = async (userId, newPlan) => {
    try {
      const updatedUserData = { Plan: newPlan };
      const response = await fetch(`${environment.apiURL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el plan del usuario');
      }
      await fetch(`${environment.apiURL}/api/userFinance/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData),
      });

      const user = users.find(u => u.userId === userId);
      const currentMonthString = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
      const userCounter = count.find(counter => counter.userId === userId);
      const reservationCountForMonth = userCounter ? userCounter.counts[currentMonthString] || 0 : 0;
      const pendingBalance = calculatePendingReservationAmount({ ...user, Plan: newPlan }, reservationCountForMonth);
      await updateFinanceData(user._id, { reservationCount: reservationCountForMonth });
      await updateFinanceData(user._id, { pendingBalance });

      fetchData();
    } catch (error) {
      console.error('Error al actualizar el plan del usuario:', error);
      Swal.fire('Error al actualizar el plan', 'Ha ocurrido un error al actualizar el plan del usuario.', 'error');
    }
  };

  const handlePaidReservationsChange = async (userId, numberPaidReservations) => {
    try {
      const updatedUserData = { numberPaidReservations: numberPaidReservations };
      const payDiaryResponse = await fetch(`${environment.apiURL}/api/finance/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!payDiaryResponse.ok) throw new Error('Error al actualizar el usuario');

      fetchData();

    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
      Swal.fire('Error al actualizar el estado', 'Ha ocurrido un error al actualizar el estado del usuario.', 'error');
    }
  };


  return (
    <div>
      <h2 className='finance-title'>Finanzas $</h2>
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
        <Link to={`/summary/${id}`}>
          <button className='butom-day-finance-hist' >
            <FontAwesomeIcon icon={faChartColumn} /> Resumen
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
                      <th>Plan</th>
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


                      if (showPositivePayments && user.reservationPaymentStatus !== 'Si') {
                        return null;
                      } else if (!showPositivePayments && user.reservationPaymentStatus !== 'No') {
                        return null;
                      }
                      return (
                        <tr key={user._id}>
                          <td>
                            <Select
                              value={{ value: user.Plan, label: user.Plan }}
                              onChange={(selectedOption) => handlePlanChange(user.userId, selectedOption.value)}
                              options={[
                                { value: ' ', label: ' ' },
                                { value: 'Diario', label: 'Diario' },
                                { value: 'Mensual', label: 'Mensual' },
                              ]}
                            />
                          </td>
                          <td>{user.FirstName + ' ' + user.LastName}</td>
                          <td>
                            <DatePicker
                              className='date'
                              selected={new Date(user.startDate)}
                              onChange={(date) => {
                                const formattedDate = format(date, 'yyyy-MM-dd')
                                handleFinanceChange(user._id, 'startDate', formattedDate);
                              }}
                            />
                          </td>
                          <td>
                            <DatePicker
                              className='date'
                              selected={new Date(user.endDate)}
                              onChange={(date) => {
                                const formattedDate = format(date, 'yyyy-MM-dd')
                                handleFinanceChange(user._id, 'endDate', formattedDate);
                              }}
                            />
                          </td>
                          <td>
                            <Select
                              value={{ value: user.Active, label: user.Active }}
                              onChange={(selectedOption) => handleStatusChange(user.userId, selectedOption.value)}
                              options={[
                                { value: ' ', label: ' ' },
                                { value: 'Sí', label: 'Sí' },
                                { value: 'No', label: 'No' },
                              ]}
                            />
                          </td>
                          <td style={{ color: user.reservationPaymentStatus === 'No' ? '#a62525' : 'green' }}>
                            {user.pendingBalance > 0 ? `$ ${user.pendingBalance}` : '$ 0'}
                          </td>
                          <td>
                            <select
                              style={{ color: user.reservationPaymentStatus === 'Si' ? '#0dab0d' : 'red' }}
                              value={user.reservationPaymentStatus}
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

                <table className="user-table-finance-diary">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Nombre</th>
                      <th>Fecha inicio</th>
                      <th># Reservas</th>
                      <th>Usuario Activo</th>
                      <th>$Pendiente Reservas</th>
                      <th>Reservas Pagadas</th>
                      <th>pago Reservas$</th>
                      <th>Novedades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.filter(user => user.Plan === 'Diario').map(user => {

                      if (showPositivePayments && user.reservationPaymentStatus !== 'Si') {
                        return null;
                      } else if (!showPositivePayments && user.reservationPaymentStatus !== 'No') {
                        return null;
                      }
                      return (
                        <tr key={user._id}>
                          <td>
                            <Select
                              value={{ value: user.Plan, label: user.Plan }}
                              onChange={(selectedOption) => handlePlanChange(user.userId, selectedOption.value)}
                              options={[
                                { value: ' ', label: ' ' },
                                { value: 'Diario', label: 'Diario' },
                                { value: 'Mensual', label: 'Mensual' },
                              ]}
                            />
                          </td>
                          <td>{user.FirstName + ' ' + user.LastName}</td>
                          <td>
                            <DatePicker
                              className='date'
                              selected={new Date(user.startDate)}
                              onChange={(date) => {
                                const formattedDate = format(date, 'yyyy-MM-dd')
                                handleFinanceChange(user._id, 'startDate', formattedDate);
                              }}
                            />
                          </td>
                          <td>{user.reservationCount}</td>
                          <td>
                            <Select
                              value={{ value: user.Active, label: user.Active }}
                              onChange={(selectedOption) => handleStatusChange(user.userId, selectedOption.value)}
                              options={[
                                { value: ' ', label: ' ' },
                                { value: 'Sí', label: 'Sí' },
                                { value: 'No', label: 'No' },
                              ]}
                            />
                          </td>
                          <td style={{ color: user.reservationPaymentStatus === 'No' ? '#a62525' : 'green' }}>
                            {user.pendingBalance > 0 ? `$ ${user.pendingBalance}` : '$ 0'}
                          </td>
                          <td>
                            <input
                              value={user.numberPaidReservations || " "}
                              onChange={(e) => handlePaidReservationsChange(user._id, e.target.value)}
                              className="num"
                            />
                          </td>
                          <td>
                            <select
                              style={{ color: user.reservationPaymentStatus === 'Si' ? '#0dab0d' : 'red' }}
                              value={user.reservationPaymentStatus}
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

export default Finance;