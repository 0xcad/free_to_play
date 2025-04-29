import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from '../axiosConfig';
import { useAppContext } from '../context/AppContext';

const AdminLogin: React.FC = () => {
  let navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/accounts/login', {
            username,
            password,
        });
      login(response.data.access, response.data.username);
      navigate("/chat");
    } catch (error) {
      alert('Login failed ' + error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
};

export default AdminLogin;

