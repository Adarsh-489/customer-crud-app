import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  // Add new address state
  const [addressDetails, setAddressDetails] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');

  // Edit address state
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editAddressDetails, setEditAddressDetails] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPinCode, setEditPinCode] = useState('');

  // Address search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch customer with addresses
  const fetchCustomer = () => {
    axios.get(`http://localhost:5000/api/customers/${id}`)
      .then(res => setCustomer(res.data.data))
      .catch(err => setErrorMsg('Failed to fetch customer data'));
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  // Add new address
  const handleAddAddress = (e) => {
    e.preventDefault();
    axios.post(`http://localhost:5000/api/customers/${id}/addresses`, {
      address_details: addressDetails,
      city,
      state,
      pin_code: pinCode
    })
    .then(() => {
      setAddressDetails('');
      setCity('');
      setState('');
      setPinCode('');
      fetchCustomer();
      setErrorMsg('');
    })
    .catch(err => setErrorMsg('Failed to add address'));
  };

  // Start editing an address
  const startEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setEditAddressDetails(addr.address_details);
    setEditCity(addr.city);
    setEditState(addr.state);
    setEditPinCode(addr.pin_code);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingAddressId(null);
    setEditAddressDetails('');
    setEditCity('');
    setEditState('');
    setEditPinCode('');
  };

  // Save edited address
  const handleEditAddress = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/api/addresses/${editingAddressId}`, {
      address_details: editAddressDetails,
      city: editCity,
      state: editState,
      pin_code: editPinCode
    })
    .then(() => {
      cancelEdit();
      fetchCustomer();
      setErrorMsg('');
    })
    .catch(err => setErrorMsg('Failed to update address'));
  };

  // Delete address
  const handleDeleteAddress = (addressId) => {
    if(window.confirm('Are you sure you want to delete this address?')) {
      axios.delete(`http://localhost:5000/api/addresses/${addressId}`)
        .then(() => fetchCustomer())
        .catch(() => setErrorMsg('Failed to delete address'));
    }
  };

  if (!customer) return <div>Loading...</div>;

  // Filter addresses based on search term
  const filteredAddresses = customer.addresses?.filter(addr =>
    addr.address_details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.pin_code.includes(searchTerm)
  );

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '15px' }}>Back to Customer List</button>
      <h1>{customer.first_name} {customer.last_name}</h1>
      <p>Phone: {customer.phone_number}</p>
      {customer.addresses.length === 1 && <p style={{ color: 'green', fontWeight: 'bold' }}>Only One Address</p>}

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      <h2>Addresses</h2>
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search addresses"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '5px', width: '100%', maxWidth: '300px' }}
        />
      </div>

      <ul>
        {filteredAddresses && filteredAddresses.length > 0 ? (
          filteredAddresses.map(addr => (
            <li key={addr.id} style={{ marginBottom: '10px' }}>
              {editingAddressId === addr.id ? (
                <form onSubmit={handleEditAddress} style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  <input type="text" value={editAddressDetails} onChange={e => setEditAddressDetails(e.target.value)} required placeholder="Details"/>
                  <input type="text" value={editCity} onChange={e => setEditCity(e.target.value)} required placeholder="City"/>
                  <input type="text" value={editState} onChange={e => setEditState(e.target.value)} required placeholder="State"/>
                  <input type="text" value={editPinCode} onChange={e => setEditPinCode(e.target.value)} required placeholder="Pin Code"/>
                  <button type="submit">Save</button>
                  <button type="button" onClick={cancelEdit}>Cancel</button>
                </form>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'center' }}>
                  <span>{addr.address_details}, {addr.city}, {addr.state} - {addr.pin_code}</span>
                  <button onClick={() => startEditAddress(addr)}>Edit</button>
                  <button onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                </div>
              )}
            </li>
          ))
        ) : <li>No addresses found</li>}
      </ul>

      <h3>Add New Address</h3>
      <form onSubmit={handleAddAddress} style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
        <input type="text" placeholder="Address Details" value={addressDetails} onChange={e => setAddressDetails(e.target.value)} required/>
        <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required/>
        <input type="text" placeholder="State" value={state} onChange={e => setState(e.target.value)} required/>
        <input type="text" placeholder="Pin Code" value={pinCode} onChange={e => setPinCode(e.target.value)} required/>
        <button type="submit">Add Address</button>
      </form>
    </div>
  );
}

export default CustomerDetailPage;
