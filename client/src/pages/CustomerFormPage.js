import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      axios.get(`http://localhost:5000/api/customers/${id}`)
        .then(res => {
          const customer = res.data.data;
          setFirstName(customer.first_name);
          setLastName(customer.last_name);
          setPhoneNumber(customer.phone_number);
        })
        .catch(() => setError('⚠️ Failed to fetch customer'));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const data = { first_name: firstName, last_name: lastName, phone_number: phoneNumber };
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/customers/${id}`, data);
      } else {
        await axios.post('http://localhost:5000/api/customers', data);
      }
      navigate('/');
    } catch {
      setError('⚠️ Failed to save customer');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{isEdit ? '✏️ Edit Customer' : '➕ Add Customer'}</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
          {isEdit ? 'Update Customer' : 'Add Customer'}
        </button>
      </form>
    </div>
  );
}

export default CustomerFormPage;
