import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jsPDF from 'jspdf';

const API_KEY = 'AIzaSyC68YQ0wXs2dZnuip2Y_YVh1uLLL1L2OGM';
const genAI = new GoogleGenerativeAI(API_KEY);

export default function Workspace() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState(null);
    const chatBottomRef = useRef(null);

    // Refs for PDF Export
    const keywordsRef = useRef(null);
    const funcReqRef = useRef(null);
    const nonFuncReqRef = useRef(null);

    useEffect(() => {
        // Busca o job do localStorage que a tela anterior salvou
        const savedJobs = JSON.parse(localStorage.getItem('arquitetos_jobs') || '[]');
        const currentJob = savedJobs.find(j => j.id === parseInt(jobId));
        setJob(currentJob);
        if (currentJob) {
            initChat(currentJob);
        }
    }, [jobId]);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initChat = async (currentJob) => {
        try {
            setIsLoading(true);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: currentJob.personaPrompt
            });

            const session = model.startChat({
                history: [],
            });
            setChatSession(session);

            const result = await session.sendMessage("Olá, eu sou o arquiteto de software. Como posso ajudar com seu projeto hoje?");
            setMessages([
                { role: 'assistant', content: result.response.text(), id: Date.now() }
            ]);
        } catch (error) {
            console.error("Error initializing chat:", error);
            setMessages([{ role: 'assistant', content: "Membro da equipe indisponível. Conexão falhou.", id: Date.now() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !chatSession || isLoading) return;

        const userMsg = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg, id: Date.now() }]);

        try {
            setIsLoading(true);
            const result = await chatSession.sendMessage(userMsg);

            // Simula delay de digitação do 'humanizado'
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: result.response.text(), id: Date.now() }]);
                setIsLoading(false);
            }, 1000 + Math.random() * 800);

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Tivemos um problema de comunicação. Pode repetir?", id: Date.now() }]);
            setIsLoading(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Documento de Elicitação de Requisitos", 20, 20);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Projeto: ${job.title}`, 20, 30);
        doc.text(`Cliente: ${job.clientName}`, 20, 38);

        doc.setFont("helvetica", "bold");
        doc.text("Palavras-chave:", 20, 55);
        doc.setFont("helvetica", "normal");
        const keywords = doc.splitTextToSize(keywordsRef.current.value || 'Não preenchido', 170);
        doc.text(keywords, 20, 62);

        let startY = 62 + (keywords.length * 5) + 10;

        doc.setFont("helvetica", "bold");
        doc.text("Requisitos Funcionais:", 20, startY);
        doc.setFont("helvetica", "normal");
        const funcText = doc.splitTextToSize(funcReqRef.current.value || 'Não preenchido', 170);
        doc.text(funcText, 20, startY + 7);

        startY += 7 + (funcText.length * 5) + 10;

        doc.setFont("helvetica", "bold");
        doc.text("Requisitos Não Funcionais:", 20, startY);
        doc.setFont("helvetica", "normal");
        const nonFuncText = doc.splitTextToSize(nonFuncReqRef.current.value || 'Não preenchido', 170);
        doc.text(nonFuncText, 20, startY + 7);

        doc.save(`${job.title.replace(/\s+/g, '_')}_Requisitos.pdf`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    if (!job) return <div className="text-center mt-20 text-muted-foreground animate-pulse">Carregando Workspace...</div>;

    return (
        <div className="flex flex-col animate-in fade-in duration-500 h-[85vh]">

            <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Workspace de Elicitação</h2>
                <p className="text-muted-foreground">Projeto: <span className="text-primary font-medium">{job.title}</span> &bull; Analista: {job.clientName}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">

                {/* Chat Area */}
                <div className="glass-card rounded-2xl flex-[3] flex flex-col overflow-hidden shadow-sm relative">
                    <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Reunião com {job.clientName.split(' ')[0]}
                        </h3>
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">Secure Connection</span>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 relative">
                        {/* Decorative blueprint trace background */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {messages.length === 0 && isLoading && (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Estabelecendo conexão AI...
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-card/80 backdrop-blur-sm border border-border text-foreground rounded-bl-sm'
                                    }`}>
                                    <p
                                        className="text-sm whitespace-pre-wrap leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                                        }}
                                    ></p>
                                </div>
                            </div>
                        ))}
                        {isLoading && messages.length > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm self-start">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </span>
                            </div>
                        )}
                        <div ref={chatBottomRef} />
                    </div>

                    <div className="p-4 border-t border-border bg-card/30 backdrop-blur-md">
                        <div className="flex gap-3 items-center bg-background border border-border rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                            <input
                                type="text"
                                placeholder="Escreva sua mensagem profissional..."
                                className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputValue.trim()}
                                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Requirements Panel */}
                <div className="glass-panel rounded-2xl flex-[2] flex flex-col overflow-hidden shadow-sm border-t-4 border-t-primary">
                    <div className="p-4 border-b border-border/50">
                        <h3 className="font-semibold text-lg">Especificação de Sistema</h3>
                        <p className="text-xs text-muted-foreground">Documente as necessidades extraídas</p>
                    </div>

                    <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
                        <div className="flex flex-col w-full group">
                            <label className="text-xs font-medium text-muted-foreground mb-1 group-focus-within:text-foreground transition-colors">Palavras-chave</label>
                            <input ref={keywordsRef} type="text" className="w-full bg-card/50 border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all shadow-inner" placeholder="E.g., Nuvem, Tempo Real..." />
                        </div>

                        <div className="flex flex-col flex-1 group">
                            <label className="text-xs font-medium text-emerald-500/80 mb-1 group-focus-within:text-emerald-500 transition-colors">Requisitos Funcionais (RF)</label>
                            <textarea ref={funcReqRef} className="w-full h-full min-h-[120px] bg-card/50 border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner" placeholder="- O sistema deve permitir que..."></textarea>
                        </div>

                        <div className="flex flex-col flex-1 group">
                            <label className="text-xs font-medium text-amber-500/80 mb-1 group-focus-within:text-amber-500 transition-colors">Requisitos Não Funcionais (RNF)</label>
                            <textarea ref={nonFuncReqRef} className="w-full h-full min-h-[120px] bg-card/50 border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-inner" placeholder="- A API deve responder em 200ms..."></textarea>
                        </div>
                    </div>

                    <div className="p-4 bg-card/30 border-t border-border/50 backdrop-blur-sm grid grid-cols-2 gap-3">
                        <button
                            className="w-full py-3 bg-card border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-all text-sm tracking-wide shadow-sm"
                            onClick={generatePDF}
                        >
                            EXPORTAR PDF
                        </button>
                        <button
                            className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-sm tracking-wide"
                            onClick={() => navigate(`/simulation/${jobId}`)}
                        >
                            INICIAR SDLC
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
