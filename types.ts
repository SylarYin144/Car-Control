
export interface Vehicle {
    make: string;
    model: string;
    year: number;
    mileage: number;
    vin?: string;
    tankCapacity?: number;
}

export interface FuelEntry {
    id: string;
    date: string;
    odometer: number;
    liters: number;
    pricePerLiter: number;
    totalCost: number;
    gasStation: string;
    notes?: string;
    startTankPercentage?: number;
    endTankPercentage?: number;
    remainingKm?: number;
    rangeAfterFill?: number;
}

export interface Expense {
    id: string;
    date: string;
    category: 'Reparación' | 'Seguro' | 'Llantas' | 'Limpieza' | 'Accesorios' | 'Otro';
    description: string;
    cost: number;
    location?: string;
}

export interface MaintenanceTask {
    id: string;
    date: string;
    description: string;
    cost: number;
    odometer: number;
    isCompleted: boolean;
    location?: string;
}

export interface TripReport {
    id: string;
    date: string; // ISO string with time
    odometer: number;
    remainingKm: number;
    fuelGaugeLevel: number; // 1 to 12
    tripType: 'Trabajo' | 'Carretera' | 'Otro';
    notes?: string;
}

export type View = 'dashboard' | 'fuel' | 'expenses' | 'maintenance' | 'analysis' | 'vehicle' | 'dailyReport';