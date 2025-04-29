import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AdminLogin from './components/AdminLogin';
import JoinChat from './components/JoinChat';
import ChatRoom from './components/ChatRoom';
import './index.css';

const App: React.FC = () => {
  return (
    <>
    <div className='kicked-overlay'></div>
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<JoinChat />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/chat" element={<ChatRoom />} />
        </Routes>
      </Router>
    </AppProvider>
    </>
  );
};

export default App;

