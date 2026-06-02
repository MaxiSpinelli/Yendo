import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

const PROMPT = `Analizá este documento que es un pasaje o confirmación de vuelo.
Extraé la siguiente información y devolvé ÚNICAMENTE un JSON válido, sin texto adicional, sin markdown, sin backticks.

El JSON debe tener exactamente esta estructura:
{
  "airline": "nombre de la aerolínea",
  "flight_number": "número de vuelo (ej: AR1234)",
  "origin": "código IATA o nombre de ciudad de origen",
  "destination": "código IATA o nombre de ciudad de destino",
  "departure_at": "fecha y hora de salida en formato ISO 8601 (ej: 2025-06-15T14:30:00)",
  "notes": "cualquier info adicional relevante como terminal, asiento, clase (puede ser null)"
}

Si no podés encontrar algún campo, usá null para ese campo.
Si no podés determinar el año, asumí el año más próximo futuro.
Devolvé SOLO el JSON, nada más.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY no configurada" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado. Usá PDF, JPG o PNG." },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64,
                },
              },
              {
                text: PROMPT,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini error:", errText);
      return NextResponse.json(
        { error: "Error al procesar el archivo con IA" },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Clean and parse JSON
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let extracted: Record<string, string | null>;
    try {
      extracted = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Gemini response:", rawText);
      return NextResponse.json(
        { error: "No se pudo interpretar el pasaje. Intentá con otra imagen o completá los datos manualmente." },
        { status: 422 }
      );
    }

    return NextResponse.json({ data: extracted });
  } catch (err) {
    console.error("extract-flight error:", err);
    return NextResponse.json(
      { error: "Error inesperado al procesar el archivo" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};