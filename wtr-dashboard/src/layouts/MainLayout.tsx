import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo'; // Corrected path
import Sidebar from '../components/common/Sidebar'; // Corrected path
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <header className="main-header"> {/* Changed class from placeholder */}
        <Logo />
        {/* Other header content can go here, e.g., user profile, search bar */}
      </header>
      <Sidebar /> {/* Replaced placeholder aside */}
      <main className="main-content-area">
        <Outlet />
      </main>
    </div>
  );
}
