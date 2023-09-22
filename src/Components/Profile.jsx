import React, { useState } from 'react'

import '../Styles/Profile.css'



const defaultProfilePicture = `${process.env.PUBLIC_URL}/Image/Logos/Recurso214.png`
export const Profile = ({ user, onEditProfile, onRequestCancellation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(user.profilePicture || defaultProfilePicture);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = () => {
    // Lógica para guardar la imagen y actualizar `user.profilePicture`
    // ...
    setIsEditing(false);
  };

  return (
    <div>
      <div className='logos'>

      <div className='more-info'>
      <img
          src={`${process.env.PUBLIC_URL}/Image/Logos/plus.png`}
          alt="more-info"
          className="more-personal-info"
          id="more-info"
        />
          <img
          src={`${process.env.PUBLIC_URL}/Image/Logos/ROW.png`}
          alt="back"
          className="back"
          id="back"
        />
      
      </div>
      </div>
    <div className="profile">
      <div className="profile-picture">
        <img src={newProfilePicture} alt="Profile" />
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewProfilePicture(URL.createObjectURL(e.target.files[0]))}
          />
        )}
      </div>
      <div className="profile-actions">
        <img
          src={`${process.env.PUBLIC_URL}/Image/Logos/edt.png`}
          alt="Imagen de salir"
          className="logout-image"
          id="logout-image"
          onClick={handleEditClick}
        />
      </div>
      <h2 className="userName">{user.FullName}</h2>
      <div className="info-box">
        <h2>Plan: {user.Plan}</h2>
        <h2>Activo: {user.Active}</h2>
      </div>
      <div className="profile-footer">
        {isEditing ? (
          <>
            <button onClick={handleSaveProfile}>Guardar</button>
            <button onClick={handleCancelEdit}>Cancelar</button>
          </>
        ) : (
          <button onClick={onRequestCancellation}>Solicitar Cancelación</button>
        )}
      </div>
    </div>
    </div>
  );
};
