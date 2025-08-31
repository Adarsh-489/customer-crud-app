import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sortBy, setSortBy] = useState('name'); 
  const navigate = useNavigate();

  // Fetch customers AND their addresses
  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customers');
      const customerData = res.data.data;

      // Fetch addresses for each customer
      const customersWithAddresses = await Promise.all(
        customerData.map(async (cust) => {
          try {
            const addrRes = await axios.get(`http://localhost:5000/api/customers/${cust.id}`);
            return { ...cust, addresses: addrRes.data.data.addresses || [] };
          } catch {
            return { ...cust, addresses: [] };
          }
        })
      );

      setCustomers(customersWithAddresses);
      setErrorMsg('');
    } catch {
      setErrorMsg('⚠️ Failed to fetch customers.');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Delete customer
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`);
        fetchCustomers();
      } catch {
        setErrorMsg('⚠️ Failed to delete customer.');
      }
    }
  };

  // Filter by search term
  const filteredCustomers = customers.filter(c =>
    c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone_number.includes(searchTerm)
  );

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'name') {
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    }
    if (sortBy === 'phone') {
      return a.phone_number.localeCompare(b.phone_number);
    }
    return 0;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Customer List</h1>

      {errorMsg && (
        <div style={{ background: '#fdecea', color: '#b71c1c', padding: '10px', border: '1px solid #f5c6cb', borderRadius: '5px', marginBottom: '15px' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/add-customer')} style={{ marginBottom: '10px', padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px' }}>
          ➕ Add Customer
        </button>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="name">Sort by Name</option>
          <option value="phone">Sort by Phone</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <input type="text" placeholder="Search by name or phone" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '8px', width: '100%', maxWidth: '400px' }} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', minWidth: '600px' }}>
          <thead style={{ background: '#f4f4f4' }}>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Addresses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.length > 0 ? (
              sortedCustomers.map(customer => (
                <tr key={customer.id}>
                  <td><Link to={`/customers/${customer.id}`}>{customer.first_name} {customer.last_name}</Link></td>
                  <td>{customer.phone_number}</td>
                  <td>
                    {customer.addresses.length > 0
                      ? customer.addresses.length === 1
                        ? <span style={{ color: 'green', fontWeight: 'bold' }}>Only One Address</span>
                        : customer.addresses.length
                      : 0
                    }
                  </td>
                  <td>
                    <button onClick={() => navigate(`/edit-customer/${customer.id}`)} style={{ marginRight: '8px', padding: '5px 10px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px' }}>Edit</button>
                    <button onClick={() => handleDelete(customer.id)} style={{ padding: '5px 10px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px' }}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '15px' }}>No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerListPage;
