
import React, { useState, useRef } from 'react';
import { generateRapBlueprint } from './services/geminiService';
import { RapBlueprint, GenerationState } from './types';
import { LoadingOverlay } from './components/LoadingOverlay';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [inputContent, setInputContent] = useState('');
  const [sceneCount, setSceneCount] = useState(3);
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    statusMessage: 'CHUẨN BỊ STUDIO...',
    error: null,
    result: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !inputContent.trim()) {
      setState(prev => ({ ...prev, error: "Vui lòng cung cấp ảnh và ý chính." }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, statusMessage: 'ĐANG PHÂN TÍCH...', error: null }));

    try {
      const blueprint = await generateRapBlueprint(
        image, 
        inputContent, 
        sceneCount, 
        (msg) => setState(prev => ({ ...prev, statusMessage: msg }))
      );
      setState(prev => ({ ...prev, isGenerating: false, result: blueprint }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isGenerating: false, error: "Lỗi kết nối AI. Hãy thử lại." }));
    }
  };

  const downloadAllImages = async () => {
    if (!state.result) return;
    for (let i = 0; i < state.result.script.length; i++) {
      const scene = state.result.script[i];
      if (scene.imageUrl) {
        const link = document.createElement('a');
        link.href = scene.imageUrl;
        link.download = `${i + 1}_RapScene.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise(r => setTimeout(r, 400));
      }
    }
  };

  const downloadFullScript = () => {
    if (!state.result) return;
    let content = `RAP SCRIPT AI - ${state.result.videoTitle}\n`;
    content += `BEAT: ${state.result.beatDescription}\n`;
    content += `HASHTAGS: ${state.result.hashtags.join(' ')}\n\n`;
    
    state.result.script.forEach((scene, i) => {
      // Định dạng yêu cầu: Prompt "Lyrics"
      content += `${scene.visualPrompt} "${scene.lyrics}"\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Full_Script_${state.result.videoTitle.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setState({ isGenerating: false, statusMessage: '', error: null, result: null });
    setInputContent('');
    setImage(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-500/30">
      {state.isGenerating && <LoadingOverlay message={state.statusMessage} />}

      <header className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <h1 className="text-2xl font-heading tracking-tighter text-yellow-500 flex items-center gap-2">
          <span className="bg-yellow-500 text-black px-2 py-0.5 rounded">RAP</span> SCRIPT AI
        </h1>
        {state.result && (
          <button onClick={reset} className="text-[10px] uppercase tracking-widest border border-white/20 px-6 py-2 rounded-full hover:bg-yellow-500 hover:text-black transition-all font-bold">
            TẠO KỊCH BẢN MỚI
          </button>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {!state.result ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-xs">Cinematic Storyboard Architect</span>
                <h2 className="text-5xl md:text-8xl font-heading uppercase leading-[0.85] tracking-tighter">
                  TỪ Ý TƯỞNG TỚI<br />
                  <span className="text-yellow-500">SIÊU PHẨM</span>.<br />
                  RAP <span className="underline decoration-red-600 underline-offset-8">CHUYÊN NGHIỆP</span>.
                </h2>
                <p className="text-gray-400 text-xl font-light">
                  AI sẽ tự động cân đối số lượng cảnh và lời rap dựa trên độ sâu ý tưởng của bạn.
                </p>
              </div>

              <div className="space-y-8 max-w-md">
                <div onClick={() => fileInputRef.current?.click()} className={`relative aspect-video border-2 border-dashed rounded-3xl cursor-pointer transition-all flex items-center justify-center overflow-hidden group ${image ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.1)]' : 'border-white/10 hover:border-yellow-500/50 bg-white/5'}`}>
                  {image ? <img src={image} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="Face" /> : <span className="font-bold uppercase tracking-widest text-xs">Tải Ảnh Mặt (Reference)</span>}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} />
                </div>

                <div className="space-y-2">
                  <textarea 
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="Nhập ý chính, câu chuyện hoặc một lời nhận xét sâu sắc..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-32 focus:ring-2 focus:ring-yellow-500 text-lg transition-all"
                  />
                </div>

                <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <span>Số cảnh dự kiến</span>
                    <span className="text-yellow-500">{sceneCount} Cảnh</span>
                  </div>
                  <input 
                    type="range" min="1" max="15" step="1" 
                    value={sceneCount} onChange={(e) => setSceneCount(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <p className="text-[9px] text-gray-600 uppercase italic">* AI có thể tự động thay đổi số cảnh để hợp lý nhất.</p>
                </div>

                <button onClick={handleGenerate} className="w-full py-5 rounded-2xl font-heading text-4xl uppercase tracking-widest bg-yellow-500 text-black hover:scale-[1.02] transition-all shadow-xl">
                  BẮT ĐẦU SÁNG TÁC
                </button>
                {state.error && <p className="text-red-500 text-center text-xs font-bold uppercase tracking-widest">{state.error}</p>}
              </div>
            </div>
            
            <div className="hidden lg:flex flex-col gap-6 opacity-5">
               <div className="w-64 h-96 border-4 border-white rounded-[3rem] rotate-6"></div>
               <div className="w-64 h-96 border-4 border-white rounded-[3rem] -rotate-6 self-end"></div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 pb-24">
            <div className="text-center space-y-6 max-w-3xl mx-auto border-b border-white/10 pb-12">
               <div className="inline-block px-4 py-1 bg-red-600 text-[10px] font-black uppercase italic tracking-widest mb-4">PRODUCTION READY</div>
               <h2 className="text-6xl md:text-8xl font-heading text-white uppercase leading-none">{state.result.videoTitle}</h2>
               <p className="text-gray-400 text-lg font-light italic">"{state.result.videoDescription}"</p>
               
               <div className="flex flex-wrap justify-center gap-4 pt-8">
                  <button 
                    onClick={downloadAllImages}
                    className="group flex items-center gap-3 bg-yellow-500 text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Tải Tất Cả Ảnh (1 - {state.result.script.length})
                  </button>
                  <button 
                    onClick={downloadFullScript}
                    className="flex items-center gap-3 bg-white/10 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Tải Toàn Bộ Kịch Bản (.TXT)
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {state.result.script.map((scene, i) => (
                 <div key={i} className="group flex flex-col space-y-4">
                    <div className="relative aspect-[9/16] rounded-[3rem] overflow-hidden bg-black border border-white/10 group-hover:border-yellow-500 transition-all shadow-2xl">
                       {scene.imageUrl ? (
                         <img src={scene.imageUrl} className="w-full h-full object-cover" alt={`Scene ${i+1}`} />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center opacity-20">
                            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="font-heading text-2xl uppercase">Render Pending</span>
                         </div>
                       )}
                       
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                       
                       <div className="absolute top-8 left-8 right-8 flex justify-between">
                          <span className="bg-yellow-500 text-black px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter">PHẦN {i+1}</span>
                          <span className="text-[10px] font-mono font-bold text-gray-400">{scene.time}</span>
                       </div>
                       
                       <div className="absolute bottom-10 left-10 right-10 space-y-6">
                          <div className="space-y-2">
                             <span className="text-[9px] font-bold text-red-600 uppercase tracking-[0.3em]">Lyrics</span>
                             <p className="text-2xl md:text-3xl font-heading text-white leading-[0.9] glow-gold">"{scene.lyrics}"</p>
                          </div>
                          
                          <div className="pt-6 border-t border-white/10 space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                             <span className="text-[9px] font-bold text-yellow-500/50 uppercase tracking-[0.3em]">Veo 3 Direction</span>
                             <p className="text-[10px] text-gray-400 font-mono leading-relaxed italic line-clamp-4">
                                {scene.visualPrompt}
                             </p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="px-6 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                       <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{scene.setting}</h4>
                       <button 
                         onClick={() => {
                            navigator.clipboard.writeText(`${scene.visualPrompt} "${scene.lyrics}"`);
                         }}
                         className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest hover:underline"
                       >
                         Sao chép cảnh {i+1}
                       </button>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="flex flex-col items-center pt-24 gap-12">
               <div className="h-px w-32 bg-white/10"></div>
               <button onClick={reset} className="px-16 py-5 bg-white text-black font-bold uppercase tracking-[0.4em] rounded-full hover:bg-yellow-500 transition-all text-xs shadow-2xl">
                  BẮT ĐẦU DỰ ÁN MỚI
               </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-16 text-center text-gray-800 uppercase tracking-[1.5em] text-[8px] font-bold opacity-30">
        RAP SCRIPT AI STUDIO // PROFESSIONAL CINEMATIC ARCHITECT
      </footer>
    </div>
  );
};

export default App;
