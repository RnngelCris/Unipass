import React from 'react';
import UniversityLogo from '../components/UniversityLogo';
import LoginForm from '../components/LoginForm';

interface LoginProps {
  onLogin: (type: string, level?: string, gender?: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-[384px] bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <UniversityLogo />
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
};

export default Login;