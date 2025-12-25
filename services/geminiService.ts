import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Meal, Suggestion, ActivitySuggestion, UserProfile, Exercise, Prognosis } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const modelId = "gemini-3-flash-preview";

// --- SCHEMAS ---

const bulkFoodAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING, description: "Nombre de la comida en español." },
          calories: { type: Type.INTEGER, description: "Calorías totales estimadas." },
          protein: { type: Type.INTEGER, description: "Proteína (g)." },
          carbs: { type: Type.INTEGER, description: "Carbohidratos (g)." },
          fat: { type: Type.INTEGER, description: "Grasas (g)." },
        },
        required: ["foodName", "calories", "protein", "carbs", "fat"],
      }
    }
  },
  required: ["items"],
};

const bulkExerciseAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nombre estandarizado del ejercicio en español." },
          caloriesBurned: { type: Type.INTEGER, description: "Calorías quemadas estimadas." },
          durationMinutes: { type: Type.INTEGER, description: "Duración en minutos." },
        },
        required: ["name", "caloriesBurned", "durationMinutes"],
      }
    }
  },
  required: ["items"],
};

const mealSuggestionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Nombre del plato." },
      calories: { type: Type.INTEGER, description: "Calorías aproximadas." },
      description: { type: Type.STRING, description: "Breve descripción." },
    },
    required: ["name", "calories", "description"],
  },
};

const activitySuggestionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      activity: { type: Type.STRING, description: "Nombre del ejercicio principal (Calistenia/Street Workout)." },
      details: { type: Type.STRING, description: "Series y repeticiones exactas (ej: 4x12)." },
      technique: { type: Type.STRING, description: "Tip clave de técnica." },
      durationMinutes: { type: Type.INTEGER, description: "Duración estimada." },
      caloriesBurned: { type: Type.INTEGER, description: "Calorías quemadas." },
      intensity: { type: Type.STRING, description: "Baja, Media o Alta." },
      homeAlternative: {
        type: Type.OBJECT,
        description: "Una variante para hacer en casa SIN NINGÚN EQUIPO (suelo/muebles).",
        properties: {
           activity: { type: Type.STRING, description: "Nombre variante casera." },
           details: { type: Type.STRING, description: "Series/reps para casa." },
           technique: { type: Type.STRING, description: "Tip técnico variante casera." }
        },
        required: ["activity", "details", "technique"]
      }
    },
    required: ["activity", "details", "technique", "durationMinutes", "caloriesBurned", "intensity", "homeAlternative"],
  },
};

const prognosisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    prediction: { type: Type.STRING, description: "Predicción corta y directa." },
    advice: { type: Type.STRING, description: "Consejo accionable." },
    status: { type: Type.STRING, enum: ['ON_TRACK', 'SLOW', 'WARNING'], description: "Estado." },
  },
  required: ["prediction", "advice", "status"],
};

// --- FUNCTIONS ---

export const analyzeFoodBulk = async (text: string, imageBase64?: string): Promise<Omit<Meal, 'id' | 'timestamp' | 'category'>[]> => {
  try {
    const parts: any[] = [];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      });
      parts.push({ text: "Analiza esta imagen. ¿Qué comida es? Estima calorías y macros. Sé preciso. Si hay texto abajo, úsalo como contexto extra." });
    }

    if (text) {
      parts.push({ text: `Contexto extra del usuario: "${text}".` });
    }

    if (parts.length === 0) return [];

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: bulkFoodAnalysisSchema,
        systemInstruction: "Eres un nutricionista experto enfocado en culturismo y fitness. Identifica la comida y sus macros con precisión. Usa nombres comunes en español. Sé realista."
      },
    });

    const result = JSON.parse(response.text || "{}");
    if (!result.items) return [];

    return result.items.map((item: any) => ({
      name: item.foodName,
      calories: item.calories,
      macros: { protein: item.protein, carbs: item.carbs, fat: item.fat },
      description: text || "Análisis de Foto"
    }));
  } catch (error) {
    console.error("Error analyzing food:", error);
    return [];
  }
};

export const analyzeExerciseBulk = async (text: string, userProfile: UserProfile): Promise<Omit<Exercise, 'id' | 'timestamp' | 'scheduledTime'>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Calcula el gasto calórico para: "${text}". Usuario: ${userProfile.weight}kg, ${userProfile.gender}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: bulkExerciseAnalysisSchema,
        systemInstruction: "Eres un entrenador deportivo experto. Calcula calorías quemadas basándote en el esfuerzo físico."
      },
    });

    const result = JSON.parse(response.text || "{}");
    if (!result.items) return [];
    return result.items;
  } catch (error) {
    console.error("Error analyzing exercise:", error);
    return [];
  }
};

