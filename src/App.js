import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Customers from './components/Customers';
import Reservations from './components/Reservations';
import Profile from './components/Profile'
import EditReservation from './components/EditReservations'
import Admin from './components/Admin';
import RegisterUsers from './components/RegisterUser';
import Diary from './components/Diary';
import UserList from './components/usersList';
import Finances from './components/Finances';
import Store from './components/Store';
import ReservationHistory from './components/ReservationHistory';
import QuotaLimits from './components/QuotaLimits'
import Summary from './components/Summary';

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
        <Route path="/admin/:id" element = {<Admin currentUser={currentUser} />}/>
        <Route path="/registerUsers/:id" element = {<RegisterUsers />}/>
        <Route path="/diary/:id" element = {<Diary />}/>
        <Route path="/userList/:id" element = {<UserList />}/>
        <Route path="/finances/:id" element = {<Finances />}/>
        <Route path="/store/:id" element = {<Store />}/>
        <Route path="/reservationHistory/:id" element = {<ReservationHistory/>}/>
        <Route path="/quotaLimits/:id" element = {<QuotaLimits/>}/>
        <Route path="/summary/:id" element = {<Summary/>}/>
      </Routes>
    </Router>
  );

  function handleLogin(user) {
    setCurrentUser(user);
  }
}

export default App;
