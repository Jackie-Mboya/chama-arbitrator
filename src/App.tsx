/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  Send, 
  FileText, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  Loader2,
  Menu,
  X,
  History,
  MessageSquare,
  BookOpen,
  PieChart,
  Languages,
  Upload,
  FileCode,
  Search
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { translations } from './translations';
import * as XLSX from 'xlsx';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface DisputeSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
  bylaws: string;
  mpesa: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isBylawsModalOpen, setIsBylawsModalOpen] = useState(false);
  const [tempBylaws, setTempBylaws] = useState('');
  const [activeBylaws, setActiveBylaws] = useState('');
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [tempMpesa, setTempMpesa] = useState('');
  const [activeMpesa, setActiveMpesa] = useState('');
  const [lang, setLang] = useState<'sw' | 'en'>('sw');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pastSessions, setPastSessions] = useState<DisputeSession[]>([]);
  const [isPastDisputesModalOpen, setIsPastDisputesModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem('chama_disputes');
    if (saved) {
      try {
        setPastSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse past disputes", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chama_disputes', JSON.stringify(pastSessions));
  }, [pastSessions]);

  const saveCurrentSession = () => {
    if (messages.length === 0) return;
    
    // Generate a title based on the first user message
    const firstUserMsg = messages.find(m => m.role === 'user')?.parts[0].text || 'Mgogoro Mpya';
    const title = firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? '...' : '');

    const newSession: DisputeSession = {
      id: Date.now().toString(),
      title,
      date: new Date().toLocaleString(),
      messages,
      bylaws: activeBylaws,
      mpesa: activeMpesa
    };

    setPastSessions(prev => [newSession, ...prev]);
  };

  const loadSession = (session: DisputeSession) => {
    setMessages(session.messages);
    setActiveBylaws(session.bylaws);
    setActiveMpesa(session.mpesa);
    setIsIntroVisible(false);
    setIsPastDisputesModalOpen(false);
  };

  const deleteSession = (id: string) => {
    setPastSessions(prev => prev.filter(s => s.id !== id));
  };

  const filteredHistory = messages.filter(m => 
    m.parts[0].text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBylaws = activeBylaws.toLowerCase().includes(searchQuery.toLowerCase()) ? [activeBylaws] : [];
  const filteredMpesa = activeMpesa.toLowerCase().includes(searchQuery.toLowerCase()) ? [activeMpesa] : [];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'bylaws' | 'mpesa') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'xlsx' || extension === 'xls') {
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const text = XLSX.utils.sheet_to_csv(worksheet);
        if (type === 'bylaws') setTempBylaws(text);
        else setTempMpesa(text);
      };
      reader.readAsBinaryString(file);
    } else {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (type === 'bylaws') setTempBylaws(text);
        else setTempMpesa(text);
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsIntroVisible(false);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: m.parts
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          history,
          bylaws: activeBylaws.trim() ? activeBylaws : undefined,
          mpesa: activeMpesa.trim() ? activeMpesa : undefined,
          lang
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiMessage: Message = { role: 'model', parts: [{ text: data.text }] };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = { 
        role: 'model', 
        parts: [{ text: 'Samahani, nimepata hitilafu. Tafadhali jaribu tena baada ya muda mfupi. (Sorry, I encountered an error. Please try again in a moment.)' }] 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-indigo-600">
              <Scale size={28} />
              <span className="font-bold text-xl tracking-tight">{t.appName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-1 text-xs font-semibold"
                title="Change Language"
              >
                <Languages size={16} />
                <span className="uppercase">{lang === 'sw' ? 'EN' : 'SW'}</span>
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <button 
              onClick={() => {
                saveCurrentSession();
                setMessages([]);
                setIsIntroVisible(true);
                setIsSidebarOpen(false);
                setActiveBylaws('');
                setActiveMpesa('');
              }}
              className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all group"
            >
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <MessageSquare size={18} />
              </div>
              {t.newChat}
            </button>
            <button 
              onClick={() => {
                setTempBylaws(activeBylaws);
                setIsBylawsModalOpen(true);
                setIsSidebarOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all group"
            >
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BookOpen size={18} />
              </div>
              {t.bylaws}
              {activeBylaws && <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"></span>}
            </button>
            <button 
              onClick={() => {
                setTempMpesa(activeMpesa);
                setIsMpesaModalOpen(true);
                setIsSidebarOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all group"
            >
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <PieChart size={18} />
              </div>
              {t.mpesaRecords}
              {activeMpesa && <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"></span>}
            </button>
            <button 
              onClick={() => {
                setIsPastDisputesModalOpen(true);
                setIsSidebarOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all group"
            >
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <History size={18} />
              </div>
              {t.pastDisputes}
              {pastSessions.length > 0 && (
                <span className="ml-auto px-1.5 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-md">
                  {pastSessions.length}
                </span>
              )}
            </button>
          </nav>

          <div className="pt-4 mt-auto border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.dataSecurity}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t.securityDesc}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="font-semibold text-slate-900">{t.arbitratorTitle}</h1>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {t.readyToHelp}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                title={t.search}
             >
                <Search size={20} />
             </button>
             {messages.length > 0 && (
               <button 
                 onClick={saveCurrentSession}
                 className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold hover:bg-emerald-100 transition-colors"
               >
                 <History size={14} />
                 {t.saveCurrent}
               </button>
             )}
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
               <AlertCircle size={14} className="text-indigo-500" />
               {t.mediationStatus}
             </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <AnimatePresence mode="popLayout">
            {isIntroVisible && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl mx-auto py-12 text-center"
              >
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
                  <Scale size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4 px-4">
                  {t.welcome}
                </h2>
                <p className="text-slate-500 mb-8 max-w-lg mx-auto px-6 leading-relaxed">
                  {t.welcomeDesc}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
                  <button 
                    onClick={() => setInput(lang === 'sw' ? "Tuna mwanachama ambaye amelipa kifo cha mzee, lakini anadai hajapata refund ya harusi. Tutumie sheria gani?" : "We have a member who paid for a funeral but claims they haven't received a wedding refund. What rules apply?")}
                    className="p-4 text-left border border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-slate-50 transition-all group"
                  >
                    <p className="text-xs font-semibold text-indigo-600 mb-1 group-hover:translate-x-1 transition-transform">{t.exampleDispute}</p>
                    <p className="text-sm text-slate-600">{lang === 'sw' ? '"Mwanachama ana-claim refund ambayo bylaws hazielezwi vizuri..."' : '"A member is claiming a refund that isn\'t clearly explained in the bylaws..."'}</p>
                  </button>
                  <button 
                    onClick={() => setInput(lang === 'sw' ? "Mwekahazina wetu ameonyesha discrepancy ya 20k kwenye M-Pesa statement. Tafadhali fanya audit." : "Our treasurer has shown a discrepancy of 20k on the M-Pesa statement. Please perform an audit.")}
                    className="p-4 text-left border border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-slate-50 transition-all group"
                  >
                    <p className="text-xs font-semibold text-indigo-600 mb-1 group-hover:translate-x-1 transition-transform">{t.financialAudit}</p>
                    <p className="text-sm text-slate-600">{lang === 'sw' ? '"Tuna wasiwasi na matumizi ya pesa za chama..."' : '"We are concerned about the use of chama funds..."'}</p>
                  </button>
                </div>
              </motion.div>
            )}

            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm
                  ${m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}
                `}>
                  <div className="markdown-body prose prose-sm max-w-none prose-slate">
                    <ReactMarkdown>{m.parts[0].text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-sm text-slate-500 font-medium">{t.thinking}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t.inputPlaceholder}
                className="w-full pl-4 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all min-h-[60px]"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <Plus size={20} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`
                    flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition-all
                    ${!input.trim() || isLoading 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}
                  `}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  <span className="hidden sm:inline">{t.send}</span>
                </button>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 text-center">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </main>

      {/* Bylaws Modal */}
      <AnimatePresence>
        {isBylawsModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBylawsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden shadow-slate-900/20"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{t.bylawsModalTitle}</h3>
                    <p className="text-xs text-slate-500">{t.bylawsModalDesc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBylawsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">{t.bylawsLabel}</label>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-100 transition-colors">
                    <Upload size={14} />
                    {t.uploadFile}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".txt,.csv,.xlsx,.xls"
                      onChange={(e) => handleFileUpload(e, 'bylaws')}
                    />
                  </label>
                </div>
                <textarea
                  value={tempBylaws}
                  onChange={(e) => setTempBylaws(e.target.value)}
                  placeholder={t.bylawsPlaceholder}
                  className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all font-mono text-sm"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <AlertCircle size={14} />
                    {t.bylawsWarning}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsBylawsModalOpen(false)}
                      className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button 
                      onClick={() => {
                        setActiveBylaws(tempBylaws);
                        setIsBylawsModalOpen(false);
                      }}
                      className="px-8 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 transition-all"
                    >
                      {t.saveBylaws}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* M-Pesa Modal */}
      <AnimatePresence>
        {isMpesaModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMpesaModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden shadow-slate-900/20"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <PieChart size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{t.mpesaModalTitle}</h3>
                    <p className="text-xs text-slate-500">{t.mpesaModalDesc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMpesaModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">{t.mpesaLabel}</label>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-100 transition-colors">
                    <Upload size={14} />
                    {t.uploadFile}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".txt,.csv,.xlsx,.xls"
                      onChange={(e) => handleFileUpload(e, 'mpesa')}
                    />
                  </label>
                </div>
                <textarea
                  value={tempMpesa}
                  onChange={(e) => setTempMpesa(e.target.value)}
                  placeholder={t.mpesaPlaceholder}
                  className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all font-mono text-sm"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck size={14} />
                    {t.mpesaWarning}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsMpesaModalOpen(false)}
                      className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button 
                      onClick={() => {
                        setActiveMpesa(tempMpesa);
                        setIsMpesaModalOpen(false);
                      }}
                      className="px-8 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 transition-all"
                    >
                      {t.saveRecords}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[10vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <Search size={20} className="text-slate-400 ml-2" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 placeholder:text-slate-400"
                />
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
                {searchQuery.trim() === '' ? (
                  <div className="py-12 text-center text-slate-400 space-y-3">
                    <Search size={48} className="mx-auto opacity-20" />
                    <p className="text-sm font-medium">{t.searchPlaceholder}</p>
                  </div>
                ) : (
                  <>
                    {/* Chat Results */}
                    {filteredHistory.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <MessageSquare size={14} />
                          {t.newChat} ({filteredHistory.length})
                        </h4>
                        <div className="space-y-2">
                          {filteredHistory.map((m, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group">
                              <p className="text-sm text-slate-600 line-clamp-2 group-hover:text-slate-900 transition-colors">
                                {m.parts[0].text}
                              </p>
                              <div className="mt-2 text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
                                {m.role === 'user' ? 'Member' : 'Arbitrator'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bylaws Results */}
                    {filteredBylaws.length > 0 && searchQuery.length > 2 && (
                      <div className="space-y-3">
                        <h4 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <BookOpen size={14} />
                          {t.bylaws}
                        </h4>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group">
                           <p className="text-sm text-slate-600 line-clamp-3">
                             {activeBylaws}
                           </p>
                        </div>
                      </div>
                    )}

                     {/* M-Pesa Results */}
                     {filteredMpesa.length > 0 && searchQuery.length > 2 && (
                      <div className="space-y-3">
                        <h4 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <PieChart size={14} />
                          {t.mpesaRecords}
                        </h4>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 transition-colors cursor-pointer group">
                           <p className="text-sm text-slate-600 line-clamp-3 font-mono text-xs">
                             {activeMpesa}
                           </p>
                        </div>
                      </div>
                    )}

                    {filteredHistory.length === 0 && filteredBylaws.length === 0 && filteredMpesa.length === 0 && (
                      <div className="py-12 text-center text-slate-400 space-y-3">
                        <AlertCircle size={48} className="mx-auto opacity-20" />
                        <p className="text-sm font-medium">{t.noResults}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Past Disputes Modal */}
      <AnimatePresence>
        {isPastDisputesModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPastDisputesModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden shadow-slate-900/20"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{t.pastDisputes}</h3>
                    <p className="text-xs text-slate-500">Mizozo iliyopita ambayo umehifadhi.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPastDisputesModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
                {pastSessions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-3">
                    <History size={48} className="mx-auto opacity-20" />
                    <p className="text-sm font-medium">{t.noPastDisputes}</p>
                  </div>
                ) : (
                  pastSessions.map((session) => (
                    <div key={session.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all flex items-center justify-between group">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-bold text-slate-900 truncate">{session.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{session.date}</p>
                        <div className="mt-2 flex items-center gap-3">
                          {session.bylaws && <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase leading-none"><BookOpen size={10} /> Bylaws</span>}
                          {session.mpesa && <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase leading-none"><PieChart size={10} /> M-Pesa</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => loadSession(session)}
                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          {t.load}
                        </button>
                        <button 
                          onClick={() => deleteSession(session.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title={t.delete}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
