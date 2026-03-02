import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import SplashScreen from './SplashScreen'; 

interface CipherMeta {
  name: string;
  desc: string;
  rule: string;
  placeholder: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [metaData, setMetaData] = useState<Record<string, CipherMeta> | null>(null);
  const [method, setMethod] = useState('');
  
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visualization, setVisualization] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(true); 
  const [hillSize, setHillSize] = useState(2); 

  const [processId, setProcessId] = useState<number>(0);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileAction, setFileAction] = useState<'encrypt'|'decrypt'>('encrypt');

  const [ocrLoading, setOcrLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');

    html.style.minHeight = '100vh';
    body.style.minHeight = '100vh';
    if (root) {
      root.style.minHeight = '100vh';
      root.style.display = 'flex';
      root.style.flexDirection = 'column';
    }

    if (darkMode) {
      html.classList.add('dark');
      html.style.backgroundColor = '#0f172a'; 
      body.style.backgroundColor = '#0f172a'; 
      body.style.color = '#e2e8f0'; 
    } else {
      html.classList.remove('dark');
      html.style.backgroundColor = '#f8fafc'; 
      body.style.backgroundColor = '#f8fafc'; 
      body.style.color = '#1e293b'; 
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('https://crypto-calculator-lime.vercel.app/api/cipher/meta').then(res => res.json()),
      new Promise(resolve => setTimeout(resolve, 2000)) 
    ])
    .then(([data]) => {
      if (data.status === 'success') {
        setMetaData(data.data);
        handleMethodChange(Object.keys(data.data)[0]); 
      }
      setShowSplash(false); 
    })
    .catch(err => {
      console.error("Gagal memuat metadata:", err);
      setShowSplash(false);
    });
  }, []);

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod); setResult(''); setError(''); setVisualization(null);
    if (newMethod === 'affine') setKey('5,8');
    else if (newMethod === 'enigma') setKey('AAA');
    else if (newMethod === 'hill') setKey(hillSize === 3 ? 'AAAAAAAAA' : 'DDCF');
    else setKey('');
  };

  const generateRandomText = async () => {
    try {
      const res = await fetch('https://crypto-calculator-lime.vercel.app/api/generate/text');
      const data = await res.json();
      if (res.ok) setText(data.result);
    } catch (err) { console.error("Gagal fetch text", err); }
  };

  const generateRandomKey = async () => {
    setKey('Memuat...');
    try {
      const res = await fetch('https://crypto-calculator-lime.vercel.app/api/generate/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, matrixSize: hillSize }),
      });
      const data = await res.json();
      if (res.ok) setKey(data.result);
      else setError(data.error);
    } catch (err) { console.error("Gagal fetch key", err); setKey(''); }
  };

  const handleProcess = async (action: 'encrypt' | 'decrypt') => {
    setLoading(true); setError(''); setResult(''); setVisualization(null);
    try {
      const response = await fetch('https://crypto-calculator-lime.vercel.app/api/cipher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, text, key, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Terjadi kesalahan server');
      
      setResult(data.result);
      setVisualization(data.visualization || null);
      setProcessId(Date.now()); 
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const handleFileProcess = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      setError("Sistem Kriptografi Klasik hanya mendukung file berekstensi .txt!");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLoading(true); setError(''); setResult(''); setVisualization(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('method', method);
    formData.append('key', key);
    formData.append('action', fileAction);

    try {
      const response = await fetch('https://crypto-calculator-lime.vercel.app/api/cipher/file', {
        method: 'POST',
        body: formData, 
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Terjadi kesalahan pemrosesan file di server');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CryptoCalc_${fileAction}_${method}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setResult(`File dokumen berhasil di-${fileAction === 'encrypt' ? 'enkripsi' : 'dekripsi'} dan telah otomatis diunduh!`);
      setProcessId(Date.now()); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageToText = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Format tidak didukung! Harap unggah gambar (.png, .jpg, .jpeg).");
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    setOcrLoading(true); setError(''); setText(''); setResult(''); setVisualization(null);

    const formData = new FormData();
    formData.append('image', file); 

    try {
      const response = await fetch('https://crypto-calculator-lime.vercel.app/api/ocr', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan saat mengekstrak gambar di server');
      
      if (!data.text) {
        setError("Teks tidak terdeteksi pada gambar tersebut.");
      } else {
        setText(data.text);
        setResult('✅ Teks berhasil diekstrak dari gambar oleh Backend!');
        setProcessId(Date.now());
      }
    } catch (err: any) {
      setError("Gagal memproses gambar: " + err.message);
    } finally {
      setOcrLoading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleClear = () => { setText(''); setResult(''); setError(''); setVisualization(null); handleMethodChange(method); };
  const handleSwap = () => { if (result && !result.includes('✅')) { setText(result); setResult(''); setError(''); setVisualization(null); } };

  const activeInfo = metaData && method ? metaData[method] : null;

  const matrixContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const matrixItemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
  };

  const renderDynamicKeyInput = () => {
    if (method === 'affine') {
      const [a = '', b = ''] = key.split(',');
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Multiplier (a)</label>
            <input type="number" value={a} onChange={e => setKey(`${e.target.value},${b}`)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Shift (b)</label>
            <input type="number" value={b} onChange={e => setKey(`${a},${e.target.value}`)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono" />
          </div>
        </motion.div>
      );
    }

    if (method === 'enigma') {
      const r1 = key[0] || 'A'; const r2 = key[1] || 'A'; const r3 = key[2] || 'A';
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex gap-2">
          {[ {label: 'Rotor III (Kiri)', val: r1, idx: 0}, {label: 'Rotor II (Tengah)', val: r2, idx: 1}, {label: 'Rotor I (Kanan)', val: r3, idx: 2} ].map((r, i) => (
            <motion.div key={r.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex-1">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 text-center uppercase tracking-wider">{r.label}</label>
              <select value={r.val} onChange={e => { let newKey = key.split(''); newKey[r.idx] = e.target.value; setKey(newKey.join('')); }} className="w-full px-2 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-center font-bold cursor-pointer">
                {ALPHABET.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    if (method === 'hill') {
      const totalCells = hillSize * hillSize;
      const paddedKey = key.padEnd(totalCells, 'A');
      const updateHill = (index: number, val: string) => {
        let cleanVal = val.toUpperCase().replace(/[^A-Z]/g, '').charAt(0) || 'A';
        let newKey = paddedKey.split(''); newKey[index] = cleanVal; setKey(newKey.join(''));
      };

      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ukuran Matriks</label>
            <select value={hillSize} onChange={e => { const size = parseInt(e.target.value); setHillSize(size); setKey(size === 3 ? 'AAAAAAAAA' : 'DDCF'); }} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-semibold cursor-pointer dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value={2}>2x2 Matrix</option>
              <option value={3}>3x3 Matrix</option>
            </select>
          </div>
          <div className="flex justify-center">
            <motion.div key={`hill-input-${hillSize}`} layout className={`grid gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner ${hillSize === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <AnimatePresence mode="popLayout">
                {Array.from({ length: totalCells }).map((_, i) => (
                  <motion.input 
                    key={i} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    type="text" maxLength={1} value={paddedKey[i] || 'A'} onChange={e => updateHill(i, e.target.value)} 
                    className={`text-center font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all ${hillSize === 3 ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'}`} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.input
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        type="text" value={key} onChange={e => setKey(e.target.value.toUpperCase())} 
        placeholder={activeInfo?.placeholder || "Masukkan parameter kunci..."}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono tracking-wide"
      />
    );
  };

  const getVisualizationCols = (len: number) => {
    if (len === 5) return 'grid-cols-5';
    if (len === 3) return 'grid-cols-3';
    return 'grid-cols-2';
  };

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" />
      ) : (
        <motion.div 
          key={`main-app-${darkMode ? 'dark' : 'light'}`} 
          initial={{ opacity: 0, filter: "blur(5px)" }} 
          animate={{ opacity: 1, filter: "blur(0px)" }} 
          transition={{ duration: 0.5 }}
          className={`${darkMode ? 'dark' : ''} flex flex-col min-h-screen w-full font-sans transition-colors duration-300 relative`}
        >
          <div className="fixed inset-0 bg-[#f8fafc] dark:bg-[#0f172a] -z-50 transition-colors duration-300" />
          <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none z-[-40]"></div>
          <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/20 dark:bg-emerald-600/20 blur-[100px] rounded-full pointer-events-none z-[-40]"></div>

          <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Crypto<span className="text-indigo-600 dark:text-indigo-400">Calc</span>
                </h1>
              </motion.div>
              
              <div className="flex items-center gap-4">
                <a href="https://github.com/batisszz" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" title="Lihat Source Code">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                <motion.button 
                  type="button" 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm"
                  title="Ganti Tema"
                >
                  {darkMode ? '☀️' : '🌙'}
                </motion.button>
              </div>
            </div>
          </header>

          <main className="flex-grow max-w-6xl mx-auto w-full px-4 md:px-8 py-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-5 space-y-6">
              {metaData && method && (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none border border-white dark:border-slate-700 sticky top-28">
                  <h2 className="text-sm font-bold tracking-widest text-indigo-500 dark:text-indigo-400 uppercase mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Info Algoritma
                  </h2>
                  
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={method}
                      initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{activeInfo?.name}</h3>
                        <p className="text-slate-600 dark:text-slate-300 mt-3 leading-relaxed text-base">{activeInfo?.desc}</p>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800/50 mt-6">
                        <h4 className="text-indigo-900 dark:text-indigo-300 font-bold mb-2 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                          Aturan Kunci
                        </h4>
                        <p className="text-indigo-800 dark:text-indigo-200/90 text-sm leading-relaxed">{activeInfo?.rule}</p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

            <motion.div layout className="lg:col-span-7 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-white dark:border-slate-700 p-6 md:p-8">
              {metaData && method && (
                <div className="space-y-7">
                  <div className="relative z-50" ref={dropdownRef}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pilih Algoritma Cipher</label>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 flex justify-between items-center transition-all shadow-inner"
                    >
                      <span className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                        </div>
                        {activeInfo?.name}
                      </span>
                      <motion.svg animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></motion.svg>
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[999] origin-top"
                        >
                          {Object.keys(metaData).map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => { handleMethodChange(key); setIsDropdownOpen(false); }}
                              className={`w-full text-left px-5 py-4 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 ${method === key ? 'bg-indigo-50/50 dark:bg-slate-700/30 text-indigo-700 dark:text-indigo-400 font-bold border-l-4 border-indigo-500' : 'text-slate-700 dark:text-slate-300 font-medium border-l-4 border-transparent'}`}
                            >
                              <div className={`w-2 h-2 rounded-full ${method === key ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                              {metaData[key].name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Teks (Plaintext / Ciphertext)</label>
                      <div className="flex gap-2">
                        <button onClick={generateRandomText} className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-emerald-900/30 rounded-lg transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800">
                          🎲 Acak
                        </button>
                        <button onClick={handleSwap} disabled={!result || result.includes('✅')} className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-900 disabled:hover:border-transparent border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800">
                          🔄 Tukar
                        </button>
                        <button onClick={handleClear} disabled={!text && !key && !result && !error} className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-900 disabled:hover:border-transparent border border-transparent hover:border-red-200 dark:hover:border-red-800">
                          🗑️ Bersih
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <textarea 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        rows={5} 
                        placeholder="Masukkan teks rahasia di sini..." 
                        className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none shadow-inner" 
                      />

                      <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageToText} className="hidden" />
                      <motion.button 
                        type="button" 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => imageInputRef.current?.click()} 
                        disabled={ocrLoading}
                        title="Ekstrak teks dari Gambar (OCR)"
                        className={`absolute bottom-4 right-4 p-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center
                          ${ocrLoading ? 'bg-slate-200 text-slate-500 cursor-wait dark:bg-slate-800 dark:text-slate-500' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-400 dark:hover:bg-indigo-800'}`
                        }
                      >
                        {ocrLoading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
                        ) : (
                        
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  <div className="min-h-[100px]">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Parameter Kunci</label>
                      <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateRandomKey} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 shadow-sm">✨ Generate Kunci Valid</motion.button>
                    </div>
                    <AnimatePresence mode="popLayout">
                      <motion.div key={method} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                        {renderDynamicKeyInput()}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-xl overflow-hidden shadow-sm">
                        <p className="text-sm text-red-800 dark:text-red-300 font-medium leading-relaxed">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-4 pt-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleProcess('encrypt')} disabled={loading || !text || !key} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/30 dark:shadow-none disabled:opacity-50 flex justify-center items-center gap-2">
                        {loading ? 'Memproses...' : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Enkripsi Teks</>}
                      </motion.button>
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleProcess('decrypt')} disabled={loading || !text || !key} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/30 dark:shadow-none disabled:opacity-50 flex justify-center items-center gap-2">
                        {loading ? 'Memproses...' : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg> Dekripsi Teks</>}
                      </motion.button>
                    </div>
                    
                    <div className="flex items-center gap-4 py-2 opacity-60">
                      <div className="h-px bg-slate-300 dark:bg-slate-600 flex-1"></div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Atau Gunakan File .txt</span>
                      <div className="h-px bg-slate-300 dark:bg-slate-600 flex-1"></div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <input type="file" accept=".txt" ref={fileInputRef} onChange={handleFileProcess} className="hidden" />
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setFileAction('encrypt'); fileInputRef.current?.click(); }} disabled={loading || !key} className="flex-1 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-semibold py-3.5 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Enkripsi File
                      </motion.button>
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setFileAction('decrypt'); fileInputRef.current?.click(); }} disabled={loading || !key} className="flex-1 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold py-3.5 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Dekripsi File
                      </motion.button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {result && (
                      <motion.div key={`result-${processId}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Hasil Akhir</label>
                        <div className="relative group">
                          <div className="w-full p-6 bg-slate-900 text-emerald-400 font-mono text-lg rounded-2xl break-all shadow-inner border border-slate-800 tracking-wider">
                            {result}
                          </div>
                          {!result.includes('✅') && (
                            <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigator.clipboard.writeText(result)} className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {visualization && visualization.type === 'matrix' && (
                      <motion.div key={`viz-${processId}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", bounce: 0.4 }} className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-5 text-center">✨ Visualisasi: {visualization.title}</label>
                        <div className="flex justify-center">
                          <motion.div variants={matrixContainerVariants} initial="hidden" animate="show" className={`grid gap-3 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner ${getVisualizationCols(visualization.data.length)}`}>
                            {visualization.data.map((row: any[], i: number) => (
                              row.map((cell: any, j: number) => (
                                <motion.div variants={matrixItemVariants} key={`cell-${i}-${j}`} className="w-14 h-14 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-indigo-600 dark:text-indigo-400 font-extrabold font-mono text-2xl border border-slate-200 dark:border-slate-600 cursor-default">
                                  {cell}
                                </motion.div>
                              ))
                            ))}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </main>

          <footer className="mt-auto relative z-10 border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                © 2026 Crypto<span className="text-indigo-500">Calc</span>. All rights reserved.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm flex items-center gap-1.5">
                <span className="animate-pulse">Dibuat oleh Batis Satriani Omar Ramadhan</span>
              </p>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;