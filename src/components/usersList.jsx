import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Modal from 'react-modal';
import '../components/styles/UserList.css';
import { environment } from '../environments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash , faHome, faDownload, faFileDownload, faAmbulance} from '@fortawesome/free-solid-svg-icons';


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
  const [termsLink, setTermsLink] = useState(null);
  const [ambulanceModalIsOpen, setAmbulanceModalIsOpen] = useState(false);
const [selectedUserForAmbulance, setSelectedUserForAmbulance] = useState(null);



  useEffect(() => {
    fetchData();
    fetchTermsLink();
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
  const fetchTermsLink = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/termsAndConditions`);
      if (response.ok) {
        const termsData = await response.json();
        const linksMap = {};
        termsData.forEach(term => {
          if (term.link && term.userId) {
            linksMap[term.userId] = term.link;
          }
        });
        setTermsLink(linksMap);
      }
    } catch (error) {
      console.error('Error al cargar los términos y condiciones:', error);
      setTermsLink({});
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


  const openAmbulanceModal = (user) => {
    setSelectedUserForAmbulance(user);
    setAmbulanceModalIsOpen(true);
  };
  const closeAmbulanceModal = () => {
    setAmbulanceModalIsOpen(false);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    let newEditingUser = { ...editingUser, [name]: value };

    setEditingUser(newEditingUser);
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
        fetch(`${environment.apiURL}/api/finances/${userId}`, {
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
      // Actualiza la información del usuario
      const userResponse = await fetch(`${environment.apiURL}/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      });
  
      // Verifica si la actualización del usuario fue exitosa
      if (!userResponse.ok) {
        throw new Error('Error al actualizar la información del usuario.');
      }
  
      // Prepara el objeto para actualizar solo el nombre y el apellido en userFinance
      const financeUpdateData = {
        FirstName: editingUser.FirstName,
        LastName: editingUser.LastName,
      };
  
      // Actualiza la información financiera del usuario
      const financeResponse = await fetch(`${environment.apiURL}/api/userFinance/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financeUpdateData),
      });
  
      // Verifica si la actualización financiera fue exitosa
      if (!financeResponse.ok) {
        throw new Error('Error al actualizar la información financiera del usuario.');
      }
  
      // Si ambas actualizaciones son exitosas
      Swal.fire('Actualizado', 'Usuario actualizado con éxito', 'success');
      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo actualizar la información.', 'error');
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
  

      const userUpdateResponse = await fetch(`${environment.apiURL}/api/users/${id}`);
      if (!userUpdateResponse.ok) throw new Error('Error al recuperar la información actualizada del usuario');
  
      const userData = await userUpdateResponse.json();
      setUser(userData);
   
      fetchData();

    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
      Swal.fire('Error al actualizar el estado', 'Ha ocurrido un error al actualizar el estado del usuario.', 'error');
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
              <Link to={`/admin/${id}`}>
          <button className='butom-day-diary' >
            <FontAwesomeIcon icon={faHome} />
          </button>
        </Link>
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
              <th>Estado $</th>
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
                    value={{ value: user.Active, label: user.Active }}
                    onChange={(selectedOption) => handleStatusChange(user._id, selectedOption.value)}
                    options={[
                      { value: ' ', label: ' ' },
                      { value: 'Sí', label: 'Sí' },
                      { value: 'No', label: 'No' },
                    ]}
                  />
                </td>

                <td>
                {termsLink && termsLink[user._id] && (
                    <a href={termsLink[user._id]} target="_blank" rel="noopener noreferrer">
                      <button><FontAwesomeIcon icon={faFileDownload} /></button>
                    </a>
                  )}
                  <button className='button-actions' onClick={() => openAmbulanceModal(user)}>
                    <FontAwesomeIcon icon={faAmbulance} />
                  </button>
                  <button className='button-actions'   onClick={() => openModal(user)}><FontAwesomeIcon icon={faEdit} /></button>
                  <button className='button-actions' onClick={() => handleDeleteUser(user._id)}><FontAwesomeIcon icon={faTrash} /></button>
                </td>
 
              </tr>
            ))}
          </tbody>
        </table>
      )}
          <Modal
      isOpen={ambulanceModalIsOpen}
      onRequestClose={closeAmbulanceModal}
      contentLabel="Editar Usuario"
      className="Modal-userList"
>
        <h2>Contacto de Emergencia</h2>
        {editingUser && (
          <form onSubmit={handleSubmit}>
            <div className="form-group-userList">
              <label>
                <p><strong>Nombre :</strong>{user.nameEmergency ? user.nameEmergency : '' }</p>
              </label>
              <label>
              <p><strong>Apellido :</strong>{user.LastNameEmergency ? user.LastNameEmergency : '' }</p>
              </label>
            </div>

            <div className="form-group-userList">
              <label>
              <p><strong>Celular :</strong>{user.PhoneEmergency ? user.PhoneEmergency : '' }</p>
              </label>
              <button onClick={closeAmbulanceModal}>Cerrar</button>
            </div>
          </form>
        )}
        
    </Modal>

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
