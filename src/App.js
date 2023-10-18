import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Customers from './components/Customers';
import Reservations from './components/Reservations';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route
          path="/customers"
          element={<Customers user={currentUser} />}
        />
        <Route path="/reservations" element={<Reservations user={currentUser}/>} />
      </Routes>
    </Router>
  );
}

export default App;
