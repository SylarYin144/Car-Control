
import { GoogleGenAI } from "@google/genai";
import type { Vehicle } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getMaintenanceRecommendations = async (vehicle: Vehicle): Promise<string> => {
    try {
        const prompt = `
        Eres un experto mecánico de automóviles. Basado en un ${vehicle.make} ${vehicle.model} del año ${vehicle.year} con ${vehicle.mileage} kilómetros, 
        proporciona una lista de tareas de mantenimiento preventivo recomendadas.
        Organiza tus recomendaciones en una lista con viñetas. Sé conciso y práctico.
        Ejemplo de formato:
        - Cambio de aceite y filtro: Recomendado cada 10,000 km.
        - Rotación de neumáticos: Esencial para un desgaste uniforme.
        - Revisión de frenos: Inspeccionar pastillas y discos.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error fetching AI recommendations:", error);
        return "No se pudieron obtener las recomendaciones de la IA. Por favor, asegúrate de que tu clave de API esté configurada correctamente y vuelve a intentarlo.";
    }
};
