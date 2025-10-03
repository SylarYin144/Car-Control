
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
    const inputId = id || props.name;
    return (
        <div>
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">
                {label}
            </label>
            <input
                id={inputId}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
                {...props}
            />
        </div>
    );
};
