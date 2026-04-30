import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './Navbar';
import './Layout.css';

export const Layout = () => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--glass-bg)',
            color: 'var(--color-text-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-primary)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-danger)',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  );
};
