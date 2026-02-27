import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';

// In a real app we'd load this from env
const API_KEY = 'AIzaSyC68YQ0wXs2dZnuip2Y_YVh1uLLL1L2OGM';
const genAI = new GoogleGenerativeAI(API_KEY);

export default function JobBoard() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        generateJobs();
    }, []);

    const FALLBACK_JOBS = [
        {
            id: 101,
            title: "Plataforma Educacional Gamificada",
            clientName: "Prof. Alberto (Escola Modelo)",
            shortDescription: "Um portal de estudos com sistema de ranking e moedas virtuais para engajar os alunos nas tarefas escolares.",
            personaPrompt: "Você é o Prof. Alberto, um professor animado do ensino fundamental. Responda de forma sempre curta, casual e usando algumas gírias educacionais. Você precisa de um site que pareça um jogo para os alunos fazerem os deveres de casa e ganharem 'EduCoins'. Responda no máximo 2-3 frases por vez."
        },
        {
            id: 102,
            title: "Gestor de Frota Inteligente",
            clientName: "Carlos (Gerente de Logística)",
            shortDescription: "Painel administrativo para rastrear caminhões e prever manutenção baseada em IA e quilometragem.",
            personaPrompt: "Você é o Carlos, um gerente de logística focado em resultados e redução de custos. Você é muito direto, sem enrolação. Responda curto e objetivo. Você quer um sistema que avise no celular quando o pneu do caminhão precisa ser trocado antes de estourar na estrada. Não use parágrafos longos."
        },
        {
            id: 103,
            title: "App de Meditação Corporativa",
            clientName: "Silvia (RH TechCorp)",
            shortDescription: "Aplicativo mobile focado no bem-estar mental dos funcionários, com sessões guiadas de 5 minutos.",
            personaPrompt: "Você é a Silvia, líder de RH de uma startup. Você é empática, \"zen\" e usa palavras acolhedoras, mas tem pressa. Responda curto e gentil. Você precisa de um app onde os funcionários abram, respirem por 5 minutos com um áudio, e pronto. Responda com frases curtas de 1-2 linhas."
        }
    ];

    const generateJobs = async () => {
        try {
            setIsLoading(true);

            // Timeout para evitar travamento da API
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `Gere exatamente 3 ideias criativas e corporativas de sistemas ou aplicativos que clientes fictícios poderiam encomendar. 
      Nesta geração, adicione o requerimento: "Você sempre deve responder de forma curta, informal, com linguagem natural, simulando um chat real (máximo 2 a 3 frases por resposta)." dentro do personaPrompt.
      Retorne APENAS um JSON array válido com objetos no seguinte formato:
      [
        {
          "id": 1, // um numero unico
          "title": "Nome da Aplicação",
          "clientName": "Nome do Cliente e Profissão",
          "shortDescription": "Um breve resumo do problema de negócio (máximo 2 linhas).",
          "personaPrompt": "Instruções detalhadas para uma IA de como agir e falar como este cliente, obrigatório exigir respostas curtas e casuais."
        }
      ]
      Retorne puramente o texto JSON. Sem crases de markdown.`;

            const result = await model.generateContent(prompt, { signal: controller.signal });
            clearTimeout(timeoutId);

            const textResponse = result.response.text();

            // Limpeza pra garantir o JSON
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const generatedJobs = JSON.parse(cleanJson);

            // Salva no localStorage pra persistir pros próximos componentes
            localStorage.setItem('arquitetos_jobs', JSON.stringify(generatedJobs));
            setJobs(generatedJobs);

        } catch (error) {
            console.warn("Erro ao gerar jobs criativos (Gemini API). Usando Fallbacks do portfólio:", error);
            // Fallback amigável
            localStorage.setItem('arquitetos_jobs', JSON.stringify(FALLBACK_JOBS));
            setJobs(FALLBACK_JOBS);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJobClick = (jobId) => {
        navigate(`/workspace/${jobId}`);
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500">

            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Painel de Demandas</h2>
                <p className="text-muted-foreground">Selecione um projeto em aberto para iniciar a elicitação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">

                {isLoading ? (
                    // Skeleton Loading State
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="glass-card rounded-xl p-6 h-64 flex flex-col justify-center items-center gap-4 animate-pulse">
                            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div className="h-4 bg-muted w-3/4 rounded"></div>
                            <div className="h-3 bg-muted w-1/2 rounded"></div>
                        </div>
                    ))
                ) : (
                    // Active Jobs
                    jobs.map(job => (
                        <div key={job.id} className="glass-card glass-card-hover rounded-xl p-6 flex flex-col group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-[30px] -z-10 group-hover:bg-primary/20 transition-all"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                                    <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-md inline-block">
                                        {job.clientName}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-6 flex-1">
                                {job.shortDescription}
                            </p>

                            <button
                                onClick={() => handleJobClick(job.id)}
                                className="w-full py-2.5 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors border border-primary/20"
                            >
                                Analisar Projeto
                            </button>
                        </div>
                    ))
                )}

                {/* Ghost/Blurred Jobs to simulate activity */}
                {!isLoading && Array.from({ length: 3 }).map((_, i) => (
                    <div key={`ghost-${i}`} className="glass-card rounded-xl p-6 flex flex-col opacity-60 pointer-events-none filter blur-[3px] select-none">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="h-5 w-32 bg-border rounded mb-2"></div>
                                <div className="h-4 w-20 bg-muted rounded"></div>
                            </div>
                        </div>
                        <div className="space-y-2 mb-6 flex-1">
                            <div className="h-3 w-full bg-border rounded"></div>
                            <div className="h-3 w-5/6 bg-border rounded"></div>
                        </div>
                        <div className="w-full py-2.5 bg-muted rounded-lg"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
