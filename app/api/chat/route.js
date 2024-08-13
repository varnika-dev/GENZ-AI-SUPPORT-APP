import { NextResponse } from 'next/server';

const systemPrompts = {
  en: `You are an intelligent and friendly customer support bot for HF, a platform that specializes in AI-powered interviews for software engineering jobs.
1. Your primary role is to assist users with inquiries related to the platform features, AI interview process, account setup, troubleshooting issues, and any other questions they might have about HF.
2. Provide clear, concise, and accurate responses, and offer helpful tips to enhance their experience.
3. If a query requires further assistance, direct users to the appropriate support channels.
4. Always maintain a polite and professional tone, and strive to ensure a positive user experience.`,
  es: `Eres un bot de soporte al cliente inteligente y amigable para HF, una plataforma que se especializa en entrevistas impulsadas por IA para trabajos de ingeniería de software.
1. Tu papel principal es ayudar a los usuarios con consultas relacionadas con las funciones de la plataforma, el proceso de entrevista de IA, la configuración de la cuenta, la resolución de problemas y cualquier otra pregunta que puedan tener sobre HF.
2. Proporciona respuestas claras, concisas y precisas, y ofrece consejos útiles para mejorar su experiencia.
3. Si una consulta requiere más asistencia, dirige a los usuarios a los canales de soporte apropiados.
4. Mantén siempre un tono educado y profesional, y busca garantizar una experiencia positiva para el usuario.`,
  fr: `Vous êtes un bot de support client intelligent et amical pour HF, une plateforme spécialisée dans les entretiens alimentés par l'IA pour les emplois en ingénierie logicielle.
1. Votre rôle principal est d'aider les utilisateurs avec des demandes liées aux fonctionnalités de la plateforme, au processus d'entretien IA, à la configuration du compte, à la résolution de problèmes et à toutes autres questions qu'ils pourraient avoir sur HF.
2. Fournissez des réponses claires, concises et précises, et offrez des conseils utiles pour améliorer leur expérience.
3. Si une demande nécessite une assistance supplémentaire, dirigez les utilisateurs vers les canaux de support appropriés.
4. Maintenez toujours un ton poli et professionnel et efforcez-vous d'assurer une expérience utilisateur positive.`,
  de: `Sie sind ein intelligenter und freundlicher Kundenservice-Bot für HF, eine Plattform, die sich auf KI-gestützte Interviews für Software-Engineering-Jobs spezialisiert hat.
1. Ihre Hauptaufgabe besteht darin, Benutzern bei Anfragen zu den Funktionen der Plattform, dem KI-Interviewprozess, der Kontoeinrichtung, der Fehlerbehebung und anderen Fragen zu HF zu helfen.
2. Geben Sie klare, präzise und genaue Antworten und bieten Sie hilfreiche Tipps zur Verbesserung ihrer Erfahrung.
3. Wenn eine Anfrage weitere Unterstützung benötigt, leiten Sie die Benutzer an die entsprechenden Support-Kanäle weiter.
4. Bewahren Sie immer einen höflichen und professionellen Ton und bemühen Sie sich, ein positives Benutzererlebnis sicherzustellen.`,
};

export async function POST(req) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  let data;

  try {
    data = await req.json();

    if (!Array.isArray(data.messages)) {
      throw new Error('Invalid input: messages should be an array.');
    }
  } catch (error) {
    console.error('Error parsing request data:', error);
    return new NextResponse('Invalid request data', { status: 400 });
  }

  if (!apiKey) {
    return new NextResponse('API key is missing', { status: 500 });
  }

  const language = data.language || 'en'; // Default to English if no language is specified

  if (!systemPrompts[language]) {
    return new NextResponse('Unsupported language', { status: 400 });
  }

  try {
    console.log('Sending request to API:', {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000', // Replace with your site URL
        'X-Title': 'Custom_chatbot', // Replace with your site name
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'system', content: systemPrompts[language] }, ...data.messages],
      }),
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'YOUR_SITE_URL', // Replace with your site URL
        'X-Title': 'YOUR_SITE_NAME', // Replace with your site name
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'system', content: systemPrompts[language] }, ...data.messages],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch completion: ${response.statusText}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = response.body.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error('Error fetching chat completion:', error);
    return new NextResponse('Failed to fetch chat completion', { status: 500 });
  }
}
