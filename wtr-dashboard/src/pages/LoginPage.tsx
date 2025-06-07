// src/pages/LoginPage.tsx
import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import NewBackground from '../components/common/NewBackground'; // Import NewBackground
import Logo from '../components/common/Logo';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <NewBackground /> {/* Add NewBackground here */}
      {/* ThreeSceneLogin component is removed */}
      <div className="login-content-wrapper">
        <div className="login-logo-container">
          <Logo />
        </div>
        <LoginForm />
      </div>
    </div>
  );
};
export default LoginPage;
