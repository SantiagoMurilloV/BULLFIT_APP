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


  useEffect(() => {
    fetchData();
  }, [id, searchTerm]);

  useEffect(() => {
    const filterUsers = () => {
      return users.map(user => ({
        
        ...user,
        matchesReservationPaymentStatus: selectedReservationPaymentStatus ? user.reservationPaymentStatus === selectedReservationPaymentStatus.value : true,
        matchesWaterPaymentStatus: selectedWaterPaymentStatus ? user.waterPaymentStatus === selectedWaterPaymentStatus.value : true,
        matchesPreWorkoutPaymentStatus: selectedPreWorkoutPaymentStatus ? user.preWorkoutPaymentStatus === selectedPreWorkoutPaymentStatus.value : true,
        matchesName: user.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) || user.LastName.toLowerCase().includes(searchTerm.toLowerCase()),
        matchesPlan: selectedPlan ? user.Plan === selectedPlan.value : true,
        matchesStatus: selectedStatus ? user.Active === selectedStatus.value : true
      })).filter(user => user.matchesName && user.matchesPlan && user.matchesStatus && user.matchesReservationPaymentStatus && user.matchesWaterPaymentStatus && user.matchesPreWorkoutPaymentStatus);
    };
    setSearchResults(filterUsers());
  }, [users, searchTerm, selectedPlan, selectedStatus, selectedReservationPaymentStatus , selectedWaterPaymentStatus, selectedPreWorkoutPaymentStatus]);


  const fetchData = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/users`);
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);
      fetchReservations(data);
    } catch (error) {

    }
  };
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


  const countReservationsByUser = (users, reservations) => {

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
      const waterCost = user.numWaters ? user.numWaters * 4000 : 0;
      const preWorkoutCost = user.numPreWorkouts ? user.numPreWorkouts * 6000 : 0;


      return {
        ...user,
        reservationCount: reservationCount[user._id] || 0,
        totalAmount: reservationCost,
        pendingBalance: reservationCost,
        totalConsumption: reservationCost + waterCost + preWorkoutCost,
        reservationPaymentStatus: user.reservationPaymentStatus || 'No',
        waterPaymentStatus: user.waterPaymentStatus || 'No',
        preWorkoutPaymentStatus: user.preWorkoutPaymentStatus || 'No',
        numWaters: 0,
        numPreWorkouts: 0
      };
    });

    setUsers(updatedUsers);
  };

  const handleItemChange = (userId, item, value) => {
    const updatedUsers = users.map(user => {
      if (user._id === userId) {
        let updatedValue = parseInt(value, 10) || 0;
        let newWaterCost = item === 'numWaters' ? updatedValue * 4000 : user.numWaters * 4000;
        let newPreWorkoutCost = item === 'numPreWorkouts' ? updatedValue * 6000 : user.numPreWorkouts * 6000;

        return {
          ...user,
          [item]: updatedValue,
          totalConsumption: user.totalAmount > 0 ? user.totalAmount + newWaterCost + newPreWorkoutCost : user.totalAmount
        };
      }
      return user;
    });
    setUsers(updatedUsers);
  };


  const handleReservationPaymentStatusChange = (userId, newStatus) => {
    const updatedUsers = users.map(user => {
      if (user._id === userId) {
        console.log("Filtrando por:", selectedReservationPaymentStatus, selectedWaterPaymentStatus, selectedPreWorkoutPaymentStatus);

        return {
          ...user,
          reservationPaymentStatus: newStatus
        };
      }
      return user;
    });
    setUsers(updatedUsers);
  };



  const handleWaterPaymentStatusChange = (userId, newStatus) => {
    const updatedUsers = users.map(user => {
      if (user._id === userId) {

        return {
          ...user,
          waterPaymentStatus: newStatus,
        };
      }
      return user;
    });
    setUsers(updatedUsers);
  };



  const handlePreWorkoutPaymentStatusChange = (userId, newStatus) => {
    const updatedUsers = users.map(user => {
      if (user._id === userId) {
        return {
          ...user,
          preWorkoutPaymentStatus: newStatus,
        };
      }
      return user;
    });
    setUsers(updatedUsers);
  };
  const paymentStatusStyles = {
    'Si': { backgroundColor: 'green' },
    'No': { backgroundColor: '#b50707' },
    'default': { backgroundColor: 'white' }
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
            {searchResults.map((user) => (
              <tr key={user._id}>
                <td>{user.FirstName + ' ' + user.LastName}</td>
                <td>
                  {user.Plan}
                </td>
                <td>{user.startDate}</td>
                <td>{user.endDate}</td>
                <td>{user.reservationCount}</td>
                <td>$ {user.totalAmount ? user.totalAmount : 0}</td>
                <td>

                  <select
                    style={paymentStatusStyles[user.reservationPaymentStatus] || paymentStatusStyles['No']}
                    value={user.reservationPaymentStatus}
                    onChange={(event) => handleReservationPaymentStatusChange(user._id, event.target.value)}
                  >
                    <option value="No">✖</option>
                    <option value="Si">✔</option>
                  </select>

                </td>
                <td>
                  <input
                    className='num'
                    value={user.numWaters}
                    onChange={(e) => handleItemChange(user._id, 'numWaters', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    style={paymentStatusStyles[user.waterPaymentStatus] || paymentStatusStyles['No']}
                    value={user.waterPaymentStatus}
                    onChange={(event) => handleWaterPaymentStatusChange(user._id, event.target.value)}
                  >
                    <option value="No">✖</option>
                    <option value="Si">✔</option>
                  </select>
                </td>
                <td>
                  <input
                    className='num'
                    value={user.numPreWorkouts}
                    onChange={(e) => handleItemChange(user._id, 'numPreWorkouts', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    style={paymentStatusStyles[user.preWorkoutPaymentStatus] || paymentStatusStyles['No']}
                    value={user.preWorkoutPaymentStatus || 'No'}
                    onChange={(event) => handlePreWorkoutPaymentStatusChange(user._id, event.target.value)}
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
                <td style={{ color: user.pendingBalance > 0 ? '#a62525' : 'black' }}>
                  {user.pendingBalance > 0 ? `$ ${user.pendingBalance}` : '-'}
                </td>
                <td style={{ color: '#a62525' }}>
                  ${0 + user.numWaters * 4000 + user.numPreWorkouts * 6000}
                </td>
                <td style={{ color: user.totalConsumption > 0 ? 'green' : 'black' }}>
                  {user.totalConsumption > 0 ? `$ ${user.totalConsumption}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Finance;
