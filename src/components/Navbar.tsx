import React, { useState } from 'react';
import { ScreenType } from '../types';
import { APP_CONFIG } from '../data/mockData';
import { Menu, X, Sparkles, Trophy } from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; screen: ScreenType }[] = [
    { label: 'Início', screen: 'inicio' },
    { label: 'Sorteio', screen: 'sorteio' },
  ];

  const handleNavClick = (screen: ScreenType) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="w-full top-0 sticky z-50 bg-white shadow-xs transition-all duration-300">
      <div className="flex justify-between items-center h-20 px-4 md:px-8 max-w-[1240px] mx-auto">
        {/* Logo and Brand */}
        <button
          onClick={() => handleNavClick('inicio')}
          className="flex items-center gap-3 group text-left cursor-pointer transition-transform hover:scale-[1.02]"
          aria-label="Ir para a página inicial Meu Pequeno Grande Amigo"
        >
          <img
            alt="Logo Meu Pequeno Grande Amigo"
            className="h-12 sm:h-14 w-auto object-contain"
            src={APP_CONFIG.logoUrl}
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => handleNavClick(item.screen)}
                className={`font-extrabold text-sm tracking-wide uppercase transition-all relative py-1 cursor-pointer ${
                  isActive
                    ? 'text-[#0854A7] font-black after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[3px] after:bg-[#FF2D78] after:rounded-full'
                    : 'text-[#111827] hover:text-[#FF2D78] hover:scale-105'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {currentScreen === 'inicio' ? (
            <button
              onClick={() => handleNavClick('sorteio')}
              className="hidden sm:inline-flex items-center gap-2 bg-[#0854A7] hover:bg-[#064283] active:scale-95 text-white font-extrabold text-sm tracking-wider uppercase px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#FFC300]" />
              <span>Ir para o Sorteio</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('inicio')}
              className="hidden sm:inline-flex items-center gap-2 bg-[#0854A7] hover:bg-[#064283] active:scale-95 text-white font-extrabold text-sm tracking-wider uppercase px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>Cadastros</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#0854A7] hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Subtle colorful separator bar (Azul Celeste #1EA8F5, Rosa Choque #FF2D78, Amarelo Dourado #FFC300) */}
      <div className="brand-divider" />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNavClick(item.screen)}
                  className={`text-left px-4 py-3 rounded-xl font-bold text-base transition-colors cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-[#FFF3EB] text-[#0854A7] font-black'
                      : 'text-[#111827] hover:bg-gray-50 hover:text-[#FF2D78]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <Sparkles className="w-4 h-4 text-[#FF2D78]" />}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
