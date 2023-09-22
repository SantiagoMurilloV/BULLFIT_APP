import React, { useState, useEffect } from 'react';
import Login from './Login';
import StartScreen from './Start';
import {Profile} from './Profile'; 
import '../Styles/App.css';
import { usersData } from '../Helpers/usersData.js';
import Swal from 'sweetalert2';

export const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isProfile, setIsProfile] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = (phone, password) => {
    const user = usersData.find((user) => user.Phone === phone && user.IdentificationNumber === password);
  //  const user = true 
    if (user) {
      setCurrentUser(user);
      setLoggedIn(true);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error de inicio de sesión',
        text: 'Los datos de inicio de sesión son incorrectos. Por favor, inténtalo de nuevo.',
        customClass: {
          confirmButton: 'custom-confirm-button-class', 
        },
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoggedIn(false);
    setIsProfile(false); 
    localStorage.removeItem('loggedInUser');
  };

  const handleProfileClick = () => {
    setIsProfile(true); 
  };

  return (
    <div className="App">
      {loggedIn ? (
        isProfile ? (
          <Profile user={currentUser} onLogout={handleLogout} />
        ) : (
          <StartScreen user={currentUser} onLogout={handleLogout} onProfileClick={handleProfileClick} />
        )
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};
