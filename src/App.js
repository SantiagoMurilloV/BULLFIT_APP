import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Customers from './components/Customers';
import Reservations from './components/Reservations';
import Profile from './components/Profile'
import EditReservation from './components/EditReservations'
function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login handleLogin={handleLogin} />} />
        <Route path="/customers/:id" element={<Customers currentUser={currentUser} />} />
        <Route path="/reservations/:id" element={<Reservations />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/editReservation/:id" element={<EditReservation />} />
      </Routes>
    </Router>
  );

  function handleLogin(user) {
    setCurrentUser(user);
  }
}

export default App;
