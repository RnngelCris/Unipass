import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

interface DashboardLayoutProps {
  onLogout: () => void;
}

const DashboardLayout = ({ onLogout }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <div className="fixed top-0 left-0 h-screen">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64 flex flex-col">
        <Header onLogout={onLogout} />
        <main className="flex-1 p-6 pb-24">
          <Outlet />
        </main>
        <footer className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-gray-100 py-4 px-6 border-t">
          <div className="max-w-6xl mx-auto text-center text-gray-600">
            <p>Universidad Linda Vista</p>
            <p>© 2025 Todos los derechos reservados</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;