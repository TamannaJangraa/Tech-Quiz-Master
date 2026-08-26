import { GraduationCap, Lock } from 'lucide-react';
import React, { useEffect } from 'react';
import { SignInButton } from '@clerk/react';

const Hero = () => {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <>
      <div className="h-screen pb-32 w-screen overflow-hidden font-serif bg-gray-50 flex items-center justify-center tracking-wide">
        <div className="text-center px-6">
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow blur-[2px]" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white text-indigo-600 shadow-lg">
              <GraduationCap size={40} />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
            Welcome to Tech Quiz Master
          </h1>
          <p className="text-lg text-gray-600 font-normal">
            Admin Panel — Manage Quizzes, Users, and Analytics
          </p>

          <SignInButton mode="modal">
            <button className="text-indigo-600 text-base mt-8 font-semibold items-center inline-flex justify-center gap-2 hover:text-indigo-800 transition-colors duration-200 tracking-normal">
              <Lock size={16} />
              Please authenticate to continue
            </button>
          </SignInButton>
        </div>
      </div>
    </>
  );
};

export default Hero;
