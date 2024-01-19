import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Link, useParams } from 'react-router-dom';
import Select from 'react-select';
import 'moment/locale/es';
import '../components/styles/Profile.css';
import { environment } from '../environments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faSignOut,faUserAlt } from '@fortawesome/free-solid-svg-icons';




const Profile = () => {
  const [user, setUser] = useState(null);
  const [financeInfo, setFinanceInfo] = useState(null);
  const { id } = useParams();
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [failsCount, setfailsCount] = useState(0)
  const [reservationsCount, setreservationsCount] = useState(0);
  const [showMonthlyReservationForm, setShowMonthlyReservationForm] = useState(false);
  const [storeConsumptions, setStoreConsumptions] = useState([]);
  const [financeRecords, setFinanceRecords] = useState([]);
  const [monthlyReservationData, setMonthlyReservationData] = useState({
    hour: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {

    fetch(`${environment.apiURL}/api/users/${id}`)
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

      const fetchFinanceData = async () => {
        try {
          const response = await fetch(`${environment.apiURL}/api/finances/${id}`);
          if (!response.ok) {
            throw new Error('Error al obtener datos financieros');
          }
          const financeData = await response.json();
          setFinanceInfo(financeData);
        } catch (error) {
          console.error('Error al obtener datos financieros:', error);
        }
      };
      

    const fetchAttendanceData = async () => {
      try {
        const response = await fetch(`${environment.apiURL}/api/reservations/${id}`);
        if (!response.ok) {
          throw new Error('Error al obtener reservas del usuario');
        }
        const reservations = await response.json();
        const count = reservations.filter(reservation => reservation.Attendance === 'Si').length;
        const fails = reservations.filter(reservation => reservation.Attendance === 'No').length;
        const totalCount = reservations.length;
        setreservationsCount(totalCount)
        setAttendanceCount(count);
        setfailsCount(fails)
      } catch (error) {
        console.error('Error al obtener reservas del usuario:', error);
      }
    };

    const fetchStoreData = async () => {
      try {
        const response = await fetch(`${environment.apiURL}/api/storeUser/${id}`);
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        const data = await response.json();
        setStoreConsumptions(data)
      } catch (error) {

      }
    };

    fetchAttendanceData();
    fetchStoreData()
    fetchFinanceData();
  }, [id]);

  const handleOpenMonthlyReservationForm = () => {
    setShowMonthlyReservationForm(true);
  };
  const createReservation = (reservationData) => {
    fetch(`${environment.apiURL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudo crear la reserva');
        }
      })
      .catch((error) => {
        console.error('Error al crear reserva:', error);
        Swal.fire('Error', 'No se pudo crear la reserva.', 'error');
      });
  };


  const shouldShowRenewButton = () => {
    const today = new Date();
    const endDate = new Date(user?.endDate);
    const differenceInDays = (endDate - today) / (1000 * 3600 * 24);
    return differenceInDays <= 3 && differenceInDays >= 0;
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    const newEndDate = moment(newStartDate).add(1, 'month').format('YYYY-MM-DD');

    setMonthlyReservationData({
      ...monthlyReservationData,
      startDate: newStartDate,
      endDate: newEndDate,
    });
  };
  const fetchFinanceData = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/finances/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener datos financieros');
      }
      const financeData = await response.json();
      setFinanceInfo(financeData);
      setFinanceRecords(financeData);
    } catch (error) {
      console.error('Error al obtener datos financieros:', error);
    }
  };


  const handleSaveMonthlyReservation = async () => {
    const startDate = moment(monthlyReservationData.startDate);
    const endDate = moment(startDate).add(1, 'month');

    for (let date = moment(startDate); date.isBefore(endDate); date.add(1, 'day')) {
      if (date.isoWeekday() <= 5) { 
        const reservationData = {
          userId: id,
          day: date.format('YYYY-MM-DD'),
          hour: monthlyReservationData.hour ? monthlyReservationData.hour.value : null,
        };

        try {
          await createReservation(reservationData);
        } catch (error) {
          console.error('Error al crear reserva:', error);
        }
      }
    }

    setShowMonthlyReservationForm(false);
    Swal.fire({
      title: 'Reserva Creada',
      text: 'Las reservas mensuales están siendo procesadas.',
      icon: 'success'
    }).then(() => {
    });
  };
  const renewMembershipAndPostFinanceData = async () => {

    const newFinanceData = {
      userId: id,
      Active: user.Active || 'No',
      FirstName: user.FirstName || '',
      LastName: user.LastName || '',
      IdentificationNumber: user.IdentificationNumber || '',
      Phone: user.Phone || '',
      Plan: user.Plan || '',
      startDate: monthlyReservationData.startDate,
      endDate: monthlyReservationData.endDate
    };
    try {
      const response = await fetch(`${environment.apiURL}/api/finances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFinanceData),
      });

      if (!response.ok) {
        throw new Error('No se pudo renovar la membresía');
      }

      Swal.fire('Éxito', 'Membresía renovada y datos financieros actualizados', 'success');

      fetchFinanceData();
    } catch (error) {
      console.error('Error al renovar membresía:', error);
      Swal.fire('Error', 'No se pudo renovar la membresía.', 'error');
    }
  };


  const handleChange = (name, value) => {
    setMonthlyReservationData({
      ...monthlyReservationData,
      [name]: value,
    });
  };

  const availableHours = [
    { value: ' ', label: ' ' },
    { value: '06:00', label: '06:00' },
    { value: '07:00', label: '07:00' },
    { value: '08:00', label: '08:00' },
    { value: '09:00', label: '09:00' },
    { value: '10:00', label: '10:00' },
    { value: '16:00', label: '04:00 pm' },
    { value: '17:00', label: '05:00 pm' },
    { value: '18:00', label: '06:00 pm' },
    { value: '19:00', label: '07:00 pm' },
    { value: '20:00', label: '08:00 pm' },
  ];
  const handleRenewButtonClick = () => {
    handleOpenMonthlyReservationForm();
    renewMembershipAndPostFinanceData();
  };

  const renderFinanceInfo = () => {
    const today = new Date();
    return financeRecords.filter(record => record.reservationPaymentStatus === 'No').map((record, index) => {
      const endDate = new Date(record.endDate);
      const isPastDue = endDate < today;
      const financeInfoStyle = {
        color: isPastDue ? 'red' : 'black',
        fontWeight: index === 0 ? 'bold' : 'normal', 
      };

      return (
        <div key={index} className="finance-info" style={financeInfoStyle}>
          {/* ... */}
        </div>
      );
    });
  };



  return (
    <div className="Profile-container">
      <div className="profile-header">

      <FontAwesomeIcon className="profile-image" icon={faUserAlt} />
        <h1>{user ? user.FirstName + ' ' + user.LastName : 'N/A'}</h1>
        <div className="reservations-info">
          <p><strong>Número de Reservas:</strong> {reservationsCount}</p>
          <p><strong>Asistencias:</strong> {attendanceCount}</p>
          <p><strong>Faltas:</strong> {failsCount}</p>
          <div className="profile-buttons">

            <Link to={`/customers/${id}`} className="button-link">
            <FontAwesomeIcon className="profile-button-image" icon={faSignOut} />
            </Link>
          </div>
        </div>
      </div>
      <div className="profile-info">
        <div className="profile-details">
          <p>
            <strong>Cedula:</strong> {user ? user.IdentificationNumber : ''}
          </p>
          <p>
            <strong>Teléfono:</strong> {user ? user.Phone : ''}
          </p>
          <p style={{ backgroundColor: user?.Active === 'Sí' ? '#0ab40a' : user?.Active === 'No' ? '#fa3636' : 'transparent' }}>
            <strong> Usuarios Activo    :     </strong>{user ? user.Active : ' '}
          </p>
          <p style={{ backgroundColor: user?.Plan === 'Diario' ? '#aadaff' : user?.Plan === 'Mensual' ? '#6ba06b' : 'transparent' }}>
            <strong> Plan     :     </strong>{user ? user.Plan : ' '}
          </p>
          <p>
            <strong>Fecha de Ingreso:</strong> {user ? user.registrationDate : ''}
          </p>
        </div>
        {shouldShowRenewButton() && user && user.Plan === 'Mensual' && (
          <button onClick={handleRenewButtonClick}>Renovar reserva Mensual</button>
        )}
      </div>
      {

        <div className="profile-info">
          <hr></hr>
          <h3 style={{color:'#2049e0'}}><strong>Consumo</strong></h3>
          {
            financeInfo && financeInfo.reservationPaymentStatus === 'Si' ?
              <p style={{  color: 'green' }}>
                <strong>Sin saldo pendiente...</strong>
              </p>
            :
            <p style={{ color: 'rgb(255 0 0 / 89%)' }}>
            <strong>Saldo pendiente de plan {user ? user.Plan : ' '}:</strong>_   
            <strong>{financeInfo ? `$ ${financeInfo.pendingBalance} COP` : ' '}</strong>
            
          </p>
        }
        </div>


      }


      {
        storeConsumptions.some(consumption => consumption.paymentStatus === 'No') && (
          <div className="profile-info">
            {storeConsumptions
              .filter(consumption => consumption.paymentStatus === 'No')
              .map(consumption => (
                <div key={consumption._id}>
                  <hr></hr>
                  <p><strong>Fecha y hora de consumo:</strong> {consumption.dateOfPurchase} - {consumption.purchaseTime} </p>
                  <p><strong>Producto: </strong>{consumption.item}</p>
                  <p><strong>Cantidad:</strong> {consumption.quantity}</p>
                  <p  style={{ color: 'rgb(255 0 0 / 89%)' }}><strong>Valor pendiente: </strong>$ {consumption.value} COP</p>
                </div>
              ))
            }
          </div>
        )
      }
      {showMonthlyReservationForm && (
        <div className="overlay">
          <div className="reservation-form">
            <label>Hora:</label>
            <Select
              options={availableHours}
              value={monthlyReservationData.hour}
              onChange={(selectedOption) => handleChange('hour', selectedOption)}
              placeholder="Selecciona una hora"
            />

            <label>Fecha de inicio:</label>
            <input
              type="date"
              value={monthlyReservationData.startDate}
              onChange={handleStartDateChange}
            />
            {monthlyReservationData.startDate && (
              <p>Fecha de finalización: {monthlyReservationData.endDate}</p>
            )}
            <button onClick={handleSaveMonthlyReservation}>Guardar Reservas</button>
            <button onClick={() => setShowMonthlyReservationForm(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