export const getMealSuggestions = async (remainingCalories: number): Promise<Suggestion[]> => {
  try {
    const prompt = `Al usuario le quedan ${remainingCalories} kcal. Dame 3 opciones de comida DIFERENTES y creativas, altas en proteína. Responde en español con tono de "gymbro" motivador.`;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mealSuggestionSchema,
        systemInstruction: "Eres un chef fitness estilo Punk. Comida real, nada de procesados. Tono directo."
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const getBurnSuggestions = async (caloriesToBurn: number, userProfile: UserProfile): Promise<ActivitySuggestion[]> => {
  try {
    const prompt = `El usuario necesita quemar ${caloriesToBurn} kcal. Peso: ${userProfile.weight}kg.
    Dame 3 ejercicios o mini-rutinas de CALISTENIA o EJERCICIO EN CASA.
    
    PRIORIDAD: Calistenia, Street Workout, Peso Corporal.
    
    Para cada uno especifica:
    1. Nombre del ejercicio principal.
    2. Details: Series y repeticiones exactas (ej: "4 series de 12 repeticiones al fallo").
    3. Technique: Un consejo técnico breve.
    4. HomeAlternative: Una variante OBLIGATORIA para hacer en casa SIN NADA DE EQUIPO (usando sillas, suelo, pared).
    
    Usa lenguaje de gimnasio en español (fiera, máquina, hierro, barra).`;
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: activitySuggestionSchema,
        systemInstruction: "Eres un experto en Calistenia y Street Workout. Crees que el gimnasio es para débiles. Tu cuerpo es tu gimnasio. Sé brutalmente específico con la técnica."
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const getPrognosis = async (
  userProfile: UserProfile, 
  netCaloriesToday: number, 
  streakDays: number
): Promise<Prognosis | null> => {
  try {
    const deficit = userProfile.targetCalories - netCaloriesToday;
    const prompt = `Meta: ${userProfile.targetCalories}. Netas hoy: ${netCaloriesToday}. Diferencia: ${deficit}. Racha: ${streakDays} días. Dame un veredicto en español, usando jerga de gimnasio (máquina, fiera, a tope).`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: prognosisSchema,
        systemInstruction: "Eres un analista de datos fitness con actitud. Sé directo, usa jerga de gimnasio en español."
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return null;
  }
};

export const chatWithCoach = async (
  message: string, 
  context: { caloriesLeft: number, macros: any, goal: string }
): Promise<string> => {
  try {
    const prompt = `
      Contexto del usuario:
      Objetivo: ${context.goal}.
      Calorías restantes: ${context.caloriesLeft}.
      
      Usuario dice: "${message}"
      
      Responde en español con actitud "Gym Rat Punk". Usa palabras como "máquina", "fiera", "bro", "hierros", "gains", "fallo muscular". Sé motivador pero rudo. No te andes con rodeos.
    `;
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "No te escucho con tanto ruido de hierros, repite.";
  } catch (error) {
    return "Error de red. El gym está cerrado por hoy.";
  }
};

export const consultOracle = async (
    text: string, 
    youtubeUrl: string | undefined, 
    type: 'FOOD' | 'EXERCISE'
): Promise<string> => {
    try {
        const prompt = `
        TIPO DE CONSULTA: ${type === 'FOOD' ? 'ANÁLISIS DE COMIDA' : 'ANÁLISIS DE RUTINA/EJERCICIO'}.
        
        EL USUARIO PREGUNTA: "${text}"
        LINK DE VIDEO APORTADO: "${youtubeUrl || 'Ninguno'}"
        
        INSTRUCCIONES:
        1. Eres el "Oráculo del Gym". Actitud Punk, agresiva pero muy técnica y científica.
        2. Si hay link de YouTube, usa Google Search para ver de qué trata el video (busca el título, contenido, reputación del canal).
        3. Si es COMIDA: Calcula las "CALORÍAS HIPOTÉTICAS" de lo que describe. Dile si es comida de perro o gasolina de cohete.
        4. Si es EJERCICIO: Analiza si esa rutina sirve para quemar grasa o hipertrofia. Critica la técnica si el video es de un influencer vende-humo.
        
        Responde en texto plano (Markdown), sin JSON. Sé breve y brutal.
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        
        // Extract URLs if available (standard requirement for Google Search grounding)
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        let finalText = response.text || "La bola de cristal está empañada. Intenta luego.";
        
        if (sources.length > 0) {
            finalText += "\n\nFUENTES DEL ORÁCULO:";
            sources.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    finalText += `\n- [${chunk.web.title}](${chunk.web.uri})`;
                }
            });
        }

        return finalText;

    } catch (error) {
        console.error(error);
        return "ERROR: El oráculo está en descanso anabólico. Revisa tu conexión.";
    }
}
