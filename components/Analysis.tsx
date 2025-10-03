
import React, { useMemo } from 'react';
import type { FuelEntry, TripReport, Vehicle } from '../types';
import { Card } from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalysisProps {
    fuelEntries: FuelEntry[];
    tripReports: TripReport[];
    vehicle: Vehicle | null;
}

const Analysis: React.FC<AnalysisProps> = ({ fuelEntries, tripReports, vehicle }) => {

    const estimatedTankCapacity = useMemo(() => {
         const validEntries = fuelEntries
            .filter(e => e.startTankPercentage != null && e.endTankPercentage != null && e.liters > 0 && (e.endTankPercentage - e.startTankPercentage > 0));

        if (validEntries.length < 3) return null;

        const capacityEstimates: number[] = [];
        validEntries.forEach(entry => {
            const deltaPercentage = entry.endTankPercentage! - entry.startTankPercentage!;
            const estimatedCapacity = entry.liters / (deltaPercentage / 100);
            if (estimatedCapacity > 20 && estimatedCapacity < 150) { // Filter outliers
                capacityEstimates.push(estimatedCapacity);
            }
        });
        
        return capacityEstimates.length > 0 
            ? capacityEstimates.reduce((a, b) => a + b, 0) / capacityEstimates.length
            : null;
    }, [fuelEntries]);
    
    const effectiveTankCapacity = useMemo(() => {
        if (vehicle?.tankCapacity && vehicle.tankCapacity > 0) {
            return vehicle.tankCapacity;
        }
        return estimatedTankCapacity;
    }, [vehicle, estimatedTankCapacity]);

    const efficiencyByTripType = useMemo(() => {
        if (tripReports.length < 2 || !effectiveTankCapacity) {
             return [
                { name: 'Trabajo', 'km/l': 0 },
                { name: 'Carretera', 'km/l': 0 },
                { name: 'Otro', 'km/l': 0 }
            ];
        };
        
        const litersPerSegment = effectiveTankCapacity / 12;
        const statsByType: { [key in TripReport['tripType']]: { totalKm: number, totalLiters: number } } = {
            'Trabajo': { totalKm: 0, totalLiters: 0 },
            'Carretera': { totalKm: 0, totalLiters: 0 },
            'Otro': { totalKm: 0, totalLiters: 0 }
        };

        const sortedReports = [...tripReports].sort((a, b) => a.odometer - b.odometer);
        
        for (let i = 1; i < sortedReports.length; i++) {
            const prev = sortedReports[i-1];
            const curr = sortedReports[i];

            const kmDriven = curr.odometer - prev.odometer;
            const segmentsUsed = prev.fuelGaugeLevel - curr.fuelGaugeLevel;
            
            if (kmDriven > 0 && segmentsUsed > 0 && curr.tripType) {
                const litersUsed = segmentsUsed * litersPerSegment;
                statsByType[curr.tripType].totalKm += kmDriven;
                statsByType[curr.tripType].totalLiters += litersUsed;
            }
        }

        return Object.entries(statsByType).map(([name, data]) => ({
            name,
            'km/l': data.totalLiters > 0 ? parseFloat((data.totalKm / data.totalLiters).toFixed(2)) : 0
        }));

    }, [tripReports, effectiveTankCapacity]);

    const kmPerSegment = useMemo(() => {
        if (tripReports.length < 2) return [];

        const segmentStats: { [key: string]: { totalKm: number, count: number } } = {};
        const sortedReports = [...tripReports].sort((a, b) => a.odometer - b.odometer);
        
        for (let i = 1; i < sortedReports.length; i++) {
            const prev = sortedReports[i-1];
            const curr = sortedReports[i];

            const kmDriven = curr.odometer - prev.odometer;
            const segmentsUsed = prev.fuelGaugeLevel - curr.fuelGaugeLevel;

            if (kmDriven > 0 && segmentsUsed === 1) { // Only count single segment drops for accuracy
                 const segmentName = `${prev.fuelGaugeLevel} → ${curr.fuelGaugeLevel}`;
                 if (!segmentStats[segmentName]) {
                     segmentStats[segmentName] = { totalKm: 0, count: 0 };
                 }
                 segmentStats[segmentName].totalKm += kmDriven;
                 segmentStats[segmentName].count++;
            }
        }
        
        return Object.entries(segmentStats).map(([name, data]) => ({
            name,
            'km': parseFloat((data.totalKm / data.count).toFixed(1))
        })).sort((a, b) => {
            const aNum = parseInt(a.name.split(' ')[0], 10);
            const bNum = parseInt(b.name.split(' ')[0], 10);
            return bNum - aNum;
        });

    }, [tripReports]);


    const stationStats = useMemo(() => {
        if (fuelEntries.length < 2) return [];

        const sortedEntries = [...fuelEntries].sort((a, b) => a.odometer - b.odometer);
        
        const enrichedEntries = sortedEntries.slice(1).map((entry, index) => {
            const prevEntry = sortedEntries[index];
            const distance = entry.odometer - prevEntry.odometer;
            
            if (distance <= 0 || entry.liters <= 0) return null;

            const kmpl = distance / entry.liters;
            const costPerKm = entry.pricePerLiter / kmpl;

            return { ...entry, kmpl, costPerKm };
        }).filter(Boolean) as (FuelEntry & { kmpl: number, costPerKm: number })[];

        const statsByStation: { [key: string]: {
            visits: number, totalLiters: number, totalCost: number, totalKmpl: number, totalCostPerKm: number
        }} = {};

        enrichedEntries.forEach(entry => {
            const station = entry.gasStation;
            if (!statsByStation[station]) {
                statsByStation[station] = { visits: 0, totalLiters: 0, totalCost: 0, totalKmpl: 0, totalCostPerKm: 0 };
            }
            statsByStation[station].visits++;
            statsByStation[station].totalLiters += entry.liters;
            statsByStation[station].totalCost += entry.totalCost;
            statsByStation[station].totalKmpl += entry.kmpl;
            statsByStation[station].totalCostPerKm += entry.costPerKm;
        });

        return Object.entries(statsByStation).map(([name, data]) => ({
            name,
            visits: data.visits,
            avgPricePerLiter: data.totalCost / data.totalLiters,
            avgKmpl: data.totalKmpl / data.visits,
            avgCostPerKm: data.totalCostPerKm / data.visits,
        }));

    }, [fuelEntries]);
    
    const tankAnalysisData = useMemo(() => {
        const validEntries = fuelEntries
            .filter(e => e.startTankPercentage != null);

        if (validEntries.length === 0) return null;

        const totalStartPercentage = validEntries.reduce((acc, entry) => acc + entry.startTankPercentage!, 0);
        
        return {
            avgStartPercentage: (totalStartPercentage / validEntries.length).toFixed(1),
            effectiveCapacity: effectiveTankCapacity ? effectiveTankCapacity.toFixed(1) : null,
            capacitySource: vehicle?.tankCapacity && vehicle.tankCapacity > 0 ? 'manual' : 'estimada',
            sampleSize: validEntries.length
        };
    }, [fuelEntries, effectiveTankCapacity, vehicle]);

    const litersPerSegment = useMemo(() => {
        if (!effectiveTankCapacity) return null;
        return (effectiveTankCapacity / 12).toFixed(2);
    }, [effectiveTankCapacity]);

    const hasEfficiencyData = useMemo(() => efficiencyByTripType.some(d => d['km/l'] > 0), [efficiencyByTripType]);

    if (fuelEntries.length < 2 && tripReports.length < 2) {
        return (
            <Card>
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Análisis de Rendimiento</h2>
                    <p className="text-gray-400">Necesitas registrar más datos de combustible y reportes de estado para ver el análisis detallado de tu vehículo.</p>
                </div>
            </Card>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Análisis de Rendimiento</h1>

            {tankAnalysisData && (
                <Card>
                    <h2 className="text-xl font-semibold text-white mb-4">Análisis del Tanque y Hábitos de Recarga</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-center">
                        {tankAnalysisData.effectiveCapacity && (
                            <div>
                                <p className="text-sm text-gray-400">
                                    Capacidad del Tanque 
                                    <span className="text-xs"> ({tankAnalysisData.capacitySource === 'manual' ? 'Manual' : 'Estimada'})</span>
                                </p>
                                <p className="text-2xl font-bold text-white">{tankAnalysisData.effectiveCapacity} L</p>
                            </div>
                        )}
                        {litersPerSegment && (
                             <div>
                                <p className="text-sm text-gray-400">Litros por Segmento (1/12)</p>
                                <p className="text-2xl font-bold text-white">~{litersPerSegment} L</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-400">Punto de Recarga Promedio</p>
                            <p className="text-2xl font-bold text-white">{tankAnalysisData.avgStartPercentage}%</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                        {tankAnalysisData.capacitySource === 'estimada' 
                            ? `La capacidad del tanque es una estimación. Para mayor precisión, ingrésala en "Ajustes". Se basa en ${tankAnalysisData.sampleSize} registros válidos.`
                            : `Los cálculos de rendimiento se basan en la capacidad del tanque de ${vehicle?.tankCapacity} L que ingresaste. El punto de recarga se basa en ${tankAnalysisData.sampleSize} registros.`
                        }
                    </p>
                </Card>
            )}

            <Card>
                <h3 className="text-lg font-semibold text-white mb-2">Eficiencia por Tipo de Uso (km/l)</h3>
                {!hasEfficiencyData ? (
                    <p className="text-sm text-gray-400 mb-4">Aún no hay suficientes datos para calcular el rendimiento. Registra tus llenados de combustible y crea reportes de estado para activar este análisis.</p>
                ) : (
                    <p className="text-sm text-gray-400 mb-4">Compara el rendimiento de tu vehículo según el tipo de trayecto. Este cálculo usa la capacidad del tanque y los datos de tus reportes de estado.</p>
                )}
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={efficiencyByTripType}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" domain={[0, 'dataMax + 2']} label={{ value: 'km/l', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Legend />
                        <Bar dataKey="km/l" fill="#818cf8" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
           
            {kmPerSegment.length > 0 ? (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-2">Distancia Promedio por Segmento del Tanque</h3>
                     <p className="text-sm text-gray-400 mb-4">Este gráfico muestra la distancia promedio que recorres por cada segmento individual del medidor (ej. del 12 al 11). Cada barra es un cálculo independiente para esa transición específica, ayudándote a entender cómo cambia el consumo a medida que se vacía el tanque. Se usan solo reportes donde el nivel baja exactamente un segmento para mayor precisión.</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={kmPerSegment} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                             <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `${value} km`} />
                             <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                             <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                                formatter={(value) => [`${value} km`, 'Distancia promedio']}
                            />
                             <Bar dataKey="km" name="Distancia" fill="#38bdf8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            ) : (
                 <Card>
                     <h3 className="text-lg font-semibold text-white mb-2">Distancia por Segmento del Tanque</h3>
                     <p className="text-gray-400">Registra reportes de estado frecuentes, especialmente cuando el nivel del tanque baje un segmento. Esto nos ayudará a analizar el rendimiento en cada etapa del tanque.</p>
                </Card>
            )}
            
            {stationStats.length > 0 && 
                <Card>
                    <h2 className="text-xl font-semibold text-white mb-2">Rendimiento y Costo por Gasolinera</h2>
                    <p className="text-sm text-gray-400 mb-4">Analiza qué gasolinera te ofrece el mejor rendimiento y el costo más bajo por kilómetro. La tabla está ordenada por la opción más económica (menor costo por km).</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-700">
                                <tr>
                                    <th className="p-3 text-sm font-semibold tracking-wide">Gasolinera</th>
                                    <th className="p-3 text-sm font-semibold tracking-wide text-center">Visitas</th>
                                    <th className="p-3 text-sm font-semibold tracking-wide text-right">Precio Prom./L</th>
                                    <th className="p-3 text-sm font-semibold tracking-wide text-right">Rendimiento Prom. (km/l)</th>
                                    <th className="p-3 text-sm font-semibold tracking-wide text-right">Costo Prom./km</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stationStats.sort((a,b) => a.avgCostPerKm - b.avgCostPerKm).map(station => (
                                    <tr key={station.name} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="p-3 font-semibold">{station.name}</td>
                                        <td className="p-3 text-center">{station.visits}</td>
                                        <td className="p-3 text-right">${station.avgPricePerLiter.toFixed(2)}</td>
                                        <td className="p-3 text-right">{station.avgKmpl.toFixed(2)}</td>
                                        <td className="p-3 font-bold text-green-400 text-right">${station.avgCostPerKm.toFixed(3)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            }
        </div>
    );
};

export default Analysis;