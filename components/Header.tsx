
import React from 'react';
import MosqueIcon from './icons/MosqueIcon';
import type { Page } from '../App';

interface HeaderProps {
  page: Page;
  setPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ page, setPage }) => {
  return (
    <header className="bg-primary text-white p-4 shadow-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <MosqueIcon className="w-8 h-8" />
        <h1 className="text-xl sm:text-2xl font-bold">مدرسة الأنصار - اختبار الحفظ</h1>
      </div>
      {page !== 'home' && (
        <button
          onClick={() => setPage('home')}
          className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          → العودة
        </button>
      )}
    </header>
  );
};

export default Header;
