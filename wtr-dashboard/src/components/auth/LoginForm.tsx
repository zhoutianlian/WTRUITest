// src/components/auth/LoginForm.tsx
import React from 'react';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Mock login logic
    alert('Login attempt (mock)');
    // In a real app, you would navigate the user upon successful login
    // For example: navigate('/');
  };

  return (
    <div className="login-form-container">
      <h2>Welcome Back</h2>
      <p className="login-form-subtitle">Enter your credentials to access WTR Dashboard</p>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" name="email" required placeholder="u@example.com" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required placeholder="••••••••" />
        </div>
        <div className="form-options">
          {/* Basic checkbox for "Remember Me" - non-functional for now */}
          <label className="remember-me">
            <input type="checkbox" name="remember" />
            Remember Me
          </label>
          <a href="#forgot-password">Forgot Password?</a>
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <p className="signup-link">
        Don't have an account? <a href="#signup">Sign Up</a>
      </p>
    </div>
  );
};
export default LoginForm;
