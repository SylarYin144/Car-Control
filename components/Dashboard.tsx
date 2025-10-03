import React, { useMemo } from 'react';
import type { FuelEntry, Expense, MaintenanceTask, Vehicle, TripReport } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card } from './ui/Card';
import { FuelIcon, DollarSignIcon, WrenchIcon, RouteIcon } from './icons/Icons';

interface DashboardProps {
    fuelEntries: FuelEntry[];
    expenses: Expense[];
    maintenanceTasks: MaintenanceTask[];
    vehicle: Vehicle | null;
    tripReports: TripReport[];
}

const Dashboard: React.FC<DashboardProps> = ({ fuelEntries, expenses, maintenanceTasks, vehicle, tripReports }) => {

    const stats = useMemo(() => {
        const totalSpentOnFuel = fuelEntries.reduce((acc, curr) => acc + curr.totalCost, 0);
        const totalSpentOnExpenses = expenses.reduce((acc, curr) => acc + curr.cost, 0);
        const totalSpending = totalSpentOnFuel + totalSpentOnExpenses;

        let avgKmL = 0;
        if (fuelEntries.length > 1) {
            const sortedEntries = [...fuelEntries].sort((a, b) => a.odometer - b.odometer);
            const firstOdometer = sortedEntries[0].odometer;
            const lastOdometer = sortedEntries[sortedEntries.length - 1].odometer;
            const totalDistance = lastOdometer - firstOdometer;
            const totalLiters = sortedEntries.slice(1).reduce((acc, curr) => acc + curr.liters, 0);
            if (totalDistance > 0 && totalLiters > 0) {
                 avgKmL = totalDistance / totalLiters;
            }
        }

        const upcomingTasks = maintenanceTasks.filter(task => !task.isCompleted).length;

        let estimatedRange = {
            avg: 0,
            pessimistic: 0,
            optimistic: 0,
            hasData: false,
            message: ''
        };

        if (!vehicle?.tankCapacity || vehicle.tankCapacity <= 0) {
            estimatedRange.message = 'Define la capacidad del tanque en Ajustes.';
        } else if (fuelEntries.length < 2) {
            estimatedRange.message = 'Se necesitan más cargas de combustible.';
        } else {
            const sortedFuel = [...fuelEntries].sort((a, b) => a.odometer - b.odometer);
            const economies: number[] = [];
            for (let i = 1; i < sortedFuel.length; i++) {
                const prev = sortedFuel[i - 1];
                const curr = sortedFuel[i];
                const distance = curr.odometer - prev.odometer;
                if (distance > 0 && curr.liters > 0) {
                    economies.push(distance / curr.liters);
                }
            }

            if (economies.length > 0 && avgKmL > 0) {
                const minKmL = Math.min(...economies);
                const maxKmL = Math.max(...economies);
                
                const latestFuelEntry = fuelEntries.length > 0 ? [...fuelEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
                const latestReport = tripReports.length > 0 ? [...tripReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

                let latestFuelLevelPercent: number | null = null;

                const fuelEntryDate = latestFuelEntry ? new Date(latestFuelEntry.date) : null;
                const reportDate = latestReport ? new Date(latestReport.date) : null;

                if (fuelEntryDate && latestFuelEntry.endTankPercentage != null && (!reportDate || fuelEntryDate >= reportDate)) {
                    latestFuelLevelPercent = latestFuelEntry.endTankPercentage;
                } else if (reportDate) {
                     latestFuelLevelPercent = (latestReport.fuelGaugeLevel / 12) * 100;
                }
                
                if (latestFuelLevelPercent != null) {
                    const litersInTank = (latestFuelLevelPercent / 100) * vehicle.tankCapacity;
                    estimatedRange = {
                        avg: litersInTank * avgKmL,
                        pessimistic: litersInTank * minKmL,
                        optimistic: litersInTank * maxKmL,
                        hasData: true,
                        message: ''
                    };
                } else {
                    estimatedRange.message = 'Registra el nivel del tanque para el cálculo.';
                }
            } else {
                estimatedRange.message = 'No se puede calcular la economía.';
            }
        }

        return { totalSpending, avgKmL, upcomingTasks, estimatedRange };
    }, [fuelEntries, expenses, maintenanceTasks, vehicle, tripReports]);

    const fuelEconomyData = useMemo(() => {
        if (fuelEntries.length < 2) return [];
        const sorted = [...fuelEntries].sort((a, b) => a.odometer - b.odometer);
        return sorted.slice(1).map((entry, index) => {
            const prevEntry = sorted[index];
            const distance = entry.odometer - prevEntry.odometer;
            const economy = distance > 0 && entry.liters > 0 ? distance / entry.liters : 0;
            return {
                date: new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                'km/litro': parseFloat(economy.toFixed(2)),
            };
        }).filter(d => d['km/litro'] > 0);
    }, [fuelEntries]);
    
    const expenseByCategoryData = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        expenses.forEach(expense => {
            categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.cost;
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, 'Total Gastado': value }));
    }, [expenses]);
    
    if (!vehicle) {
        return (
             <Card>
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Bienvenido a Control de Vehículo</h2>
                    <p className="text-gray-400">Para comenzar, por favor, añade la información de tu vehículo en la sección "Mi Vehículo".</p>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Dashboard de {vehicle.make} {vehicle.model}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                           <DollarSignIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Gasto Total</p>
                            <p className="text-2xl font-bold text-white">${stats.totalSpending.toFixed(2)}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                           <FuelIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Economía Promedio</p>
                            <p className="text-2xl font-bold text-white">{stats.avgKmL.toFixed(2)} km/litro</p>
                        </div>
                    </div>
                </Card>
                 <Card>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                           <RouteIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Autonomía Estimada</p>
                            {stats.estimatedRange.hasData ? (
                                <>
                                    <p className="text-2xl font-bold text-white">{stats.estimatedRange.avg.toFixed(0)} km</p>
                                    <p className="text-xs text-gray-500">
                                        Seguridad: {stats.estimatedRange.pessimistic.toFixed(0)} - {stats.estimatedRange.optimistic.toFixed(0)} km
                                    </p>
                                </>
                            ) : (
                                 <p className="text-sm text-gray-400 pt-2">{stats.estimatedRange.message || 'Datos insuficientes.'}</p>
                            )}
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                           <WrenchIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Tareas Pendientes</p>
                            <p className="text-2xl font-bold text-white">{stats.upcomingTasks}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Economía de Combustible</h3>
                    {fuelEconomyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={fuelEconomyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" domain={['dataMin - 2', 'dataMax + 2']}/>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="km/litro" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-400 text-center py-12">No hay suficientes datos para mostrar el gráfico de economía.</p>}
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Gastos por Categoría</h3>
                     {expenseByCategoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={expenseByCategoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}/>
                                <Legend />
                                <Bar dataKey="Total Gastado" fill="#818cf8" />
                            </BarChart>
                        </ResponsiveContainer>
                     ) : <p className="text-gray-400 text-center py-12">No se han registrado gastos.</p>}
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;