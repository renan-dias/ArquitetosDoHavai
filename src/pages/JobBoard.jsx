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

    const generateJobs = async () => {
        try {
            setIsLoading(true);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `Gere exatamente 3 ideias criativas e corporativas de sistemas ou aplicativos que clientes fictícios poderiam encomendar. 
      Retorne APENAS um JSON array válido com objetos no seguinte formato:
      [
        {
          "id": 1, // um numero unico
          "title": "Nome da Aplicação",
          "clientName": "Nome do Cliente e Profissão",
          "shortDescription": "Um breve resumo do problema de negócio (máximo 2 linhas).",
          "personaPrompt": "Instruções detalhadas para uma IA de como agir e falar como este cliente, incluindo nível de formalidade e jargão específico da área."
        }
      ]
      Retorne puramente o texto JSON. Sem crases de markdown.`;

            const result = await model.generateContent(prompt);
            const textResponse = result.response.text();

            // Limpeza pra garantir o JSON
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const generatedJobs = JSON.parse(cleanJson);

            // Salva no localStorage pra persistir pros próximos componentes
            localStorage.setItem('arquitetos_jobs', JSON.stringify(generatedJobs));
            setJobs(generatedJobs);

        } catch (error) {
            console.error("Erro ao gerar jobs via IA:", error);
            // Fallback
            setJobs([
                {
                    id: 99,
                    title: "Fallback System",
                    clientName: "Admin",
                    shortDescription: "A IA não conseguiu conectar, job de emergência carregado.",
                    personaPrompt: "Você é um administrador do sistema e responde apenas 'Sistema offline'."
                }
            ]);
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
