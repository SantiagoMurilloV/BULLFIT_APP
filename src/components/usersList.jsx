import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Modal from 'react-modal';
import '../components/styles/UserList.css';
import { environment } from '../environments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';


Modal.setAppElement('#root');
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');


  useEffect(() => {
    fetchData();
  }, [id, searchTerm]);

  useEffect(() => {
    const filterUsers = () => {
      return users.filter((user) => {
        const matchesName = user.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.LastName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = selectedPlan ? user.Plan === selectedPlan.value : true;
        const matchesStatus = selectedStatus ? user.Active === selectedStatus.value : true;
        return matchesName && matchesPlan && matchesStatus;
      });
    };
    setSearchResults(filterUsers());
  }, [users, searchTerm, selectedPlan, selectedStatus]);


  const fetchData = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/users`);
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      const data = await response.json();

      const filteredResults = data.filter(
        (user) =>
          user.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.LastName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setUsers(data);
      setSearchResults(filteredResults);
      setLoading(false);

      const userResponse = await fetch(`${environment.apiURL}/api/users/${id}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error al cargar los datos', 'Ha ocurrido un error al cargar los datos.', 'error');
    }
  };

  const openModal = (user) => {
    setEditingUser(user);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingUser(null);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser({ ...editingUser, [name]: value });
  };

  const handleDeleteUser = (userId) => {
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
        fetch(`${environment.apiURL}/api/users/${userId}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (response.ok) {
              Swal.fire('Eliminado', 'La reserva ha sido eliminada.', 'success');
              fetchData();
            } else {
              Swal.fire('Error', 'No se pudo eliminar la reserva.', 'error');
            }
          });
      }
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${environment.apiURL}/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      });

      if (response.ok) {
        Swal.fire('Actualizado', 'Usuario actualizado con éxito', 'success');
        closeModal();
        fetchData();
      } else {
        throw new Error('Error al actualizar el usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
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

      if (response.ok) {
        fetchData();
      } else {
        throw new Error('Error al actualizar el plan del usuario');
      }
    } catch (error) {
      console.error('Error al actualizar el plan del usuario:', error);
      Swal.fire('Error al actualizar el plan', 'Ha ocurrido un error al actualizar el plan del usuario.', 'error');
    }
  };


  return (
    <div>
      <h2>Lista de Usuarios</h2>
      <div className="filters-container">
        <Link to={`/diary/${id}`} className="button-r">Agenda</Link>

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
          placeholder="Estado"
          isClearable
        />
      </div>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Celular</th>
              <th>Cédula</th>
              <th>Plan</th>
              <th>Estado $</th>
              <th>Fecha Inicial</th>
              <th>Fecha Final</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((user) => (
              <tr key={user._id}>
                <td>{user.FirstName + ' ' + user.LastName}</td>
                <td>{user.Phone}</td>
                <td>{user.IdentificationNumber}</td>
                <td>
                  <Select
                    value={{ value: user.Plan, label: user.Plan }}
                    onChange={(selectedOption) => handlePlanChange(user._id, selectedOption.value)}
                    options={[
                      { value: ' ', label: ' ' },
                      { value: 'Diario', label: 'Diario' },
                      { value: 'Mensual', label: 'Mensual' },
                    ]}
                  />
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
                <td>{user.startDate}</td>
                <td>{user.endDate}</td>
                <td>
                  <button onClick={() => openModal(user)}><FontAwesomeIcon icon={faEdit} /></button>
                  <button onClick={() => handleDeleteUser(user._id)}><FontAwesomeIcon icon={faTrash} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Editar Usuario"
        className="Modal-userList"
      >
        <h2>Editar Usuario</h2>
        {editingUser && (
          <form onSubmit={handleSubmit}>
            <div className="form-group-userList">
              <label>
                Nombre:
                <input
                  type="text"
                  name="FirstName"
                  value={editingUser.FirstName}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Apellido:
                <input
                  type="text"
                  name="LastName"
                  value={editingUser.LastName}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <div className="form-group-userList">
              <label>
                Número de Celular:
                <input
                  type="text"
                  name="Phone"
                  value={editingUser.Phone}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Cédula:
                <input
                  type="text"
                  name="IdentificationNumber"
                  value={editingUser.IdentificationNumber}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <button type="submit">Guardar Cambios</button>
          </form>
        )}
        <button onClick={closeModal}>Cerrar</button>
      </Modal>
    </div>
  );
};

export default UserList;
