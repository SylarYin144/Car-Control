
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div className={`bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
            {children}
        </div>
    );
};
