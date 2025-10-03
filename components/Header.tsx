import React from 'react';
import type { View } from '../types';
import { CarIcon, FuelIcon, WrenchIcon, DollarSignIcon, LayoutDashboardIcon, AnalysisIcon, ClipboardListIcon, SettingsIcon } from './icons/Icons';

interface HeaderProps {
    setView: (view: View) => void;
    activeView: View;
}

const NavItem: React.FC<{
    view: View;
    label: string;
    icon: React.ReactNode;
    activeView: View;
    onClick: (view: View) => void;
}> = ({ view, label, icon, activeView, onClick }) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => onClick(view)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ setView, activeView }) => {
    return (
        <header className="bg-gray-800 shadow-lg">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 text-white flex items-center space-x-2">
                            <CarIcon className="h-8 w-8 text-blue-400" />
                            <span className="font-bold text-xl hidden md:inline">Control de Vehículo</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <NavItem view="dashboard" label="Dashboard" icon={<LayoutDashboardIcon className="h-5 w-5" />} activeView={activeView} onClick={setView} />
                        <NavItem view="fuel" label="Combustible" icon={<FuelIcon className="h-5 w-5" />} activeView={activeView} onClick={setView} />
                        <NavItem view="dailyReport" label="Reportes" icon={<ClipboardListIcon className="h-5 w-5" />} activeView={activeView} onClick={setView} />
                        <NavItem view="expenses" label="Gastos" icon={<DollarSignIcon className="h-5 w-5" />} activeView={activeView} onClick={setView} />
                        <NavItem view="maintenance" label="Mantenimiento" icon={<WrenchIcon className="h-5 w-5" />} activeView={activeView} onClick={setView} />
                        <NavItem view="analysis" label="Análisis" icon={<AnalysisIcon className="h-5 w-5" />} activeView={activeView} onClick={setView} />
                        <NavItem view="vehicle" label="Ajustes" icon={<SettingsIcon className="h-5 w-5" />} activeView={activeView} onClick={setView} />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;