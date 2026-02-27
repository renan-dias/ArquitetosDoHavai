import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">

            <div className="glass-card rounded-2xl p-10 max-w-3xl w-full flex flex-col items-center gap-8 relative overflow-hidden">
                {/* Decorative Grid Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                <div className="p-4 bg-primary/10 rounded-full border border-primary/20 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                        <path d="M7 21h10" />
                        <path d="M12 3v18" />
                        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
                    </svg>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Arquitetos do <span className="text-primary text-glow">Havaí</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        A plataforma definitiva para elicitação de requisitos corporativos. Modele software conversando com stakeholders virtuais impulsionados por IA sob o design de blueprints.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-4 z-10">
                    <div className="glass-panel p-5 rounded-xl">
                        <div className="flex items-center gap-3 mb-2 font-semibold text-primary">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">1</span>
                            IA Generativa
                        </div>
                        <p className="text-sm text-muted-foreground">Personas únicas e dinâmicas criadas em tempo real pelas capacidades do Google Gemini.</p>
                    </div>
                    <div className="glass-panel p-5 rounded-xl">
                        <div className="flex items-center gap-3 mb-2 font-semibold text-primary">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">2</span>
                            Requisitos Ativos
                        </div>
                        <p className="text-sm text-muted-foreground">Extraia e documente demandas Funcionais e Não Funcionais em um painel interativo.</p>
                    </div>
                    <div className="glass-panel p-5 rounded-xl">
                        <div className="flex items-center gap-3 mb-2 font-semibold text-primary">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">3</span>
                            Ciclo SDLC
                        </div>
                        <p className="text-sm text-muted-foreground">Simule visualmente a linha do  tempo de desenvolvimento e deploy do produto elicitado.</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/jobs')}
                    className="mt-6 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/25"
                >
                    Acessar Job Board
                </button>

            </div>
        </div>
    );
}
