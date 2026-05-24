import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle2, 
  BarChart2, 
  Plus, 
  Trash2, 
  Play, 
  FileText, 
  Upload, 
  CheckCircle, 
  ChevronRight, 
  AlertCircle,
  ThumbsUp,
  Activity,
  Heart,
  QrCode,
  Sparkles,
  Zap,
  Shield,
  Send,
  ArrowRight,
  ArrowRightCircle,
  AlertTriangle,
  Users,
  Star
} from 'lucide-react';
import { INITIAL_CHECKLISTS, INVESTIGASI_SOURCES } from '../constants';
import { TableRow, StudentAnswers } from '../types';
import { cn } from '../lib/utils';

interface PBLStepsProps {
  currentStep: number;
  answers: StudentAnswers;
  onChange: (updatedAnswers: StudentAnswers) => void;
  isAutosaving: boolean;
}

export const PBLSteps: React.FC<PBLStepsProps> = ({
  currentStep,
  answers,
  onChange,
  isAutosaving,
}) => {

  // State for Poster in-app previewer
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [activePin, setActivePin] = useState<string | null>("pin-1");

  // State for Step 3 in-app media viewer (Poster and Komik)
  const [activeInvestigasiTab, setActiveInvestigasiTab] = useState<"poster" | "komik">("poster");
  const [step3Zoom, setStep3Zoom] = useState<number>(100);
  const [isStep3LightboxOpen, setIsStep3LightboxOpen] = useState<boolean>(false);
  const [step3Annotation, setStep3Annotation] = useState<string>("pt-1");

  // State for marked important causes in Step 1
  const [importantCauses, setImportantCauses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pbl_marked_causes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State for Add Custom Reference Form in Step 3
  const [refTitle, setRefTitle] = useState("");
  const [refType, setRefType] = useState("Situs Web Resmi");
  const [refDesc, setRefDesc] = useState("");
  const [refUrl, setRefUrl] = useState("");

  const addCustomReference = (title: string, type: string, desc: string, url: string) => {
    if (!title.trim()) return;
    const newRef = {
      id: `ref-${Date.now()}`,
      title: title.trim(),
      type: type,
      desc: desc.trim() || "Tidak ada rincian kutipan fakta.",
      url: url.trim() || "#"
    };
    const currentRefs = answers.penyelidikan.customReferences || [];
    onChange({
      ...answers,
      penyelidikan: {
        ...answers.penyelidikan,
        customReferences: [...currentRefs, newRef]
      }
    });
  };

  const deleteCustomReference = (id: string) => {
    const currentRefs = answers.penyelidikan.customReferences || [];
    onChange({
      ...answers,
      penyelidikan: {
        ...answers.penyelidikan,
        customReferences: currentRefs.filter(r => r.id !== id)
      }
    });
  };

  const handleToggleCause = (cause: string) => {
    const updated = importantCauses.includes(cause)
      ? importantCauses.filter(c => c !== cause)
      : [...importantCauses, cause];
    setImportantCauses(updated);
    try {
      localStorage.setItem('pbl_marked_causes', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Step 2 custom helpers
  const handleToggleChecklist = (text: string) => {
    const list = answers.organisasi.selectedChecklists || [];
    const updated = list.includes(text)
      ? list.filter(t => t !== text)
      : [...list, text];
    
    onChange({
      ...answers,
      organisasi: {
        ...answers.organisasi,
        selectedChecklists: updated
      }
    });
  };

  const moveToCategory = (item: string, category: 'alami' | 'manusia') => {
    const alami = answers.organisasi.faktorAlami || [];
    const manusia = answers.organisasi.faktorManusia || [];

    // remove from both first
    const cleanAlami = alami.filter(x => x !== item);
    const cleanManusia = manusia.filter(x => x !== item);

    if (category === 'alami') {
      onChange({
        ...answers,
        organisasi: {
          ...answers.organisasi,
          faktorAlami: [...cleanAlami, item],
          faktorManusia: cleanManusia
        }
      });
    } else {
      onChange({
        ...answers,
        organisasi: {
          ...answers.organisasi,
          faktorAlami: cleanAlami,
          faktorManusia: [...cleanManusia, item]
        }
      });
    }
  };

  const removeFromSorting = (item: string) => {
    onChange({
      ...answers,
      organisasi: {
        ...answers.organisasi,
        faktorAlami: (answers.organisasi.faktorAlami || []).filter(x => x !== item),
        faktorManusia: (answers.organisasi.faktorManusia || []).filter(x => x !== item)
      }
    });
  };

  // Step 3 custom table helpers
  const handleTableRowChange = (id: string, field: keyof TableRow, val: string) => {
    const rows = answers.penyelidikan.tableRows.map(row => {
      if (row.id === id) {
        return { ...row, [field]: val };
      }
      return row;
    });
    onChange({
      ...answers,
      penyelidikan: {
        ...answers.penyelidikan,
        tableRows: rows
      }
    });
  };

  const addTableRow = () => {
    const newRow: TableRow = {
      id: `row-${Date.now()}`,
      info: "",
      sumber: "",
      fakta: "",
      hubungan: ""
    };
    onChange({
      ...answers,
      penyelidikan: {
        ...answers.penyelidikan,
        tableRows: [...answers.penyelidikan.tableRows, newRow]
      }
    });
  };

  const deleteTableRow = (id: string) => {
    if (answers.penyelidikan.tableRows.length <= 1) return; // keep at least 1
    onChange({
      ...answers,
      penyelidikan: {
        ...answers.penyelidikan,
        tableRows: answers.penyelidikan.tableRows.filter(r => r.id !== id)
      }
    });
  };

  // Step 4 helpers
  const handleMediaToggle = (media: string) => {
    const list = answers.solusi.mediaPresentasi || [];
    const updated = list.includes(media)
      ? list.filter(m => m !== media)
      : [...list, media];
    onChange({
      ...answers,
      solusi: {
        ...answers.solusi,
        mediaPresentasi: updated
      }
    });
  };

  const simulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onChange({
        ...answers,
        solusi: {
          ...answers.solusi,
          uploadedFileName: file.name,
          uploadedFileUrl: URL.createObjectURL(file)
        }
      });
    }
  };

  // Step 5 scorers
  const updateScore = (field: 'kelayakan' | 'efektivitas' | 'dampakPositif' | 'keberlanjutan', val: number) => {
    onChange({
      ...answers,
      evaluasi: {
        ...answers.evaluasi,
        [field]: val
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Step 1: Orientasi Masalah */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Cerita Kasus Nyata Banjir Aceh */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-sky-400 text-white rounded-full p-2">
                <AlertCircle size={24} />
              </span>
              <h2 className="text-xl font-bold text-sky-900 font-sans">
                Orientasi Masalah: Banjir Luapan Aceh Tenggara & Aceh Barat
              </h2>
            </div>
            
            <p className="text-slate-700 leading-relaxed font-sans text-sm md:text-base mb-4">
              Hujan deras berintensitas tinggi mengguyur wilayah Provinsi Aceh selama dua hari berturut-turut. Akibatnya, debit air sungai utama terus meluap hingga menjebol tanggul darurat. Rumah warga di dataran rendah terendam banjir hingga setinggi dada orang dewasa, merusak perabotan, dan melumpuhkan aktivitas perkantoran dan sekolah.
            </p>
            <p className="text-slate-700 leading-relaxed font-sans text-sm md:text-base mb-4">
              Saluran drainase perkotaan tampak tersumbat oleh tumpukan sampah plastik dan endapan lumpur tebal. Banyak warga menjadi panik, mengungsi seadanya di atap rumah karena belum pernah mendapatkan sosialisasi jalur evakuasi bencana dari pejabat terkait. Kurangnya daerah resapan air memperparah genangan di jalan raya.
            </p>

            {/* Pemutar Video Orientasi YouTube */}
            <div className="bg-white border-2 border-sky-200 rounded-[1.8rem] p-4 md:p-5 shadow-inner my-5">
              <div className="flex items-center justify-between mb-3 font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📹</span>
                  <span className="text-xs font-black text-sky-800 tracking-wide uppercase font-mono">
                    Video Orientasi Masalah Kebencanaan
                  </span>
                </div>
                <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Media Utama
                </span>
              </div>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/9MX3mZdArkw"
                  title="Video Orientasi Masalah Kebencanaan - Banjir & Longsor"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <p className="text-[11px] text-slate-500 mt-3 text-center leading-normal font-sans font-semibold">
                Saksikan video di atas secara saksama bersama kelompok belajar Anda sebelum mendiskusikan 3 pertanyaan utama di bawah ini.
              </p>
            </div>
          </div>

          {/* Kolom Pertanyaan */}
          <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-amber-500" />
              Pertanyaan Analisis Kelompok
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  1. Berdasarkan berita di atas, apa masalah utama yang sedang terjadi di wilayah Aceh?
                </label>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-[1.2rem] p-4 text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none transition-all text-sm h-28"
                  placeholder="Tuliskan analisis kelompok mengenai masalah utama..."
                  value={answers.orientasi.masalahUtama}
                  onChange={(e) => onChange({
                    ...answers,
                    orientasi: { ...answers.orientasi, masalahUtama: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  2. Apa saja faktor-faktor penyebab terjadinya bencana banjir luapan tersebut?
                </label>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-[1.2rem] p-4 text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none transition-all text-sm h-28"
                  placeholder="Sebutkan penyebab bencana baik alami maupun aktivitas sosial manusia..."
                  value={answers.orientasi.penyebab}
                  onChange={(e) => onChange({
                    ...answers,
                    orientasi: { ...answers.orientasi, penyebab: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  3. Mengapa warga menjadi sangat panik saat air bah datang? Apa bahayanya jika jalur evakuasi tidak dipersiapkan dahulu?
                </label>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-[1.2rem] p-4 text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none transition-all text-sm h-28"
                  placeholder="Diskusikan dampak negatif & urgensi persiapan evakuasi bencana..."
                  value={answers.orientasi.dampak}
                  onChange={(e) => onChange({
                    ...answers,
                    orientasi: { ...answers.orientasi, dampak: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Kotak Motivasi */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-[1.8rem] p-5 flex gap-4 items-start shadow-sm">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-bold text-amber-900 text-sm md:text-base">Misi Berpikir Kritis Kelompok</h4>
              <p className="text-xs md:text-sm text-amber-800 mt-1 leading-relaxed">
                "Anak-anak hebat kelas VIII, bencana dapat kita minimalkan dampaknya jika kita belajar mengenali bumi dan mendesain taktik kesiapsiagaan! Semangat menyelidiki solusi bersama kelompok tercintamu!"
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Mengorganisasi Peserta Didik */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Petunjuk checklist */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2 mb-2 font-sans">
              <CheckCircle2 className="text-emerald-600" />
              Langkah 2: Mengorganisasi Fakta Masalah
            </h2>
            <p className="text-xs md:text-sm text-emerald-800 font-sans leading-relaxed">
              Siswa diminta menandai informasi penting yang ditemukan dalam bencana banjir dan longsor di Aceh dari daftar di bawah. Setelah itu, kelompokkan informasi tersebut ke dalam kategori <strong>Faktor Alami (Proses Bumi)</strong> atau <strong>Faktor Manusia (Aktivitas Sosial)</strong>.
            </p>
          </div>

          {/* Area Tandai Faktor Penting Penyebab Bencana */}
          <div className="bg-amber-50/50 border-2 border-amber-200 rounded-[1.8rem] p-5 space-y-3 font-sans shadow-sm">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500 text-white rounded-lg text-xs leading-none">
                <Sparkles size={14} />
              </span>
              <div>
                <h4 className="font-extrabold text-xs md:text-sm text-amber-950">
                  ⚡ Aktivitas Belajar: Tandai Faktor Penting Penyebab Bencana
                </h4>
                <p className="text-[10px] text-amber-800 font-semibold">
                  Klik item berikut untuk menandai dan mengekstrak faktor utama penyebab bencana banjir/longsor di Aceh:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { id: "p1", text: "Pembangunan rumah dan pabrik di dekat sungai", icon: "🏢" },
                { id: "p2", text: "Drainase tidak berfungsi", icon: "🚱" },
                { id: "p3", text: "Sungai menguap", icon: "🌊" }
              ].map((item) => {
                const isSelected = importantCauses.includes(item.text);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggleCause(item.text)}
                    className={cn(
                      "p-3.5 rounded-2xl border-2 text-left transition-all duration-200 flex items-start gap-2.5 cursor-pointer relative overflow-hidden",
                      isSelected 
                        ? "bg-amber-100/60 border-amber-400 shadow-sm hover:scale-[1.01]" 
                        : "bg-white border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/10"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all text-[10px]",
                      isSelected ? "bg-amber-500 border-amber-500 text-white font-bold" : "border-slate-300 bg-white"
                    )}>
                      {isSelected && "✓"}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-black tracking-wide text-slate-800 leading-tight block">
                        {item.icon} {item.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {importantCauses.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end pt-1">
                <button
                  onClick={() => {
                    const currentSelected = answers.organisasi.selectedChecklists || [];
                    const toAdd = importantCauses.filter(c => !currentSelected.includes(c));
                    if (toAdd.length > 0) {
                      onChange({
                        ...answers,
                        organisasi: {
                          ...answers.organisasi,
                          selectedChecklists: [...currentSelected, ...toAdd]
                        }
                      });
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 animate-pulse"
                >
                  <span>Sematkan ke Klasifikasi di Bawah (Dapat Disortir)</span>
                  <ArrowRight size={12} />
                </button>

                <button
                  onClick={() => {
                    const currentText = answers.organisasi.diskusiLanjutan || "";
                    const listItems = importantCauses.map(c => `• ${c}`).join("\n");
                    const appendText = currentText 
                      ? `${currentText}\n\n[Faktor Penting Terdeteksi]:\n${listItems}`
                      : `[Faktor Penting Terdeteksi]:\n${listItems}`;
                    
                    onChange({
                      ...answers,
                      organisasi: { ...answers.organisasi, diskusiLanjutan: appendText }
                    });
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95"
                >
                  <span>Salin ke Diskusi Kelompok (Kolom Bawah)</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Checklist Card Interaktif */}
          <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Zap className="text-amber-400 fill-amber-300" />
              Tandai Fakta Penting Penyebab Bencana
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INITIAL_CHECKLISTS.map((fact) => {
                const isChecked = (answers.organisasi.selectedChecklists || []).includes(fact.text);
                return (
                  <button
                    key={fact.id}
                    onClick={() => handleToggleChecklist(fact.text)}
                    className={cn(
                      "p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-start gap-3 text-sm font-sans font-medium hover:scale-[1.01] hover:shadow-sm cursor-pointer",
                      isChecked 
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-md shadow-emerald-50" 
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all",
                      isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                    )}>
                      {isChecked && <CheckCircle size={14} className="stroke-[3]" />}
                    </span>
                    <span>{fact.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Klasifikasi Penyebab (Faktor Alami vs Manusia) */}
          <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-6">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <BarChart2 className="text-indigo-500" />
              Klasifikasi Penyebab Bencana di Aceh
            </h3>

            {/* Sumber item yang belum diklasifikasi */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
                Fakta Terpilih (Kliping) untuk Diklasifikasi:
              </h4>
              <div className="flex flex-wrap gap-2">
                {(answers.organisasi.selectedChecklists || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Silakan centang fakta penting pada kartu di atas untuk memindahkan mereka ke dalam keranjang klasifikasi.</p>
                ) : (
                  (answers.organisasi.selectedChecklists || []).map((item) => {
                    const isSorted = (answers.organisasi.faktorAlami || []).includes(item) || 
                                     (answers.organisasi.faktorManusia || []).includes(item);
                    if (isSorted) return null;
                    return (
                      <motion.div
                        layoutId={`sort-${item}`}
                        key={item}
                        className="bg-white border border-slate-300 rounded-xl p-3 shadow-xs text-xs font-semibold text-slate-700 flex flex-col gap-2 max-w-sm"
                      >
                        <span>{item}</span>
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => moveToCategory(item, 'alami')}
                            className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] uppercase font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            🏞️ Faktor Alami
                          </button>
                          <button
                            onClick={() => moveToCategory(item, 'manusia')}
                            className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 text-[10px] uppercase font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            🧑‍🤝‍🧑 Faktor Manusia
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Dua Basket Kliping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Keranjang Faktor Alami */}
              <div className="bg-sky-50/50 border-2 border-dashed border-sky-200 rounded-2xl p-5 space-y-3 min-h-[160px]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏞️</span>
                  <h4 className="font-bold text-sky-900 text-sm">Faktor Genesa Alami (Struktur Bumi)</h4>
                </div>
                <div className="space-y-2">
                  {(answers.organisasi.faktorAlami || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada item dipindahkan ke sini.</p>
                  ) : (
                    (answers.organisasi.faktorAlami || []).map((item) => (
                      <motion.div
                        layoutId={`sort-${item}`}
                        key={item}
                        className="bg-white border border-sky-300 rounded-xl p-3 shadow-sm text-xs text-slate-700 flex justify-between items-center font-medium"
                      >
                        <span>{item}</span>
                        <button 
                          onClick={() => removeFromSorting(item)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Keranjang Faktor Manusia */}
              <div className="bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-2xl p-5 space-y-3 min-h-[160px]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧑‍🏭</span>
                  <h4 className="font-bold text-orange-900 text-sm">Faktor Aktivitas Manusia (Sosial)</h4>
                </div>
                <div className="space-y-2">
                  {(answers.organisasi.faktorManusia || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada aduan dipindahkan ke sini.</p>
                  ) : (
                    (answers.organisasi.faktorManusia || []).map((item) => (
                      <motion.div
                        layoutId={`sort-${item}`}
                        key={item}
                        className="bg-white border border-orange-300 rounded-xl p-3 shadow-sm text-xs text-slate-700 flex justify-between items-center font-medium"
                      >
                        <span>{item}</span>
                        <button 
                          onClick={() => removeFromSorting(item)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Area Diskusi */}
          <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-3">
            <h3 className="font-bold text-slate-800 text-base">
              Kolom Diskusi Kelompok: Hal yang Perlu Dipelajari Lebih Lanjut
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Semenjak pemicu longsor dan banjir berkaitan, hal baru apa saja yang dirasa sangat perlu dipelajari kelompok agar solusi mitigasi yang dibuat optimal (misal: struktur perakaran penahan tanah atau sistem sensor banjir)? Tuliskan di sini:
            </p>
            <textarea
              className="w-full border-2 border-slate-200 rounded-[1.2rem] p-4 text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-all text-sm h-32"
              placeholder="Contoh: Kami ingin mendiskusikan seputar tipe tanaman vetiver penahan tebing Aceh dan teknologi sensor suara sirine peringatan dini..."
              value={answers.organisasi.diskusiLanjutan}
              onChange={(e) => onChange({
                ...answers,
                organisasi: { ...answers.organisasi, diskusiLanjutan: e.target.value }
              })}
            />
          </div>
        </motion.div>
      )}

      {/* Step 3: Membimbing Penyelidikan */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Instruksi */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-cyan-950 flex items-center gap-2 mb-2 font-sans">
              <BookOpen className="text-cyan-600" />
              Langkah 3: Membimbing Penyelidikan Mandiri
            </h2>
            <p className="text-xs md:text-sm text-cyan-800 font-sans leading-relaxed">
              Kunjungi sumber belajar berupa kliping artikel, video, lapangan, atau siber BMKG di bawah ini. Cari fakta penting lalu isikan baris tabel data analisis. Tambahkan baris baru secara fleksibel untuk memperluas lingkup investigasi kelompok.
            </p>
          </div>

          {/* Sumber Belajar */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="font-extrabold text-sm md:text-base text-slate-800 flex items-center gap-1.5 font-sans">
                  <span className="p-1 px-2.5 bg-cyan-600 text-white rounded-lg text-xs leading-none font-bold">A</span>
                  Sumber Resmi Pembelajaran (Disiapkan oleh Guru)
                </h3>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Klik salah satu kartu di bawah ini untuk menampilkan poster mitigasi bencana alam atau komik siaga bencana secara langsung di halaman ini.
                </p>
              </div>
              <div className="text-[10px] bg-cyan-100/50 border border-cyan-200 text-cyan-800 font-bold px-3 py-1 rounded-full self-start font-mono uppercase tracking-wider animate-pulse">
                ✓ Bahan Kajian Utama
              </div>
            </div>

            {/* Premium 2 Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {/* Card 1: Poster */}
              <div 
                onClick={() => {
                  setActiveInvestigasiTab("poster");
                  setStep3Zoom(100);
                  setStep3Annotation("pt-1");
                }}
                className={cn(
                  "cursor-pointer bg-white border-2 rounded-[1.5rem] p-4 flex flex-col justify-between transition-all duration-300 relative",
                  activeInvestigasiTab === "poster"
                    ? "border-cyan-500 shadow-lg ring-2 ring-cyan-200 shadow-cyan-50"
                    : "border-slate-200 hover:border-cyan-300 hover:shadow-md"
                )}
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "p-2 rounded-xl border transition-colors",
                      activeInvestigasiTab === "poster" ? "bg-cyan-100 border-cyan-300 text-cyan-600" : "bg-slate-50 border-slate-200 text-slate-650"
                    )}>
                      🗺️
                    </span>
                    <span className="text-[8px] bg-cyan-100 border border-cyan-200 text-cyan-800 font-bold px-2 py-0.5 rounded">
                      INTERAKTIF
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs md:text-sm leading-tight font-sans">
                      Poster Mitigasi Kebencanaan Aceh
                    </h4>
                    <span className="text-[8px] text-slate-400 font-bold tracking-widest font-mono block mt-1 font-semibold">
                      POSTER EDUKASI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans line-clamp-2">
                    Media gambar mitigasi bencana alam, parit vetiver, eco-drainage, serta visualisasi evakuasi daerah bukit terjal.
                  </p>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-black">
                  <span className={activeInvestigasiTab === "poster" ? "text-cyan-650 font-sans" : "text-slate-500 font-sans"}>
                    {activeInvestigasiTab === "poster" ? "● Sedang Diteliti" : "Mulai Investigasi 🔎"}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono">PBL-ACEH-01</span>
                </div>
              </div>

              {/* Card 2: Komik */}
              <div 
                onClick={() => {
                  setActiveInvestigasiTab("komik");
                  setStep3Zoom(100);
                  setStep3Annotation("ct-1");
                }}
                className={cn(
                  "cursor-pointer bg-white border-2 rounded-[1.5rem] p-4 flex flex-col justify-between transition-all duration-300 relative",
                  activeInvestigasiTab === "komik"
                    ? "border-purple-500 shadow-lg ring-2 ring-purple-200 shadow-purple-50"
                    : "border-slate-200 hover:border-purple-300 hover:shadow-md"
                )}
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "p-2 rounded-xl border transition-colors",
                      activeInvestigasiTab === "komik" ? "bg-purple-100 border-purple-300 text-purple-600" : "bg-slate-50 border-slate-200 text-slate-650"
                    )}>
                      📚
                    </span>
                    <span className="text-[8px] bg-purple-100 border border-purple-200 text-purple-800 font-bold px-2 py-0.5 rounded">
                      INTERAKTIF
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs md:text-sm leading-tight font-sans">
                      Komik Siaga Kebencanaan Aceh
                    </h4>
                    <span className="text-[8px] text-slate-400 font-bold tracking-widest font-mono block mt-1 font-semibold">
                      CERITA VISUAL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans line-clamp-2">
                    Cerita strip komik kesiapsiagaan menghadapi kerentanan tebing Gayo serta persiapan Tas Siaga Bencana (TSB) keluarga.
                  </p>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-black">
                  <span className={activeInvestigasiTab === "komik" ? "text-purple-650 font-sans" : "text-slate-500 font-sans"}>
                    {activeInvestigasiTab === "komik" ? "● Sedang Diteliti" : "Mulai Investigasi 🔎"}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono">PBL-ACEH-02</span>
                </div>
              </div>
            </div>

            {/* SCREEN LAYAR WORKBENCH PEMBELAJARAN INTERAKTIF TERINTEGRASI */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-5 md:p-6 shadow-xl text-white">
              {/* Interactive Viewport Panel for Poster and Komik */}
              <div className="flex flex-col space-y-3 w-full">
                {/* Viewport Frame with Zoom */}
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-[10px] font-black text-slate-400 font-mono">PERBESARAN:</span>
                    <input
                      type="range"
                      min="100"
                      max="250"
                      step="25"
                      value={step3Zoom}
                      onChange={(e) => setStep3Zoom(Number(e.target.value))}
                      className="w-28 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <span className="text-[10px] font-black text-cyan-400 font-mono w-10">{step3Zoom}%</span>
                    <button
                      type="button"
                      onClick={() => setStep3Zoom(100)}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-800 font-mono font-bold text-slate-400 cursor-pointer"
                    >
                      RESET
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsStep3LightboxOpen(true)}
                    className="shrink-0 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    title="Buka dalam resolusi besar satu layar penuh"
                  >
                    📺 Layar Penuh
                  </button>
                </div>

                {/* Viewport Frame with Scroll */}
                <div className="relative w-full aspect-video md:aspect-[16/10] bg-slate-950 rounded-2xl overflow-auto border border-slate-850 shadow-inner flex items-start justify-start p-3 min-h-[300px] md:min-h-[420px]">
                  <div
                    className="transition-all duration-300 ease-out shrink-0 m-auto"
                    style={{
                      width: `${step3Zoom}%`,
                      maxWidth: step3Zoom === 100 ? '100%' : 'none',
                    }}
                  >
                    {activeInvestigasiTab === "poster" ? (
                      <img
                        src="/PosterACEH.png"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80"; }}
                        alt="Poster Mitigasi Kebencanaan Aceh"
                        className="w-full h-auto rounded-xl shadow-lg brightness-95 select-none"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <img
                        src="/KomikAceh.png"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"; }}
                        alt="Komik Strip Siaga Bencana Aceh"
                        className="w-full h-auto rounded-xl shadow-lg brightness-95 select-none"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian B: Analisis & Kutipan Mandiri Siswa */}
          <div className="space-y-4 pt-1">
            <div className="bg-slate-50 border-2 border-slate-200 rounded-[1.8rem] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-slate-800 flex items-center gap-1.5 font-sans">
                    <span className="p-1 px-2.5 bg-purple-600 text-white rounded-lg text-xs leading-none font-bold">B</span>
                    Papan Referensi Tambahan & Pencarian Mandiri Kelompok
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans leading-relaxed mt-0.5">
                    Siswa dipersilakan mencari satu/beberapa sumber tambahan dari luar (buku paket geografi, portal berita kredibel, situs BMKG, atau instansi terkait) lalu mencatatnya di bawah ini.
                  </p>
                </div>
                
                {/* Search helper shortcut */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <a
                    href="https://scholar.google.com/scholar?q=mitigasi+bencana+banjir+longsor+aceh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-300 rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <span>Cari Jurnal (Scholar) 🔍</span>
                  </a>
                  <a
                    href="https://bpba.acehprov.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-300 rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <span>Situs BPBA Aceh 🌐</span>
                  </a>
                </div>
              </div>

              {/* Add Reference inline form */}
              <div className="bg-white border-2 border-slate-150 rounded-2xl p-4 md:p-5 space-y-3.5">
                <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-black uppercase tracking-wider rounded-md font-mono inline-block">
                  📝 Formulir Tambah Referensi Mandiri Kelompok
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-650 block uppercase tracking-wider">Judul Referensi: <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-purple-400 focus:outline-none placeholder-slate-400 font-sans"
                      placeholder="Misal: Catatan Cuaca BMKG Banda Aceh..."
                      value={refTitle}
                      onChange={(e) => setRefTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-650 block uppercase tracking-wider">Tipe / Media:</label>
                    <select
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-purple-400 focus:outline-none font-sans"
                      value={refType}
                      onChange={(e) => setRefType(e.target.value)}
                    >
                      <option value="Situs Web Resmi">Situs Web Resmi (BMKG/BPBD/BNPB)</option>
                      <option value="Jurnal Penulisan / Scholar">Jurnal Penulisan / Scholar</option>
                      <option value="Portal Berita Terpercaya">Portal Berita Terpercaya</option>
                      <option value="Wawancara Lapangan / Komunitas">Wawancara Lapangan / Komunitas</option>
                      <option value="Dokumen Buku / PDF">Dokumen Buku / PDF Sekolah</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-650 block uppercase tracking-wider">Alamat Tautan URL (Opsional):</label>
                    <input
                      type="text"
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-purple-400 focus:outline-none placeholder-slate-400 font-sans"
                      placeholder="Http:// atau Https://..."
                      value={refUrl}
                      onChange={(e) => setRefUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-650 block uppercase tracking-wider">Ringkasan Bukti / Informasi Penting yang Ditemukan:</label>
                  <textarea
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-purple-400 focus:outline-none placeholder-slate-400 font-sans"
                    rows={2}
                    placeholder="Tuliskan fakta penting di sini. Contoh: Curah hujan bulanan terekam mencapai 420 mm, memicu genangan setinggi mata kaki di hilir..."
                    value={refDesc}
                    onChange={(e) => setRefDesc(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium italic">
                    * Berikan judul referensi kelompok sebelum menyimpan temuan mandiri Anda.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!refTitle.trim()) return;
                      addCustomReference(refTitle, refType, refDesc, refUrl);
                      setRefTitle("");
                      setRefDesc("");
                      setRefUrl("");
                    }}
                    disabled={!refTitle.trim()}
                    className={cn(
                      "px-4 py-2.5 text-white text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm self-end sm:self-auto",
                      refTitle.trim() 
                        ? "bg-purple-600 hover:bg-purple-700 active:scale-95 animate-pulse" 
                        : "bg-slate-300 cursor-not-allowed"
                    )}
                  >
                    <Plus size={14} />
                    <span>Simpan Referensi Temuan Mandiri</span>
                  </button>
                </div>
              </div>

              {/* Renders custom references list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
                {(answers.penyelidikan.customReferences || []).length === 0 ? (
                  <div className="sm:col-span-2 md:col-span-3 text-center py-8 bg-white/80 rounded-2xl border-2 border-dashed border-slate-250 p-4 font-sans text-slate-400 text-xs">
                    <p className="font-extrabold flex items-center justify-center gap-1">
                      <span>🗂️ Belum Ada Referensi Penyelidikan Mandiri Kelompok</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Gunakan formulir diatas untuk mencatat penemuan mandiri yang kelompok Anda telaah dari buku, koran, siber, atau Google.
                    </p>
                  </div>
                ) : (
                  (answers.penyelidikan.customReferences || []).map((ref) => (
                    <div key={ref.id} className="bg-white border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all relative">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-extrabold text-[8px] rounded border border-purple-100 uppercase tracking-widest font-mono">
                            {ref.type}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteCustomReference(ref.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                            title="Hapus referensi ini"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <h4 className="font-black text-slate-800 text-xs leading-tight font-sans">
                          📚 {ref.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-sans leading-relaxed line-clamp-3">
                          {ref.desc}
                        </p>
                      </div>

                      {ref.url && ref.url !== "#" && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3.5 block text-center w-full py-1.5 bg-purple-50 hover:bg-purple-100 font-bold text-[10px] text-purple-700 border border-purple-250 rounded-lg cursor-pointer transition-colors"
                        >
                          Kunjungi URL Referensi ↗
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tabel Penelitian Interaktif */}
          <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 space-y-4 overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <FileText className="text-cyan-500" />
                  Lembar Analisis Temuan Kasus Aceh
                </h3>
                <p className="text-xs text-slate-400 mt-1">Gunakan tabel ini untuk merangkum bukti pengamatan kelompok dari hasil investigasi di atas.</p>
              </div>
              
              <button
                type="button"
                onClick={addTableRow}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-cyan-500/10 cursor-pointer self-start transition-colors active:scale-95"
              >
                <Plus size={16} />
                Tambah Baris Data
              </button>
            </div>

            {/* Layout responsif tabel */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs md:text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="p-3 font-bold max-w-[190px]">Informasi Temuan</th>
                    <th className="p-3 font-bold max-w-[140px]">Sumber Info</th>
                    <th className="p-3 font-bold">Fakta Penting di Aceh</th>
                    <th className="p-3 font-bold">Hubungan Data dgn Bencana</th>
                    <th className="p-3 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {answers.penyelidikan.tableRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2">
                        <textarea
                          className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-400 bg-white"
                          rows={2}
                          value={row.info}
                          onChange={(e) => handleTableRowChange(row.id, 'info', e.target.value)}
                          placeholder="Contoh: Air bercampur material kayu..."
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-400 bg-white"
                          value={row.sumber}
                          onChange={(e) => handleTableRowChange(row.id, 'sumber', e.target.value)}
                          placeholder="Dokumen BPBA..."
                        />
                      </td>
                      <td className="p-2">
                        <textarea
                          className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-400 bg-white"
                          rows={2}
                          value={row.fakta}
                          onChange={(e) => handleTableRowChange(row.id, 'fakta', e.target.value)}
                          placeholder="Pemukiman terendam lumpur sungai..."
                        />
                      </td>
                      <td className="p-2">
                        <textarea
                          className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-400 bg-white"
                          rows={2}
                          value={row.hubungan}
                          onChange={(e) => handleTableRowChange(row.id, 'hubungan', e.target.value)}
                          placeholder="Hutan hulu beralih fungsi..."
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => deleteTableRow(row.id)}
                          disabled={answers.penyelidikan.tableRows.length <= 1}
                          className="text-slate-300 hover:text-red-500 disabled:opacity-30 cursor-pointer p-1.5 rounded-lg hover:bg-red-50 inline-block transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Area Diskusi */}
          <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-3">
            <h3 className="font-bold text-slate-800 text-base">
              Catatan Hambatan Penyelidikan Kelompok
            </h3>
            <p className="text-xs text-slate-500">
              Apakah kelompok menemui kendala dalam menafsirkan data topografi struktur bumi di Aceh? Tuliskan catatan penyelidikan tambahan di sini:
            </p>
            <textarea
              className="w-full border-2 border-slate-200 rounded-[1.2rem] p-4 text-slate-800 placeholder-slate-400 focus:border-cyan-400 focus:outline-none transition-all text-sm h-28"
              placeholder="Tuliskan jika ada hambatan atau temuan analisis pendukung..."
              value={answers.penyelidikan.catatanDiskusi}
              onChange={(e) => onChange({
                ...answers,
                penyelidikan: { ...answers.penyelidikan, catatanDiskusi: e.target.value }
              })}
            />
          </div>

          {/* STEP 3 LIGHTBOX POPUP IN THE SAME PAGE - NO REDIRECTS, NO BLANK PAGES! */}
          <AnimatePresence>
            {isStep3LightboxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 md:p-8"
              >
                <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
                  <span className="text-[10px] bg-slate-900 border border-slate-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono text-cyan-400">
                    📺 LAYAR PENUH: {activeInvestigasiTab === "poster" ? "POSTER MITIGASI" : "KOMIK SIAGA"}
                  </span>
                  <button
                    onClick={() => setIsStep3LightboxOpen(false)}
                    className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white flex items-center justify-center text-lg font-bold transition-all cursor-pointer shadow-lg active:scale-95"
                    title="Tutup Mode Layar Penuh"
                  >
                    ✕
                  </button>
                </div>

                <div className="relative max-w-5xl w-full h-[85vh] bg-slate-950 flex flex-col items-center justify-center rounded-[2.5rem] overflow-hidden border border-slate-800 p-4">
                  {/* Centered Large Interactive Image */}
                  <div className="relative max-w-full max-h-full overflow-auto p-4 flex items-center justify-center">
                    <div className="relative max-w-4xl max-h-[75vh]">
                      <img
                        src={activeInvestigasiTab === "poster" ? "/PosterACEH.png" : "/KomikAceh.png"}
                        onError={(e) => {
                          e.currentTarget.src = activeInvestigasiTab === "poster"
                            ? "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80"
                            : "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80";
                        }}
                        alt="Fullscreen Gallery Document"
                        className="max-h-[70vh] rounded-2xl w-auto object-contain mx-auto shadow-2xl border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Interactive description overlay inside same window */}
                      <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 border border-slate-800 text-white rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-cyan-400">
                            {activeInvestigasiTab === "poster" ? "PosterACEH.png (Mode Layar Penuh)" : "KomikAceh.png (Mode Layar Penuh)"}
                          </h5>
                          <p className="text-slate-400 text-[10px] font-sans">
                            Dokumen pembelajaran terintegrasi di dalam sistem tanpa perlu diarahkan kembali atau berpindah laman.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-[9px] rounded-full font-bold">
                            ✓ In-App Interactive Gallery
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Step 4: Mengembangkan dan Menyajikan Solusi */}
      {currentStep === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Judul */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2 mb-2 font-sans">
              <Lightbulb className="text-orange-600 animate-bounce" />
              Langkah 4: Mengembangkan Gagasan Solusi Bencana
            </h2>
            <p className="text-xs md:text-sm text-orange-800 font-sans leading-relaxed flex items-center gap-1.5">
              Rancang gagasan inovatif mitigasi kelompokmu berdasarkan 4 pilar penting. Kemudian tentukan media presentasi kelompokmu untuk menyajikannya kepada bapak/ibu guru dan kelas!
            </p>
          </div>

          {/* 4 Pastel Cards Gagasan Solusi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Pencegahan */}
            <div className="bg-emerald-50/60 border-2 border-emerald-200 rounded-[1.8rem] p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <h4 className="font-bold text-emerald-950 text-sm md:text-base">Kategori 1: Pencegahan (Preventatif)</h4>
              </div>
              <p className="text-[11px] text-emerald-800">Bagaimana langkah kita mencegah banjir/longsor sebelum terjadi? (contoh: pembersihan hulu, zonasi lereng, penanaman vetiver)</p>
              <textarea
                className="w-full bg-white/95 border border-emerald-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 h-24"
                placeholder="Tulis gagasan pencegahan..."
                value={answers.solusi.pencegahan}
                onChange={(e) => onChange({
                  ...answers,
                  solusi: { ...answers.solusi, pencegahan: e.target.value }
                })}
              />
            </div>

            {/* 2. Kesiapsiagaan */}
            <div className="bg-cyan-50/60 border-2 border-cyan-200 rounded-[1.8rem] p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📢</span>
                <h4 className="font-bold text-cyan-950 text-sm md:text-base">Kategori 2: Kesiapsiagaan (Siaga)</h4>
              </div>
              <p className="text-[11px] text-cyan-800">Persiapan apa saja di rumah & sekolah sebelum badai/hujan deras melanda? (Tas siaga, simulasi jalur evakuasi, sirine dini)</p>
              <textarea
                className="w-full bg-white/95 border border-cyan-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 h-24"
                placeholder="Tulis kesiapsiagaan..."
                value={answers.solusi.kesiapsiagaan}
                onChange={(e) => onChange({
                  ...answers,
                  solusi: { ...answers.solusi, kesiapsiagaan: e.target.value }
                })}
              />
            </div>

            {/* 3. Penanganan saat bencana */}
            <div className="bg-red-50/60 border-2 border-red-200 rounded-[1.8rem] p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛟</span>
                <h4 className="font-bold text-red-950 text-sm md:text-base">Kategori 3: Reaksi Saat Terjadi Bencana</h4>
              </div>
              <p className="text-[11px] text-red-800">Apa yang harus diprioritaskan warga detik-detik saat banjir meninggi? (misal: evakuasi mandiri, matikan listrik, jalur aman)</p>
              <textarea
                className="w-full bg-white/95 border border-red-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500 h-24"
                placeholder="Tulis langkah saat bencana..."
                value={answers.solusi.penanganan}
                onChange={(e) => onChange({
                  ...answers,
                  solusi: { ...answers.solusi, penanganan: e.target.value }
                })}
              />
            </div>

            {/* 4. Pemulihan */}
            <div className="bg-orange-50/60 border-2 border-orange-200 rounded-[1.8rem] p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤝</span>
                <h4 className="font-bold text-orange-950 text-sm md:text-base">Kategori 4: Pemulihan Pascabencana</h4>
              </div>
              <p className="text-[11px] text-orange-800">Langkah pemulihan lingkungan atau bantuan psikososial setelah banjir surut? (seperti menimbun sampah selokan, kaporisasi sumur)</p>
              <textarea
                className="w-full bg-white/95 border border-orange-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-orange-500 h-24"
                placeholder="Tulis pemulihan pasca bencana..."
                value={answers.solusi.pemulihan}
                onChange={(e) => onChange({
                  ...answers,
                  solusi: { ...answers.solusi, pemulihan: e.target.value }
                })}
              />
            </div>

          </div>

          {/* Solusi Unggulan Kelompok */}
          <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-800 text-base">Ide Solusi Terbaik & Alasan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Gagasan Utama Solusi Terbaik Kelompok:
                </label>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-400 h-24"
                  placeholder="Misal: Membuat program siber RT 'Dinding Siaga Vetiver' di bukit terdekat dengan alarm banjir mandiri..."
                  value={answers.solusi.solusiTerbaik}
                  onChange={(e) => onChange({
                    ...answers,
                    solusi: { ...answers.solusi, solusiTerbaik: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Alasan Memilih Gagasan Tersebut:
                </label>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-400 h-24"
                  placeholder="Sebutkan kemudahan pembuatan, biaya, atau efisiensi pemanfaatan bahan lokal..."
                  value={answers.solusi.alasanSolusiTerbaik}
                  onChange={(e) => onChange({
                    ...answers,
                    solusi: { ...answers.solusi, alasanSolusiTerbaik: e.target.value }
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                Rancangan Desain / Deskripsi Detail Solusi Kelompok:
              </label>
              <textarea
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-orange-400 h-32"
                placeholder="Gambarkan rancangan kerjamu di sini secara bertahap (misal alat, bahan, koordinasi RT)..."
                value={answers.solusi.rancanganSolusi}
                onChange={(e) => onChange({
                  ...answers,
                  solusi: { ...answers.solusi, rancanganSolusi: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Pilihan Media Penyajian Solusi */}
          <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-base">Pilih Media Penyajian Presentasi Kelompok</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kalian bebas mengkreasikan solusi mitigasi bencana ini ke dalam format media kreatif apa? (Centang satu atau beberapa media terpilih):
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {['Poster Digital', 'Leaflet', 'Infografis', 'PowerPoint', 'Video Pendek', 'Drama Singkat'].map((media) => {
                const isSelected = (answers.solusi.mediaPresentasi || []).includes(media);
                return (
                  <button
                    key={media}
                    onClick={() => handleMediaToggle(media)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-center text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer hover:scale-[1.02]",
                      isSelected 
                        ? "bg-orange-50 border-orange-400 text-orange-900 shadow-sm" 
                        : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <CheckCircle size={16} className={cn(isSelected ? "text-orange-500" : "text-slate-300")} />
                    <span>{media}</span>
                  </button>
                );
              })}
            </div>

            {/* Simulated Upload Section */}
            <div className="space-y-5">
              {/* Simulated Manual Drag-and-Drop / Upload Box */}
              <div className="border-2 border-dashed border-slate-200 hover:border-orange-300 rounded-[1.5rem] p-5 text-center transition-all bg-slate-50/50 relative">
                <input
                  type="file"
                  id="file-pembelajaran"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                  onChange={simulateFileUpload}
                />
                <div className="flex flex-col items-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-700 text-xs">
                      Atau Unggah Berkas JPG/PNG Poster Buatan Kelompok Sendiri
                    </h4>
                    <p className="text-[10px] text-slate-500 font-sans font-medium mt-0.5">
                      Pilih berkas dari gawai Anda untuk diunggah (Gambar poster mitigasi bencana).
                    </p>
                  </div>
                  
                  {answers.solusi.uploadedFileName ? (
                    <div className="mt-2.5 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                      <CheckCircle size={12} className="text-emerald-600" />
                      <span>Berkas Aktif: <strong>{answers.solusi.uploadedFileName}</strong></span>
                    </div>
                  ) : (
                    <span className="text-[9px] uppercase font-black text-orange-600 mt-1 bg-orange-100/50 px-2 py-0.5 rounded-full tracking-wider font-mono">
                      Klik / Tarik File Gambar Anda Ke Sini
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 5: Menganalisis dan Mengevaluasi Solusi */}
      {currentStep === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Judul */}
          <div className="bg-gradient-to-r from-teal-50 to-green-50 border-2 border-teal-300 rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-teal-900 flex items-center gap-2 mb-2 font-sans">
              <CheckCircle2 className="text-teal-600 animate-spin-slow" />
              Langkah 5: Menganalisis & Mengevaluasi Solusi Masalah
            </h2>
            <p className="text-xs md:text-sm text-teal-800 font-sans leading-relaxed">
              Beri penilaian skor (1-4) atas ide kelompokmu sendiri secara jujur. Nilai kelayakannya, efektivitas solusinya, dampak positifnya, dan keberlajutannya di masa mendatang. Lakukan juga refleksi kerja tim di bawah ini.
            </p>
          </div>

          {/* Tabel Penilaian Skor Kelayakan Mandiri */}
          <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-5">
            <h3 className="font-bold text-slate-800 text-base">Evaluasi Kelayakan Gagasan (Self-Evaluation)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Kelayakan */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">🛠️ Kelayakan Solusi</h4>
                  <p className="text-[10px] text-slate-500 mt-1 mb-3">Apakah alat/bahan solusi kelompok mudah diperoleh di Aceh?</p>
                </div>
                <div className="flex gap-1.5 justify-center mt-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => updateScore('kelayakan', num)}
                      className={cn(
                        "w-9 h-9 font-bold font-sans text-xs rounded-full border-2 transition-all cursor-pointer",
                        answers.evaluasi.kelayakan === num
                          ? "bg-teal-500 border-teal-500 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Efektivitas */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">🎯 Efektivitas Tindakan</h4>
                  <p className="text-[10px] text-slate-500 mt-1 mb-3">Seberapa jitu solusi mitigasi ini saat banjir ekstrem tiba?</p>
                </div>
                <div className="flex gap-1.5 justify-center mt-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => updateScore('efektivitas', num)}
                      className={cn(
                        "w-9 h-9 font-bold font-sans text-xs rounded-full border-2 transition-all cursor-pointer",
                        answers.evaluasi.efektivitas === num
                          ? "bg-teal-500 border-teal-500 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dampak Positif */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">🍀 Dampak Positif Lingkungan</h4>
                  <p className="text-[10px] text-slate-500 mt-1 mb-3">Apakah aman bagi alam pegunungan dan ekosistem air sungai Aceh?</p>
                </div>
                <div className="flex gap-1.5 justify-center mt-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => updateScore('dampakPositif', num)}
                      className={cn(
                        "w-9 h-9 font-bold font-sans text-xs rounded-full border-2 transition-all cursor-pointer",
                        answers.evaluasi.dampakPositif === num
                          ? "bg-teal-500 border-teal-500 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keberlanjutan */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">♾️ Keberlanjutan Tindakan</h4>
                  <p className="text-[10px] text-slate-500 mt-1 mb-3">Bisa dipakai bertahun-tahun ataukah hanya selintas saja?</p>
                </div>
                <div className="flex gap-1.5 justify-center mt-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => updateScore('keberlanjutan', num)}
                      className={cn(
                        "w-9 h-9 font-bold font-sans text-xs rounded-full border-2 transition-all cursor-pointer",
                        answers.evaluasi.keberlanjutan === num
                          ? "bg-teal-500 border-teal-500 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Skala Keterangan */}
            <div className="text-[11px] text-slate-400 font-medium leading-relaxed bg-slate-50 rounded-xl p-3 flex gap-4">
              <span><strong>Skala Penilaian:</strong></span>
              <span>1 = Sangat Kurang</span>
              <span>2 = Kurang Layak</span>
              <span>3 = Layak & Efektif</span>
              <span>4 = Sangat Unggul</span>
            </div>
          </div>

          {/* Analisis Solusi - Kekuatan dan Kelemahan */}
          <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-5">
            <h3 className="font-bold text-slate-800 text-base">Evaluasi Umpan Balik Mutu Solusi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Kelebihan / Kekuatan Solusi Kelompok:
                </label>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-400 h-24"
                  placeholder="Seberapa kuat dugaannya? (Contoh: Tanaman rumput vetiver tumbuh cepat dan mengikat tanah kemiringan Aceh)..."
                  value={answers.evaluasi.kelebihan}
                  onChange={(e) => onChange({
                    ...answers,
                    evaluasi: { ...answers.evaluasi, kelebihan: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Kelemahan / Hambatan Benda/Solusi yang Perlu Diperbaiki:
                </label>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-400 h-24"
                  placeholder="Apa kekurangannya? (Contoh: Anak-anak berpotensi butuh modal awal pembuatan alarm mandiri)..."
                  value={answers.evaluasi.kelemahan}
                  onChange={(e) => onChange({
                    ...answers,
                    evaluasi: { ...answers.evaluasi, kelemahan: e.target.value }
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                Rencana Tindak Lanjut / Perbaikan Solusi:
              </label>
              <textarea
                className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-400 h-24"
                placeholder="Bagaimana cara memperbaiki kelemahan tersebut? Tulis rencana tindak lanjut kelompok..."
                value={answers.evaluasi.perbaikanSolusi}
                onChange={(e) => onChange({
                  ...answers,
                  evaluasi: { ...answers.evaluasi, perbaikanSolusi: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Sesi Evaluasi & Refleksi Pembelajaran Berkelompok (Team Collaboration Assessment) */}
          <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Users className="text-teal-600 animate-pulse" />
                  Sesi Refleksi, Kolaborasi & Evaluasi Kontribusi Kelompok
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Nilai kontribusi gotong royong masing-masing anggota kelompok secara transparan dan lakukan refleksi pencapaian kompetensi tim di bawah ini.
                </p>
              </div>
            </div>

            {/* Matrix Kontribusi Anggota Kelompok */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  🧑‍🤝‍🧑 Matriks Peran & Skor Kontribusi Gotong Royong Anggota:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    let memberReflections: any[] = [];
                    try {
                      if (answers.evaluasi.refleksiKerjasama && answers.evaluasi.refleksiKerjasama.trim().startsWith('[')) {
                        memberReflections = JSON.parse(answers.evaluasi.refleksiKerjasama);
                      }
                    } catch (e) {}
                    if (!Array.isArray(memberReflections)) memberReflections = [];
                    
                    const updated = [
                      ...memberReflections,
                      {
                        id: `mem-${Date.now()}`,
                        name: `Anggota ${memberReflections.length + 1}`,
                        role: "Penyelidik Informasi / Riset",
                        score: 4,
                        notes: ""
                      }
                    ];
                    onChange({
                      ...answers,
                      evaluasi: {
                        ...answers.evaluasi,
                        refleksiKerjasama: JSON.stringify(updated)
                      }
                    });
                  }}
                  className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 self-start"
                >
                  <Plus size={14} />
                  <span>Tambah Anggota Kelompok</span>
                </button>
              </div>

              {/* Dynamic list / table */}
              <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/40 divide-y divide-slate-150">
                {(() => {
                  let memberReflections: any[] = [];
                  try {
                    if (answers.evaluasi.refleksiKerjasama && answers.evaluasi.refleksiKerjasama.trim().startsWith('[')) {
                      memberReflections = JSON.parse(answers.evaluasi.refleksiKerjasama);
                    }
                  } catch (e) {}
                  
                  if (!Array.isArray(memberReflections) || memberReflections.length === 0) {
                    memberReflections = [
                      { id: "mem-1", name: "Ahmad", role: "Ketua Kelompok (Koordinator)", score: 4, notes: "Mengoordinasi pembagian tugas langkah 1-5" },
                      { id: "mem-2", name: "Siti", role: "Desainer Media (Poster/Komik)", score: 4, notes: "Merancang visual mitigasi bencana Aceh" }
                    ];
                  }

                  const handleMemberChange = (id: string, field: string, val: any) => {
                    const updated = memberReflections.map(m => m.id === id ? { ...m, [field]: val } : m);
                    onChange({
                      ...answers,
                      evaluasi: {
                        ...answers.evaluasi,
                        refleksiKerjasama: JSON.stringify(updated)
                      }
                    });
                  };

                  const deleteMember = (id: string) => {
                    const updated = memberReflections.filter(m => m.id !== id);
                    onChange({
                      ...answers,
                      evaluasi: {
                        ...answers.evaluasi,
                        refleksiKerjasama: JSON.stringify(updated)
                      }
                    });
                  };

                  return memberReflections.map((member, index) => (
                    <div key={member.id || index} className="p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4 hover:bg-white transition-all">
                      {/* Name input */}
                      <div className="flex-1 min-w-[150px] space-y-1">
                        <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Nama Anggota:</span>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                          placeholder="Nama Lengkap Anggota..."
                          className="w-full border-2 border-slate-250 rounded-xl p-2.5 text-xs focus:outline-none focus:border-teal-400 bg-white font-semibold text-slate-800"
                        />
                      </div>

                      {/* Role selection */}
                      <div className="w-full md:w-[220px] space-y-1">
                        <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Peran PBL Kelompok:</span>
                        <select
                          value={member.role}
                          onChange={(e) => handleMemberChange(member.id, 'role', e.target.value)}
                          className="w-full border-2 border-slate-250 rounded-xl p-2.5 text-xs focus:outline-none focus:border-teal-400 bg-white font-sans font-semibold text-slate-700"
                        >
                          <option value="Ketua Kelompok (Koordinator)">👑 Ketua Kelompok (Koordinator)</option>
                          <option value="Penyelidik Informasi / Riset">🔎 Penyelidik Informasi / Riset</option>
                          <option value="Desainer Media (Poster/Komik)">🎨 Desainer Media (Poster/Komik)</option>
                          <option value="Pemateri / Juru Bicara">🗣️ Pemateri / Juru Bicara</option>
                          <option value="Penyusunan Formulir Solusi">📝 Penyusunan Formulir Solusi</option>
                        </select>
                      </div>

                      {/* Contribution scoring */}
                      <div className="w-full md:w-[150px] space-y-1">
                        <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Kontribusi Keaktifan:</span>
                        <div className="flex items-center gap-1 bg-white border-2 border-slate-250 py-1.5 px-3 rounded-xl justify-between">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleMemberChange(member.id, 'score', star)}
                                className="cursor-pointer text-amber-500 hover:scale-115 active:scale-90 transition-transform"
                              >
                                <Star size={14} fill={member.score >= star ? "currentColor" : "none"} />
                              </button>
                            ))}
                          </div>
                          <span className="text-[10px] font-black text-slate-500 font-mono">
                            {member.score}/4
                          </span>
                        </div>
                      </div>

                      {/* Notes of action */}
                      <div className="flex-[1.5] space-y-1">
                        <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Catatan Tugas / Kerja Nyata:</span>
                        <input
                          type="text"
                          value={member.notes}
                          onChange={(e) => handleMemberChange(member.id, 'notes', e.target.value)}
                          placeholder="Tugas konkret apa yang ia tuntaskan?..."
                          className="w-full border-2 border-slate-250 rounded-xl p-2.5 text-xs focus:outline-none focus:border-teal-400 bg-white text-slate-600"
                        />
                      </div>

                      {/* Delete */}
                      <div className="self-end md:self-center pt-2 md:pt-4">
                        <button
                          type="button"
                          onClick={() => deleteMember(member.id)}
                          className="p-2.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Hapus Anggota"
                          disabled={memberReflections.length <= 1}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Pertanyaan Reflektif Kelompok Lainnya */}
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              🧠 Evaluasi Karakter Kompetensi & Gotong Royong Tim:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 leading-tight">
                  🤯 Karakter Berpikir Kritis (Critical Thinking Kelompok):
                </label>
                <p className="text-[10px] text-slate-500 leading-normal font-sans">
                  Bagaimana cara kelompok menyaring berbagai info kebencanaan?
                </p>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-teal-400 bg-white h-24 font-semibold text-slate-755 leading-relaxed font-sans"
                  value={answers.evaluasi.refleksiKritis}
                  onChange={(e) => onChange({
                    ...answers,
                    evaluasi: { ...answers.evaluasi, refleksiKritis: e.target.value }
                  })}
                  placeholder="Contoh: Kami mencocokkan laporan pasang air laut dari BMKG Aceh dengan sejarah banjir rob tahun lampau secara cermat..."
                />
              </div>

              <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 leading-tight">
                  🎨 Karakter Kreativitas (Creativity Kelompok):
                </label>
                <p className="text-[10px] text-slate-500 leading-normal font-sans">
                  Bagaimana kelompok menggabungkan bermacam ide unik anggota ke poster/komik?
                </p>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-teal-400 bg-white h-24 font-semibold text-slate-755 leading-relaxed font-sans"
                  value={answers.evaluasi.refleksiKreativitas}
                  onChange={(e) => onChange({
                    ...answers,
                    evaluasi: { ...answers.evaluasi, refleksiKreativitas: e.target.value }
                  })}
                  placeholder="Contoh: Kami menggabungkan ide tanggul biopori bambu dengan komik piktogram tas siaga bencana agar mudah dipahami warga..."
                />
              </div>

              <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 leading-tight">
                  🏡 Karakter Penerapan Sehari-hari (Actionable Kelompok):
                </label>
                <p className="text-[10px] text-slate-500 leading-normal font-sans">
                  Bagaimana komitmen tulus kelompok Anda untuk siap siaga menghadapi banjir?
                </p>
                <textarea
                  className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-teal-400 bg-white h-24 font-semibold text-slate-755 leading-relaxed font-sans"
                  value={answers.evaluasi.refleksiPenerapan}
                  onChange={(e) => onChange({
                    ...answers,
                    evaluasi: { ...answers.evaluasi, refleksiPenerapan: e.target.value }
                  })}
                  placeholder="Contoh: Kami sepakat meletakkan dokumen berharga di lantai dua rumah dan menyiapkan peluit di gantungan kunci tas sekolah..."
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Auto Saving status info */}
      <div className="flex justify-end text-[10px] text-slate-400 font-semibold gap-1.5 items-center">
        <span className={cn("w-2 h-2 rounded-full", isAutosaving ? "bg-amber-400 animate-ping" : "bg-emerald-400")} />
        <span>{isAutosaving ? "Menyimpan otomatis data ke awan Firebase..." : "Pekerjaan disimpan di awan Firebase aman."}</span>
      </div>

    </div>
  );
};

const CloudSvg = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.112 19.9571 10.1581 17.6534 10.0125C17.1652 6.55169 14.1751 4 10.5 4C6.35786 4 3 7.35786 3 11.5C3 11.8344 3.0218 12.1638 3.06411 12.4862C1.2961 13.0673 0 14.7175 0 16.5C0 18.9853 2.01472 21 4.5 21H17.5C18.15 21 18.5 20 17.5 19Z" fill="currentColor" />
  </svg>
);
