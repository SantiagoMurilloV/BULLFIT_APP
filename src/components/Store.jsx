import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Modal from 'react-modal';
import '../components/styles/Finance.css';
import { environment } from '../environments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDollarSign, faPlus , faTrash} from '@fortawesome/free-solid-svg-icons';


Modal.setAppElement('#root');
const Store = () => {
  const [users, setUsers] = useState([]);
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showPaidConsumptions, setShowPaidConsumptions] = useState(false);
  const [storeConsumptions, setStoreConsumptions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());


  const getUserOptions = () => {
    return users.map(user => ({
      value: user._id, 
      label: `${user.FirstName} ${user.LastName}`
    }));
  };

  useEffect(() => {
    fetchUserData()
    fetchStoreData()
  }, [id, searchTerm, currentMonth]);


  useEffect(() => {
    const filterStoreConsumptions = () => {
      return storeConsumptions.filter(consumption => {
        if (consumption.name && typeof consumption.name.label === 'string') {
          return consumption.name.label.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    };
    
    setSearchResults(filterStoreConsumptions());
  }, [storeConsumptions, searchTerm]);


  const fetchUserData = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/users`);
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);

    } catch (error) {

    }
  };
  const fetchStoreData = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/store`);
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      const data = await response.json();
      setStoreConsumptions(data)
      setLoading(false);

    } catch (error) {

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

  }, [users, financeData]);

  const handleAddConsumption = () => {
    setStoreConsumptions([...storeConsumptions, { name: '', item: '', quantity: 0, value: 0, paymentStatus: 'No' }]);
  };


  const itemPrices = {
    waters: 4000,
    PreWorkouts: 6000,
    proteins: 10000
  };


  const handleConsumptionChange = async (index, field, value) => {
    const newConsumptions = [...storeConsumptions];
    const currentConsumption = { ...newConsumptions[index] };

    if (field === 'item' || field === 'quantity') {
      currentConsumption[field] = value;
      const itemPrice = itemPrices[currentConsumption.item] || 0;
      currentConsumption.value = itemPrice * (currentConsumption.quantity || 0);
    } else {
      currentConsumption[field] = value;
    }
    newConsumptions[index] = currentConsumption;
    setStoreConsumptions(newConsumptions);

    if (currentConsumption._id) {
      await updateConsumption(currentConsumption._id, currentConsumption);
    } else if (field === 'name' && value) {
      const newConsumptionId = await createConsumption(currentConsumption);
      currentConsumption._id = newConsumptionId;
      newConsumptions[index] = currentConsumption;
      setStoreConsumptions(newConsumptions);
    }
  };

  const createConsumption = async (consumption) => {
    try {
      const response = await fetch(`${environment.apiURL}/api/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consumption),
      });
      if (!response.ok) throw new Error('Error al crear consumo')
      const newConsumption = await response.json();
      fetchStoreData()
      return newConsumption._id; 

    } catch (error) {
      console.error('Error al crear consumo:', error);
      Swal.fire('Error', 'Ha ocurrido un error al crear el consumo.', 'error');
      return null;
    }
  };

  const updateConsumption = async (consumptionId, consumption) => {
    try {
      const response = await fetch(`${environment.apiURL}/api/store/${consumptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consumption),
      });
      if (!response.ok) throw new Error('Error al actualizar consumo');

    } catch (error) {
      console.error('Error al actualizar consumo:', error);
      Swal.fire('Error', 'Ha ocurrido un error al actualizar el consumo.', 'error');
    }
  };
  const handleDeleteReservation = (consumptionId) => {
    Swal.fire({
      title: '¿Está seguro de eliminar esta reserva?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${environment.apiURL}/api/store/${consumptionId}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (response.ok) {
              fetchStoreData()
              Swal.fire('Eliminado', 'La reserva ha sido eliminada.', 'success');
            } else {
              Swal.fire('Error', 'No se pudo eliminar la reserva.', 'error');
            }
          });
      }
    });
  };


  return (
    <div>
      <h2>Registro de Consumo.</h2>
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
          onClick={() => setShowPaidConsumptions(!showPaidConsumptions)}>
          {showPaidConsumptions ? 'Historial de Consumo' : 'Consumos Pendientes'}
        </button>

        <button className='butom-day-finance' onClick={handleAddConsumption}><FontAwesomeIcon icon={faPlus} /></button>
        <Link to={`/finances/${id}`}>
          <button className='butom-day-finance' >
            <FontAwesomeIcon icon={faDollarSign} />
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
          <div>
            
            <table className="user-table-finance">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Item</th>
                  <th>Cantidad</th>
                  <th>Valor</th>
                  <th>Confirmacion Pago</th>
                  <th>Borrar</th>
                </tr>
              </thead>
              <tbody>
                {storeConsumptions
                  .filter(consumption => 
                    showPaidConsumptions ? consumption.paymentStatus === 'Si' : consumption.paymentStatus === 'No')
                  .map((consumption, index) => (
                  <tr key={index}>
                    <td>
                      {consumption._id
                        ? consumption.name
                        : <Select
                            options={getUserOptions()}
                            value={consumption.name}
                            onChange={(selectedOption) => handleConsumptionChange(index, 'name', selectedOption)}
                          />
                      }
                    </td>
                    <td>
                      <select value={consumption.item} onChange={(e) => handleConsumptionChange(index, 'item', e.target.value)}>
                        <option value=""></option>
                        <option value="waters">Aguas</option>
                        <option value="PreWorkouts">Preentrenos</option>
                        <option value="proteins">Proteinas</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className='num'
                        value={consumption.quantity || 0}
                        min="0"
                        onChange={(e) => handleConsumptionChange(index, 'quantity', parseInt(e.target.value))}
                      />
                    </td>
                    <td>${storeConsumptions.value || consumption.value}</td>
                    <td>
                      <select 
                        style={{ color: consumption.paymentStatus === 'Si' ? '#0dab0d' : 'red' }}
                        value={consumption.paymentStatus} 
                        onChange={(e) => handleConsumptionChange(index, 'paymentStatus', e.target.value)}>
                        <option value="No">✖</option>
                        <option value="Si">✔</option>
                      </select>
                    </td>
                    <td>
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="delete-icon"
                        onClick={() => handleDeleteReservation(consumption._id)}
                        style={{ color: 'red', cursor: 'pointer' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Store;
