
import React, { useState } from 'react';
import type { MaintenanceTask, Vehicle } from '../types';
import { getMaintenanceRecommendations } from '../services/geminiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TrashIcon, CheckCircleIcon, SparklesIcon, CircleIcon } from './icons/Icons';

interface MaintenanceProps {
    tasks: MaintenanceTask[];
    addTask: (task: Omit<MaintenanceTask, 'id'>) => void;
    deleteTask: (id: string) => void;
    updateTask: (task: MaintenanceTask) => void;
    vehicle: Vehicle | null;
}

const Maintenance: React.FC<MaintenanceProps> = ({ tasks, addTask, deleteTask, updateTask, vehicle }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        cost: '',
        odometer: '',
        location: '',
    });
    const [showForm, setShowForm] = useState(false);
    const [aiRecommendation, setAiRecommendation] = useState('');
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { date, description, cost, odometer, location } = formData;
        if (date && description && cost && odometer) {
            addTask({
                date,
                description,
                cost: parseFloat(cost),
                odometer: parseFloat(odometer),
                isCompleted: false,
                location: location || undefined,
            });
            setFormData({ date: new Date().toISOString().split('T')[0], description: '', cost: '', odometer: '', location: '' });
            setShowForm(false);
        }
    };

    const handleGetAiRecs = async () => {
        if (!vehicle) return;
        setIsLoadingAi(true);
        setAiRecommendation('');
        const recs = await getMaintenanceRecommendations(vehicle);
        setAiRecommendation(recs);
        setIsLoadingAi(false);
    };
    
    const toggleComplete = (task: MaintenanceTask) => {
        updateTask({ ...task, isCompleted: !task.isCompleted });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-white">Mantenimiento</h1>
                <div className="flex gap-2">
                    {vehicle && (
                        <Button onClick={handleGetAiRecs} disabled={isLoadingAi} variant="secondary">
                            <SparklesIcon className="h-5 w-5 mr-2" />
                            {isLoadingAi ? 'Generando...' : 'Recomendaciones IA'}
                        </Button>
                    )}
                    <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : 'Añadir Tarea'}</Button>
                </div>
            </div>

            {isLoadingAi && <div className="text-center text-gray-400">Buscando recomendaciones de expertos...</div>}
            
            {aiRecommendation && (
                <Card>
                    <h2 className="text-xl font-semibold text-white mb-2 flex items-center"><SparklesIcon className="h-5 w-5 mr-2 text-yellow-400"/>Recomendaciones de IA</h2>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap">
                        {aiRecommendation.split('\n').map((line, i) => <p key={i} className="my-1">{line}</p>)}
                    </div>
                </Card>
            )}

            {showForm && (
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <h2 className="text-xl font-semibold text-white">Nueva Tarea de Mantenimiento</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Fecha" type="date" name="date" value={formData.date} onChange={handleChange} required />
                            <Input label="Odómetro (km)" type="number" name="odometer" value={formData.odometer} onChange={handleChange} required />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Descripción" type="text" name="description" value={formData.description} onChange={handleChange} required placeholder="Ej: Cambio de filtro de aire"/>
                            <Input label="Costo ($)" type="number" name="cost" value={formData.cost} onChange={handleChange} required step="0.01"/>
                         </div>
                         <Input label="Lugar/Taller (Opcional)" type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ej: Refaccionaria 'El Eje'"/>
                        <div className="flex justify-end">
                            <Button type="submit">Guardar Tarea</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Historial de Mantenimiento</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3 text-sm font-semibold tracking-wide">Estado</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Fecha</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Descripción</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Lugar/Taller</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Odómetro</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Costo</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length > 0 ? tasks.map(task => (
                                <tr key={task.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${task.isCompleted ? 'text-gray-500 line-through' : ''}`}>
                                    <td className="p-3">
                                        <button onClick={() => toggleComplete(task)}>
                                            {task.isCompleted ? <CheckCircleIcon className="h-6 w-6 text-green-500" /> : <CircleIcon className="h-6 w-6 text-gray-600" />}
                                        </button>
                                    </td>
                                    <td className="p-3">{new Date(task.date).toLocaleDateString('es-ES')}</td>
                                    <td className="p-3">{task.description}</td>
                                    <td className="p-3">{task.location || 'N/A'}</td>
                                    <td className="p-3">{task.odometer.toLocaleString('es-ES')} km</td>
                                    <td className="p-3 font-semibold">${task.cost.toFixed(2)}</td>
                                    <td className="p-3">
                                        <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-400">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center p-6 text-gray-400">No hay tareas de mantenimiento.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Maintenance;
