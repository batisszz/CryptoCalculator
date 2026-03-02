import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }} 
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f172a] text-white overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
        className="flex items-center gap-4 mb-8 relative z-10"
      >
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-300/30"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Crypto<span className="text-indigo-500">Calc</span>
        </h1>
      </motion.div>

      <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden relative z-10">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-indigo-600 to-emerald-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-5 text-slate-400 text-sm font-medium tracking-widest uppercase animate-pulse relative z-10"
      >
        Memuat Enkripsi Klasik...
      </motion.p>
    </motion.div>
  );
}