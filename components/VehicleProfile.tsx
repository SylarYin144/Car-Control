
import React, { useState, useEffect, useRef } from 'react';
import type { Vehicle, FuelEntry, Expense, MaintenanceTask, TripReport } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { CarIcon } from './icons/Icons';

interface VehicleProfileProps {
    vehicle: Vehicle | null;
    setVehicle: React.Dispatch<React.SetStateAction<Vehicle | null>>;
    setFuelEntries: React.Dispatch<React.SetStateAction<FuelEntry[]>>;
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    setMaintenanceTasks: React.Dispatch<React.SetStateAction<MaintenanceTask[]>>;
    setTripReports: React.Dispatch<React.SetStateAction<TripReport[]>>;
}

const VehicleProfile: React.FC<VehicleProfileProps> = ({ vehicle, setVehicle, setFuelEntries, setExpenses, setMaintenanceTasks, setTripReports }) => {
    const [formData, setFormData] = useState<Vehicle>({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0,
        vin: '',
        tankCapacity: 0,
    });
    const [isEditing, setIsEditing] = useState(!vehicle);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (vehicle) {
            setFormData(vehicle);
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    }, [vehicle]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setVehicle(formData);
        setIsEditing(false);
    };
    
    const handleExport = () => {
        try {
            const dataToExport = {
                vehicle: JSON.parse(localStorage.getItem('vehicle') || 'null'),
                fuelEntries: JSON.parse(localStorage.getItem('fuelEntries') || '[]'),
                expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
                maintenanceTasks: JSON.parse(localStorage.getItem('maintenanceTasks') || '[]'),
                tripReports: JSON.parse(localStorage.getItem('tripReports') || '[]'),
            };

            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(dataToExport, null, 2)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = `control_vehiculo_datos_${new Date().toISOString().split('T')[0]}.ccz`;
            link.click();
        } catch (error) {
            console.error("Error al exportar los datos:", error);
            alert("Hubo un error al intentar exportar los datos.");
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm("¿Estás seguro? Esto reemplazará todos los datos actuales con los del archivo.")) {
            if(event.target) event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("El archivo no se pudo leer correctamente.");
                }
                const data = JSON.parse(text);

                if (data && typeof data.vehicle !== 'undefined' && Array.isArray(data.fuelEntries) && Array.isArray(data.expenses) && Array.isArray(data.maintenanceTasks) && Array.isArray(data.tripReports)) {
                    setVehicle(data.vehicle);
                    setFuelEntries(data.fuelEntries);
                    setExpenses(data.expenses);
                    setMaintenanceTasks(data.maintenanceTasks);
                    setTripReports(data.tripReports);
                    alert("¡Datos importados con éxito!");
                    setIsEditing(false);
                } else {
                    throw new Error("El archivo no tiene el formato esperado.");
                }
            } catch (error: any) {
                console.error("Error al importar los datos:", error);
                alert(`Hubo un error al importar los datos: ${error.message}`);
            } finally {
                if(event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Perfil y Ajustes</h1>
            
            <Card>
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">
                            {vehicle ? 'Editar Vehículo' : 'Añadir Vehículo'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Marca" type="text" name="make" value={formData.make} onChange={handleChange} required placeholder="Ej: Toyota" />
                            <Input label="Modelo" type="text" name="model" value={formData.model} onChange={handleChange} required placeholder="Ej: Corolla" />
                            <Input label="Año" type="number" name="year" value={formData.year} onChange={handleChange} required placeholder="Ej: 2022" />
                            <Input label="Kilometraje Actual (km)" type="number" name="mileage" value={formData.mileage} onChange={handleChange} required placeholder="Ej: 50000" />
                            <Input label="Capacidad del Tanque (L, Opcional)" type="number" name="tankCapacity" value={formData.tankCapacity || ''} onChange={handleChange} placeholder="Ej: 55" />
                            <Input label="VIN (Opcional)" type="text" name="vin" value={formData.vin || ''} onChange={handleChange} />
                        </div>
                        <div className="flex justify-end space-x-2">
                           {vehicle && <Button onClick={() => setIsEditing(false)} variant="secondary">Cancelar</Button>}
                           <Button type="submit">Guardar Vehículo</Button>
                        </div>
                    </form>
                ) : vehicle ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                           <div>
                                <h2 className="text-2xl font-bold text-white">{vehicle?.make} {vehicle?.model}</h2>
                                <p className="text-gray-400">{vehicle?.year}</p>
                           </div>
                            <Button onClick={() => setIsEditing(true)} variant="secondary">Editar</Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                            <div>
                                <p className="text-sm text-gray-400">Kilometraje</p>
                                <p className="text-lg font-semibold">{vehicle?.mileage.toLocaleString('es-ES')} km</p>
                            </div>
                             <div>
                                <p className="text-sm text-gray-400">Capacidad del Tanque</p>
                                <p className="text-lg font-semibold">{vehicle?.tankCapacity ? `${vehicle.tankCapacity} L` : 'N/A'}</p>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <p className="text-sm text-gray-400">VIN</p>
                                <p className="text-lg font-semibold">{vehicle?.vin || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <CarIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <h3 className="mt-2 text-lg font-medium text-white">No hay vehículo registrado</h3>
                        <p className="mt-1 text-sm text-gray-400">Añade tu vehículo para empezar a rastrear.</p>
                        <div className="mt-6">
                            <Button onClick={() => setIsEditing(true)}>
                                Añadir Vehículo
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Gestión de Datos</h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-gray-300 mb-2">Exporta todos tus datos a un archivo para tener una copia de seguridad o para importarlos en otro dispositivo.</p>
                        <Button onClick={handleExport} variant="secondary" disabled={!vehicle}>Exportar Datos (.ccz)</Button>
                    </div>
                    <div className="border-t border-gray-700 my-4"></div>
                    <div>
                        <p className="text-gray-300 mb-2">Importa datos desde un archivo. <span className="font-semibold text-yellow-400">Atención:</span> Esto reemplazará todos los datos actuales.</p>
                         <Button onClick={triggerFileSelect} variant="secondary">Importar Datos (.ccz)</Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".ccz,application/json"
                            className="hidden"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default VehicleProfile;