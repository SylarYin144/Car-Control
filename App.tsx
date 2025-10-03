import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Vehicle, FuelEntry, Expense, MaintenanceTask, View, TripReport } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FuelLog from './components/FuelLog';
import ExpenseLog from './components/ExpenseLog';
import Maintenance from './components/Maintenance';
import VehicleProfile from './components/VehicleProfile';
import Analysis from './components/Analysis';
import DailyReportLog from './components/DailyReportLog';

const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [vehicle, setVehicle] = useLocalStorage<Vehicle | null>('vehicle', null);
    const [fuelEntries, setFuelEntries] = useLocalStorage<FuelEntry[]>('fuelEntries', []);
    const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
    const [maintenanceTasks, setMaintenanceTasks] = useLocalStorage<MaintenanceTask[]>('maintenanceTasks', []);
    const [tripReports, setTripReports] = useLocalStorage<TripReport[]>('tripReports', []);

    const addFuelEntry = (entry: Omit<FuelEntry, 'id'>) => {
        setFuelEntries(prev => [...prev, { ...entry, id: Date.now().toString() }]);
        if(vehicle && entry.odometer > vehicle.mileage) {
            setVehicle({...vehicle, mileage: entry.odometer});
        }
    };

    const addExpense = (expense: Omit<Expense, 'id'>) => {
        setExpenses(prev => [...prev, { ...expense, id: Date.now().toString() }]);
    };

    const addMaintenanceTask = (task: Omit<MaintenanceTask, 'id'>) => {
        setMaintenanceTasks(prev => [...prev, { ...task, id: Date.now().toString() }]);
    };
    
    const addTripReport = (report: Omit<TripReport, 'id'>) => {
        setTripReports(prev => [...prev, { ...report, id: Date.now().toString() }]);
    };

    const deleteFuelEntry = (id: string) => {
        setFuelEntries(prev => prev.filter(entry => entry.id !== id));
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
    };

    const deleteMaintenanceTask = (id: string) => {
        setMaintenanceTasks(prev => prev.filter(task => task.id !== id));
    };
    
    const deleteTripReport = (id: string) => {
        setTripReports(prev => prev.filter(report => report.id !== id));
    };

    const updateMaintenanceTask = (updatedTask: MaintenanceTask) => {
        setMaintenanceTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    };

    const sortedFuelEntries = useMemo(() => [...fuelEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [fuelEntries]);
    const sortedExpenses = useMemo(() => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [expenses]);
    const sortedMaintenanceTasks = useMemo(() => [...maintenanceTasks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [maintenanceTasks]);
    const sortedTripReports = useMemo(() => [...tripReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [tripReports]);


    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard fuelEntries={sortedFuelEntries} expenses={sortedExpenses} maintenanceTasks={sortedMaintenanceTasks} vehicle={vehicle} tripReports={sortedTripReports} />;
            case 'fuel':
                return <FuelLog entries={sortedFuelEntries} addEntry={addFuelEntry} deleteEntry={deleteFuelEntry} />;
            case 'dailyReport':
                return <DailyReportLog entries={sortedTripReports} addEntry={addTripReport} deleteEntry={deleteTripReport} />;
            case 'expenses':
                return <ExpenseLog entries={sortedExpenses} addEntry={addExpense} deleteEntry={deleteExpense} />;
            case 'maintenance':
                return <Maintenance tasks={sortedMaintenanceTasks} addTask={addMaintenanceTask} deleteTask={deleteMaintenanceTask} updateTask={updateMaintenanceTask} vehicle={vehicle} />;
            case 'analysis':
                return <Analysis fuelEntries={fuelEntries} tripReports={tripReports} vehicle={vehicle} />;
            case 'vehicle':
                 return <VehicleProfile 
                            vehicle={vehicle} 
                            setVehicle={setVehicle}
                            setFuelEntries={setFuelEntries}
                            setExpenses={setExpenses}
                            setMaintenanceTasks={setMaintenanceTasks}
                            setTripReports={setTripReports}
                        />;
            default:
                return <Dashboard fuelEntries={sortedFuelEntries} expenses={sortedExpenses} maintenanceTasks={sortedMaintenanceTasks} vehicle={vehicle} tripReports={sortedTripReports} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 font-sans">
            <Header setView={setView} activeView={view} />
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default App;