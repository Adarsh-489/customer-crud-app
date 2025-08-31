// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerListPage from './pages/CustomerListPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import CustomerFormPage from './pages/CustomerFormPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerListPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/add-customer" element={<CustomerFormPage />} />
        <Route path="/edit-customer/:id" element={<CustomerFormPage />} />
      </Routes>
    </Router>
  );
}

export default App;
