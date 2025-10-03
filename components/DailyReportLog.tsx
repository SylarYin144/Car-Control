import React, { useState } from 'react';
import type { TripReport } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TrashIcon } from './icons/Icons';

interface DailyReportLogProps {
    entries: TripReport[];
    addEntry: (entry: Omit<TripReport, 'id'>) => void;
    deleteEntry: (id: string) => void;
}

const DailyReportLog: React.FC<DailyReportLogProps> = ({ entries, addEntry, deleteEntry }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 16),
        odometer: '',
        remainingKm: '',
        fuelGaugeLevel: 12,
        tripType: 'Trabajo' as TripReport['tripType'],
        notes: ''
    });
    const [showForm, setShowForm] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'range') {
             setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { date, odometer, remainingKm, fuelGaugeLevel, tripType, notes } = formData;
        if (date && odometer && remainingKm) {
            addEntry({
                date,
                odometer: parseFloat(odometer),
                remainingKm: parseFloat(remainingKm),
                fuelGaugeLevel,
                tripType,
                notes: notes || undefined
            });
            setFormData({
                date: new Date().toISOString().slice(0, 16),
                odometer: '',
                remainingKm: '',
                fuelGaugeLevel: 12,
                tripType: 'Trabajo',
                notes: ''
            });
            setShowForm(false);
        }
    };
    
    const tripTypeOptions: TripReport['tripType'][] = ['Trabajo', 'Carretera', 'Otro'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Reportes de Estado</h1>
                <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : 'Nuevo Reporte'}</Button>
            </div>

            {showForm && (
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">Nuevo Reporte de Estado</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Fecha y Hora" type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
                            <Input label="Odómetro (km)" type="number" name="odometer" value={formData.odometer} onChange={handleChange} required placeholder="Ej: 50123" />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Autonomía Restante (km)" type="number" name="remainingKm" value={formData.remainingKm} onChange={handleChange} required placeholder="Según computadora del auto"/>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Uso Principal</label>
                                <select name="tripType" value={formData.tripType} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white">
                                    {tripTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                             <label htmlFor="fuelGaugeLevel" className="block text-sm font-medium text-gray-300 mb-1">
                                Nivel de Combustible ({formData.fuelGaugeLevel}/12)
                            </label>
                            <input
                                id="fuelGaugeLevel"
                                type="range"
                                name="fuelGaugeLevel"
                                min="1"
                                max="12"
                                step="1"
                                value={formData.fuelGaugeLevel}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                                Notas (Opcional)
                            </label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white" placeholder="Ej: Mucho tráfico, uso de A/C..."></textarea>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Guardar Reporte</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Historial de Reportes</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3 text-sm font-semibold tracking-wide">Fecha y Hora</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Odómetro</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Autonomía</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Nivel Tanque</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Tipo de Uso</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length > 0 ? entries.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="p-3">{new Date(entry.date).toLocaleString('es-ES')}</td>
                                    <td className="p-3">{entry.odometer.toLocaleString('es-ES')} km</td>
                                    <td className="p-3">{entry.remainingKm} km</td>
                                    <td className="p-3">{entry.fuelGaugeLevel}/12</td>
                                    <td className="p-3"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300">{entry.tripType}</span></td>
                                    <td className="p-3">
                                        <button onClick={() => deleteEntry(entry.id)} className="text-red-500 hover:text-red-400">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-6 text-gray-400">No hay reportes de estado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DailyReportLog;