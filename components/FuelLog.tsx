
import React, { useState } from 'react';
import type { FuelEntry } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TrashIcon } from './icons/Icons';

interface FuelLogProps {
    entries: FuelEntry[];
    addEntry: (entry: Omit<FuelEntry, 'id'>) => void;
    deleteEntry: (id: string) => void;
}

const FuelLog: React.FC<FuelLogProps> = ({ entries, addEntry, deleteEntry }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        odometer: '',
        pricePerLiter: '',
        totalCost: '',
        gasStation: '',
        startTankPercentage: '',
        endTankPercentage: '',
        remainingKm: '',
        rangeAfterFill: '',
    });
    const [showForm, setShowForm] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { date, odometer, pricePerLiter, totalCost, gasStation, startTankPercentage, endTankPercentage, remainingKm, rangeAfterFill } = formData;
        if (date && odometer && pricePerLiter && totalCost && gasStation) {
            const pricePerLiterNum = parseFloat(pricePerLiter);
            const totalCostNum = parseFloat(totalCost);
            if (pricePerLiterNum > 0 && totalCostNum >= 0) {
                const litersNum = totalCostNum > 0 ? totalCostNum / pricePerLiterNum : 0;
                const newEntry = {
                    date,
                    odometer: parseFloat(odometer),
                    liters: litersNum,
                    totalCost: totalCostNum,
                    pricePerLiter: pricePerLiterNum,
                    gasStation,
                    startTankPercentage: startTankPercentage ? parseFloat(startTankPercentage) : undefined,
                    endTankPercentage: endTankPercentage ? parseFloat(endTankPercentage) : undefined,
                    remainingKm: remainingKm ? parseFloat(remainingKm) : undefined,
                    rangeAfterFill: rangeAfterFill ? parseFloat(rangeAfterFill) : undefined,
                };
                addEntry(newEntry);
                setFormData({ 
                    date: new Date().toISOString().split('T')[0], 
                    odometer: '', 
                    pricePerLiter: '', 
                    totalCost: '', 
                    gasStation: '',
                    startTankPercentage: '',
                    endTankPercentage: '',
                    remainingKm: '',
                    rangeAfterFill: '',
                });
                setShowForm(false);
            }
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Registro de Combustible</h1>
                <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : 'Añadir Registro'}</Button>
            </div>

            {showForm && (
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">Nuevo Registro de Combustible</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input label="Fecha" type="date" name="date" value={formData.date} onChange={handleChange} required />
                            <Input label="Odómetro (km)" type="number" name="odometer" value={formData.odometer} onChange={handleChange} placeholder="Ej: 50000" required />
                            <Input label="Gasolinera" type="text" name="gasStation" value={formData.gasStation} onChange={handleChange} placeholder="Ej: Pemex" required />
                            <Input label="Costo Total ($)" type="number" name="totalCost" value={formData.totalCost} onChange={handleChange} placeholder="Ej: 900.00" step="0.01" required />
                            <Input label="Costo por Litro ($)" type="number" name="pricePerLiter" value={formData.pricePerLiter} onChange={handleChange} placeholder="Ej: 22.50" step="0.01" required />
                            <Input label="Nivel Tanque Inicio (%)" type="number" name="startTankPercentage" value={formData.startTankPercentage} onChange={handleChange} placeholder="Ej: 15" />
                            <Input label="Nivel Tanque Fin (%)" type="number" name="endTankPercentage" value={formData.endTankPercentage} onChange={handleChange} placeholder="Ej: 100" />
                            <Input label="Autonomía Pre-Carga (km)" type="number" name="remainingKm" value={formData.remainingKm} onChange={handleChange} placeholder="Ej: 80" />
                            <Input label="Autonomía Post-Carga (km)" type="number" name="rangeAfterFill" value={formData.rangeAfterFill} onChange={handleChange} placeholder="Ej: 650" />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Guardar Registro</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Historial</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3 text-sm font-semibold tracking-wide">Fecha</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Odómetro</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Gasolinera</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Litros</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Tanque Inicio</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Tanque Fin</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Autonomía (Pre)</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Autonomía (Post)</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Costo Total</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length > 0 ? entries.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="p-3">{new Date(entry.date).toLocaleDateString('es-ES')}</td>
                                    <td className="p-3">{entry.odometer.toLocaleString('es-ES')} km</td>
                                    <td className="p-3">{entry.gasStation}</td>
                                    <td className="p-3">{entry.liters.toFixed(2)}</td>
                                    <td className="p-3">{entry.startTankPercentage ? `${entry.startTankPercentage}%` : 'N/A'}</td>
                                    <td className="p-3">{entry.endTankPercentage ? `${entry.endTankPercentage}%` : 'N/A'}</td>
                                    <td className="p-3">{entry.remainingKm ? `${entry.remainingKm} km` : 'N/A'}</td>
                                    <td className="p-3">{entry.rangeAfterFill ? `${entry.rangeAfterFill} km` : 'N/A'}</td>
                                    <td className="p-3 font-semibold">${entry.totalCost.toFixed(2)}</td>
                                    <td className="p-3">
                                        <button onClick={() => deleteEntry(entry.id)} className="text-red-500 hover:text-red-400">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={10} className="text-center p-6 text-gray-400">No hay registros de combustible.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default FuelLog;