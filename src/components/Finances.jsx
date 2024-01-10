import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Modal from 'react-modal';
import '../components/styles/Finance.css';
import { environment } from '../environments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faHome } from '@fortawesome/free-solid-svg-icons';


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
  const [selectedWaterPaymentStatus, setSelectedWaterPaymentStatus] = useState('');
  const [selectedPreWorkoutPaymentStatus, setSelectedPreWorkoutPaymentStatus] = useState('');
  const [reservationsLoaded, setReservationsLoaded] = useState(false);
  const [editableValues, setEditableValues] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());



  useEffect(() => {
    // Esta función ahora depende de currentMonth y se ejecutará cada vez que cambie.
    fetchData();
  }, [id, searchTerm, currentMonth]);
  useEffect(() => {
    const filterUsers = () => {
      return users.filter(user => {

        const userFinance = financeData.find(finance => finance.userId === user._id) || {};

        const matchesReservationPaymentStatus = selectedReservationPaymentStatus
          ? userFinance.reservationPaymentStatus === selectedReservationPaymentStatus.value
          : true;
        const matchesWaterPaymentStatus = selectedWaterPaymentStatus
          ? userFinance.waterPaymentStatus === selectedWaterPaymentStatus.value
          : true;
        const matchesPreWorkoutPaymentStatus = selectedPreWorkoutPaymentStatus
          ? userFinance.preWorkoutPaymentStatus === selectedPreWorkoutPaymentStatus.value
          : true;

        const matchesName = user.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) || user.LastName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = selectedPlan ? user.Plan === selectedPlan.value : true;
        const matchesStatus = selectedStatus ? user.Active === selectedStatus.value : true;

        return matchesName && matchesPlan && matchesStatus && matchesReservationPaymentStatus && matchesWaterPaymentStatus && matchesPreWorkoutPaymentStatus;
      });
    };

    setSearchResults(filterUsers());
  }, [users, financeData, searchTerm, selectedPlan, selectedStatus, selectedReservationPaymentStatus, selectedWaterPaymentStatus, selectedPreWorkoutPaymentStatus]);


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
        numWaters: userFinance.numWaters !== undefined ? userFinance.numWaters : (user.numWaters || 0),
        numPreWorkouts: userFinance.numPreWorkouts !== undefined ? userFinance.numPreWorkouts : (user.numPreWorkouts || 0),
        reservationPaymentStatus: userFinance.reservationPaymentStatus || user.reservationPaymentStatus,
        waterPaymentStatus: userFinance.waterPaymentStatus || user.waterPaymentStatus,
        preWorkoutPaymentStatus: userFinance.preWorkoutPaymentStatus || user.preWorkoutPaymentStatus
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
        waterPaymentStatus: user.waterPaymentStatus || 'No',
        preWorkoutPaymentStatus: user.preWorkoutPaymentStatus || 'No',
        numWaters: 0,
        numPreWorkouts: 0
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

        if (!updateResponse.ok) {
          throw new Error(`No se pudo actualizar los datos financieros del usuario con ID ${userToUpdate._id}`);
        }

      } catch (error) {
        console.error(`Error al actualizar los datos financieros del usuario con ID ${userToUpdate._id}:`, error);
      }
    });
  };
  const calculateConsumptions = (user) => {
    const otherConsumption = (user.numWaters || 0) * 4000 + (user.numPreWorkouts || 0) * 6000;
    const totalConsumption = user.totalAmount + otherConsumption;
    return { otherConsumption, totalConsumption };
  };


  const handleFinanceChange = async (userId, financeField, newValue) => {
    try {

      const updatedFinanceData = { [financeField]: newValue };
      const updateResponse = await fetch(`${environment.apiURL}/api/finances/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFinanceData),
      });

      if (!updateResponse.ok) {
        throw new Error('No se pudo actualizar los datos financieros del usuario');
      }

      fetchData();
    } catch (error) {
      console.error(`Error al actualizar los datos financieros del usuario con ID ${userId}:`, error);
      Swal.fire('Error', 'Ha ocurrido un error al actualizar los datos financieros.', 'error');
    }
  };

  const handleNumericFinanceChange = async (userId, financeField, e) => {

    const newValue = parseInt(e.target.value, 10) || 0;
    const userToUpdate = users.find(user => user._id === userId);

    if (!userToUpdate) return;

    const updatedUser = {
      ...userToUpdate,
      [financeField]: newValue
    };

    const { otherConsumption, totalConsumption } = calculateConsumptions(updatedUser);

    try {

      const updatedFinanceData = {
        [financeField]: newValue,
        otherConsumption,
        totalConsumption
      };

      const updateResponse = await fetch(`${environment.apiURL}/api/finances/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFinanceData),
      });

      if (!updateResponse.ok) {
        throw new Error('No se pudo actualizar los datos financieros del usuario');
      }
      fetchData();
    } catch (error) {
      console.error(`Error al actualizar los datos financieros del usuario con ID ${userId}:`, error);
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
      {/* <div className="month-navigation">
        <button onClick={() => changeMonth(-1)}>Mes Anterior</button>
        <span>{`${currentMonth.toLocaleString('default', { month: 'long' })} ${currentMonth.getFullYear()}`}</span>
        <button onClick={() => changeMonth(1)}>Mes Siguiente</button>
      </div> */}
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
        <Select
          className="filter-select"
          value={selectedReservationPaymentStatus}
          onChange={(selected) => setSelectedReservationPaymentStatus(selected)}
          options={[
            { value: 'Si', label: 'Si' },
            { value: 'No', label: 'No' },
          ]}
          placeholder="Pago Reservas"
          isClearable
        />

        <Select
          className="filter-select"
          value={selectedWaterPaymentStatus}
          onChange={(selected) => setSelectedWaterPaymentStatus(selected)}
          options={[
            { value: 'No', label: 'No' },
            { value: 'Si', label: 'Si' },
          ]}
          placeholder="Pago Aguas"
          isClearable
        />

        <Select
          className="filter-select"
          value={selectedPreWorkoutPaymentStatus}
          onChange={(selected) => setSelectedPreWorkoutPaymentStatus(selected)}
          options={[
            { value: 'Si', label: 'Si' },
            { value: 'No', label: 'No' },
          ]}
          placeholder="Pago PreEntrenos"
          isClearable
        />
        <Link to={`/diary/${id}`}>
          <button className='butom-day-finance' >
            <FontAwesomeIcon icon={faCalendarDay} />
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
        <table className="user-table-finance">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Plan</th>
              <th>Inicio Mes</th>
              <th>Fin Mes</th>
              <th># Reservas</th>
              <th>$ Reservas</th>
              <th>pago Reservas$</th>
              <th># Aguas</th>
              <th>Pago Aguas$</th>
              <th># PreEntrenos</th>
              <th>Pago PreEntrenos$</th>
              <th>Usuario Activo </th>
              <th>$Pendiente Reservas</th>
              <th>$Pendiente otros</th>
              <th>Consumo Total</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((user) => {
              const userFinance = financeData.find(finance => finance.userId === user._id) || {};

              return (
                <tr key={user._id}>
                  <td>{user.FirstName + ' ' + user.LastName}</td>
                  <td>
                    {user.Plan}
                  </td>
                  <td>{userFinance.startDate}</td>
                  <td>{userFinance.endDate}</td>
                  <td>{user.reservationCount || 0}</td>
                  <td>$ {user.totalAmount || 0}</td>
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
                      className='num'
                      value={editableValues[user._id]?.numWaters || 0}
                      onChange={(e) => handleNumericFinanceChange(user._id, 'numWaters', e)}
                      min="0"
                      max="20"
                      style={{ width: '20px' }}
                    />
                  </td>
                  <td>
                    <select
                      style={{ color: userFinance.waterPaymentStatus === 'Si' ? '#0dab0d' : 'red' }}
                      value={userFinance.waterPaymentStatus}
                      onChange={(event) => handleFinanceChange(user._id, 'waterPaymentStatus', event.target.value)}
                    >
                      <option value="No">✖</option>
                      <option value="Si">✔</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className='num'
                      value={editableValues[user._id]?.numPreWorkouts || 0}
                      onChange={(e) => handleNumericFinanceChange(user._id, 'numPreWorkouts', e)}
                      min="0"
                      max="20"
                      style={{ width: '20px' }}
                    />
                  </td>
                  <td>
                    <select
                      style={{ color: userFinance.preWorkoutPaymentStatus === 'Si' ? '#0dab0d' : 'red' }}
                      value={userFinance.preWorkoutPaymentStatus}
                      onChange={(event) => handleFinanceChange(user._id, 'preWorkoutPaymentStatus', event.target.value)}
                    >
                      <option value="No">✖</option>
                      <option value="Si">✔</option>
                    </select>
                  </td>
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
                  <td style={{ color: userFinance.pendingBalance || user.pendingBalance > 0 ? '#a62525' : 'black' }}>
                    {userFinance.pendingBalance || user.pendingBalance > 0 ? `$ ${userFinance.pendingBalance || user.pendingBalance}` : '-'}
                  </td>
                  <td style={{ color: '#a62525' }}>
                    {userFinance.otherConsumption ? `$ ${userFinance.otherConsumption}` : 0}
                  </td>
                  <td style={{ color: userFinance.totalConsumption > 0 ? 'green' : 'black' }}>
                    {userFinance.totalConsumption ? `$ ${userFinance.totalConsumption}` : 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Finance;
