
import React, { useState } from 'react';
import { TransactionType, PaymentMethod, Category, TransactionDetail } from '../types';
import { ChevronDown, Calendar, CreditCard, Wallet, Banknote, Sparkles, Loader2, ListChecks } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface Props {
  categories: Category[];
  onAdd: (t: any) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<Props> = ({ categories, onAdd, onCancel }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [detailsText, setDetailsText] = useState('');
  const [isProcessingIA, setIsProcessingIA] = useState(false);
  const [showDetailsInput, setShowDetailsInput] = useState(false);
  
  const currentCategories = categories.filter(c => c.type === type);
  const [category, setCategory] = useState(currentCategories[0]?.name || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEBIT);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const processDetailsWithIA = async () => {
    if (!detailsText.trim()) return null;
    
    setIsProcessingIA(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise o seguinte texto de gastos e retorne uma lista JSON de itens. O texto é: "${detailsText}". Extraia nome do item, valor numérico e quantidade se houver.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                quantity: { type: Type.STRING }
              },
              required: ["item", "amount"]
            }
          }
        }
      });
      
      const parsedDetails: TransactionDetail[] = JSON.parse(response.text);
      return parsedDetails;
    } catch (error) {
      console.error("Erro ao processar detalhes com IA:", error);
      return null;
    } finally {
      setIsProcessingIA(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    let finalDetails = null;
    if (showDetailsInput && detailsText) {
      finalDetails = await processDetailsWithIA();
    }

    onAdd({
      amount: parseFloat(amount),
      description,
      category,
      type,
      date,
      paymentMethod,
      isRecurrent: false,
      details: finalDetails || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem]">
        <button 
          type="button"
          onClick={() => { 
            setType(TransactionType.EXPENSE); 
            const expCats = categories.filter(c => c.type === TransactionType.EXPENSE);
            setCategory(expCats[0]?.name || '');
          }}
          className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}
        >
          Despesa
        </button>
        <button 
          type="button"
          onClick={() => { 
            setType(TransactionType.INCOME); 
            const incCats = categories.filter(c => c.type === TransactionType.INCOME);
            setCategory(incCats[0]?.name || '');
          }}
          className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all ${type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
        >
          Receita
        </button>
      </div>

      <div className="text-center py-4">
        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">Valor Total</span>
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">R$</span>
          <input 
            type="number" 
            autoFocus
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-5xl font-bold text-slate-800 dark:text-white bg-transparent border-none outline-none w-56 text-center placeholder:text-slate-200 dark:placeholder:text-slate-800"
          />
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 px-1">O que foi comprado?</label>
          <input 
            type="text" 
            placeholder="Ex: Supermercado"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-colors text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 px-1">Categoria</label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none appearance-none font-bold text-slate-700 dark:text-slate-200 text-sm"
              >
                {currentCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 px-1">Data</label>
            <div className="relative">
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none font-bold text-slate-700 dark:text-slate-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Detalhar Mais Toggle */}
        <div className="space-y-3">
          <button 
            type="button"
            onClick={() => setShowDetailsInput(!showDetailsInput)}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-2xl border transition-all ${showDetailsInput ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-emerald-500/50'}`}
          >
            {showDetailsInput ? <ListChecks size={14} /> : <Sparkles size={14} />}
            {showDetailsInput ? 'Esconder Detalhes' : 'Detalhar Mais (IA)'}
          </button>
          
          {showDetailsInput && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4">
                <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">O que você comprou?</p>
                <textarea 
                  placeholder="Ex: 5 reais de banana, 30 de frango, 20 de ovos..."
                  value={detailsText}
                  onChange={(e) => setDetailsText(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100 min-h-[120px] resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 px-1">
                Nossa IA inteligente irá organizar cada item automaticamente no seu extrato.
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 px-1">Método</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: PaymentMethod.DEBIT, label: 'Débito', icon: <Wallet size={16} /> },
              { id: PaymentMethod.CREDIT, label: 'Crédito', icon: <CreditCard size={16} /> },
              { id: PaymentMethod.CASH, label: 'Dinheiro', icon: <Banknote size={16} /> },
            ].map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${paymentMethod === method.id ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600'}`}
              >
                {method.icon}
                <span className="text-[10px] font-bold uppercase">{method.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 font-bold text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
        >
          Voltar
        </button>
        <button 
          type="submit"
          disabled={isProcessingIA}
          className={`flex-[2] text-white font-bold py-4 rounded-3xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${type === TransactionType.EXPENSE ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'} disabled:opacity-70`}
        >
          {isProcessingIA ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processando IA...
            </>
          ) : (
            `Confirmar ${type === TransactionType.EXPENSE ? 'Gasto' : 'Ganho'}`
          )}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
