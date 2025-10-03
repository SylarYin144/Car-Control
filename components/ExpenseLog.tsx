
import React, { useState } from 'react';
import type { Expense } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TrashIcon } from './icons/Icons';

interface ExpenseLogProps {
    entries: Expense[];
    addEntry: (entry: Omit<Expense, 'id'>) => void;
    deleteEntry: (id: string) => void;
}

const ExpenseLog: React.FC<ExpenseLogProps> = ({ entries, addEntry, deleteEntry }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Reparación' as Expense['category'],
        description: '',
        cost: '',
        location: '',
    });
    const [showForm, setShowForm] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { date, category, description, cost, location } = formData;
        if (date && category && description && cost) {
            addEntry({
                date,
                category,
                description,
                cost: parseFloat(cost),
                location: location || undefined,
            });
            setFormData({ date: new Date().toISOString().split('T')[0], category: 'Reparación', description: '', cost: '', location: '' });
            setShowForm(false);
        }
    };
    
    const categories: Expense['category'][] = ['Reparación', 'Seguro', 'Llantas', 'Limpieza', 'Accesorios', 'Otro'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Registro de Gastos</h1>
                <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : 'Añadir Gasto'}</Button>
            </div>

            {showForm && (
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">Nuevo Gasto</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Fecha" type="date" name="date" value={formData.date} onChange={handleChange} required />
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white">
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <Input label="Descripción" type="text" name="description" value={formData.description} onChange={handleChange} required placeholder="Ej: Cambio de aceite sintético" />
                           <Input label="Costo ($)" type="number" name="cost" value={formData.cost} onChange={handleChange} required placeholder="Ej: 75.50" step="0.01" />
                        </div>
                        <Input label="Lugar (Opcional)" type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ej: Taller 'El Veloz'"/>
                        <div className="flex justify-end">
                            <Button type="submit">Guardar Gasto</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Historial de Gastos</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3 text-sm font-semibold tracking-wide">Fecha</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Categoría</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Descripción</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Lugar</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Costo</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                             {entries.length > 0 ? entries.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="p-3">{new Date(entry.date).toLocaleDateString('es-ES')}</td>
                                    <td className="p-3"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300">{entry.category}</span></td>
                                    <td className="p-3">{entry.description}</td>
                                    <td className="p-3">{entry.location || 'N/A'}</td>
                                    <td className="p-3 font-semibold">${entry.cost.toFixed(2)}</td>
                                    <td className="p-3">
                                        <button onClick={() => deleteEntry(entry.id)} className="text-red-500 hover:text-red-400">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                             )) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-6 text-gray-400">No hay gastos registrados.</td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ExpenseLog;
