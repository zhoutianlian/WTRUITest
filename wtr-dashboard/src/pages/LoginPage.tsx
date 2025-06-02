// src/pages/LoginPage.tsx
import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import ThreeSceneLogin from '../components/common/ThreeSceneLogin';
import Logo from '../components/common/Logo'; // Optional: Add logo to login page
import './LoginPage.css';

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <ThreeSceneLogin />
      <div className="login-content-wrapper">
        <div className="login-logo-container"> {/* Container for the logo */}
          <Logo />
        </div>
        <LoginForm />
      </div>
    </div>
  );
};
export default LoginPage;
