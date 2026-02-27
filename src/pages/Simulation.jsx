import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Simulation() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [currentPhase, setCurrentPhase] = useState(0);

    const [job] = useState(() => {
        const savedJobs = JSON.parse(localStorage.getItem('arquitetos_jobs') || '[]');
        return savedJobs.find(j => j.id === parseInt(jobId));
    });

    const phases = [
        { title: "Requirements & Architecture", color: "border-blue-500", bg: "bg-blue-500", text: "text-blue-500", desc: "Estruturando os esquemas e blueprints..." },
        { title: "Implementation", color: "border-indigo-500", bg: "bg-indigo-500", text: "text-indigo-500", desc: "Transcrevendo a lógica para blocos de código..." },
        { title: "QA & Testing", color: "border-amber-500", bg: "bg-amber-500", text: "text-amber-500", desc: "Validando edge-cases e performance..." },
        { title: "Deployment", color: "border-emerald-500", bg: "bg-emerald-500", text: "text-emerald-500", desc: "Disponibilizando em ambiente de produção!" }
    ];
    useEffect(() => {
        if (currentPhase < phases.length - 1) {
            const timer = setTimeout(() => {
                setCurrentPhase(prev => prev + 1);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [currentPhase, phases.length]);

    if (!job) return <div className="text-center mt-20 text-muted-foreground animate-pulse">Iniciando ambiente de simulação...</div>;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 text-center">

            <div className="mb-10 space-y-2">
                <h2 className="text-4xl font-extrabold tracking-tight">SDLC Simulator</h2>
                <p className="text-lg text-muted-foreground">Orquestrando a entrega de: <span className="font-semibold text-primary">{job.title}</span></p>
            </div>

            <div className="glass-panel rounded-3xl p-10 w-full max-w-4xl flex flex-col items-center relative overflow-hidden shadow-2xl">
                {/* Glow effect matching phase color */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] ${phases[currentPhase].bg.replace('bg-', 'bg-')}/10 rounded-full blur-[80px] -z-10 transition-colors duration-1000 pointer-events-none`}></div>

                <div className="h-12 flex items-center justify-center mb-8">
                    <h3 className={`text-2xl font-bold transition-colors duration-500 ${phases[currentPhase].text}`}>
                        {currentPhase < phases.length - 1 ? 'Build in Progress...' : 'Product Released!'}
                    </h3>
                </div>

                <p className="text-xl text-muted-foreground h-8 transition-opacity duration-300">
                    {phases[currentPhase].desc}
                </p>

                {/* Stages Display */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-12 mb-16 relative z-10">
                    {phases.map((phase, index) => {
                        const isActive = index === currentPhase;
                        const isDone = index < currentPhase;

                        return (
                            <div
                                key={index}
                                className={`glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-700
                  ${isActive ? `ring-2 ring-offset-2 ring-offset-background ${phase.color.replace('border-', 'ring-')} scale-105 shadow-xl` : ''}
                  ${isDone ? 'opacity-70 bg-card/80' : ''}
                  ${!isActive && !isDone ? 'opacity-40 grayscale' : ''}
                `}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                   ${isDone ? 'bg-emerald-500/20 text-emerald-500' : isActive ? 'bg-primary/20 text-primary animate-pulse' : 'bg-muted text-muted-foreground'}`
                                }>
                                    {isDone ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    ) : (
                                        <span className="font-bold">{index + 1}</span>
                                    )}
                                </div>
                                <span className="font-medium text-sm">{phase.title}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden mt-auto border border-border/50">
                    <div
                        className={`h-full ${phases[currentPhase].bg} transition-all ease-out duration-1000`}
                        style={{ width: `${((currentPhase + 1) / phases.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className={`mt-10 transition-all duration-1000 transform ${currentPhase === phases.length - 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                <button
                    onClick={() => navigate('/jobs')}
                    className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:bg-emerald-600 transition-all focus:ring-4 ring-emerald-500/20 active:scale-95"
                >
                    Finalizar Delivery & Voltar ao Board
                </button>
            </div>

        </div>
    );
}
