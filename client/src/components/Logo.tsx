import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center justify-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
      
      {/* Mavi Logo Kutusu */}
      <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
        T
      </div>

      {/* Yazı */}
      <span className="text-3xl font-bold tracking-tight text-gray-800">
        TaskiFlow
      </span>

    </div>
  );
};

export default Logo;