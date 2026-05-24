import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award,
  TrendingUp,
  Database,
  MessageSquare,
  Anchor, 
  Scale, 
  Droplets, 
  ChevronRight, 
  ChevronLeft, 
  LogOut, 
  BookOpen, 
  Table as TableIcon,
  HelpCircle,
  CheckCircle2,
  Trophy,
  Download,
  Users,
  Lightbulb,
  Trash2,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserPlus,
  RefreshCw,
  Home,
  CheckCircle,
  X,
  XCircle,
  Heart,
  Info,
  FileText,
  AlertCircle,
  ClipboardCheck,
  User,
  Target,
  Sparkles,
  Bot,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Local Offline Mock for Auth User
export interface FirebaseUser {
  uid: string;
  email: string;
}

// Core assets
import { SCHOOL_INFO, MATERI_LIST, INITIAL_STUDENT_ANSWERS, CAPAIAN_PEMBELAJARAN, TUJUAN_PEMBELAJARAN } from './constants';
import { GroupProgress, StudentAnswers, UserProfile, View } from './types';
import { PBLSteps } from './components/PBLSteps';
import { cn } from './lib/utils';

// Helpers
const getEmailForGroup = (groupName: string) => {
  const sanitized = groupName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${sanitized}@lkpd-aceh.example.com`;
};

const CloudSvg = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.112 19.9571 10.1581 17.6534 10.0125C17.1652 6.55169 14.1751 4 10.5 4C6.35786 4 3 7.35786 3 11.5C3 11.8344 3.0218 12.1638 3.06411 12.4862C1.2961 13.0673 0 14.7175 0 16.5C0 18.9853 2.01472 21 4.5 21H17.5C18.15 21 18.5 20 17.5 19Z" fill="currentColor" />
  </svg>
);


export default function App() {
  // Views navigation
  const [view, setView] = useState<View>('LANDING');
  
  // Database mode selection state: always local/offline sandbox mode
  const isLocalDB = true;
  
  const toggleDbMode = (mode: 'cloud' | 'local') => {
    // Always local
  };



  // Auth state & loading
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentProgress, setStudentProgress] = useState<GroupProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [showTargetsInMateri, setShowTargetsInMateri] = useState<boolean>(true);
  const [showCPTPLanding, setShowCPTPLanding] = useState<boolean>(false);

  // Auth forms state
  const [authRole, setAuthRole] = useState<'student' | 'guru'>('student');
  const [regRole, setRegRole] = useState<'student' | 'guru'>('student');
  
  // Login form
  const [lGroup, setLGroup] = useState<string>('');
  const [lEmail, setLEmail] = useState<string>('');
  const [lPassword, setLPassword] = useState<string>('');
  const [lError, setLError] = useState<string>('');

  // Register form
  const [rGroup, setRGroup] = useState<string>('');
  const [rLeader, setRLeader] = useState<string>('');
  const [rMembers, setRMembers] = useState<string>('');
  const [rEmail, setREmail] = useState<string>('');
  const [rPassword, setRPassword] = useState<string>('');
  const [rError, setRError] = useState<string>('');

  // Teacher Classroom state
  const [allGroups, setAllGroups] = useState<GroupProgress[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupProgress | null>(null);
  const [teacherScoreInput, setTeacherScoreInput] = useState<number>(0);
  const [teacherFeedbackInput, setTeacherFeedbackInput] = useState<string>('');

  // --- Auth Tracker ---
  useEffect(() => {
    setLoading(true);
    const cachedUser = localStorage.getItem('lkpd_current_user');
    const cachedProgress = localStorage.getItem('lkpd_current_progress');
    
    const allProg = localStorage.getItem('lkpd_progress');
    let loadedGroups: GroupProgress[] = [];
    if (allProg) {
      try {
        loadedGroups = JSON.parse(allProg);
        setAllGroups(loadedGroups);
      } catch (e) {
        console.error("Failed to parse progress data", e);
      }
    }

    if (cachedUser) {
      try {
        const prof = JSON.parse(cachedUser) as UserProfile;
        setProfile(prof);
        setUser({ uid: prof.uid, email: prof.email } as any);
        
        if (prof.role === 'admin') {
          setView('GURU');
        } else {
          setView('DASHBOARD');
          if (cachedProgress) {
            setStudentProgress(JSON.parse(cachedProgress));
          } else {
            const found = loadedGroups.find(p => p.uid === prof.uid);
            if (found) {
              setStudentProgress(found);
            }
          }
        }
      } catch (e) {
        console.error("Local session restore err:", e);
      }
    } else {
      setUser(null);
      setProfile(null);
      setStudentProgress(null);
      if (view !== 'ABOUT' && view !== 'MATERI') {
        setView('LANDING');
      }
    }
    setLoading(false);
  }, []);

  // --- Auto Save Answers ---
  const triggerAutosave = async (updatedAnswers: StudentAnswers, customStep?: number) => {
    if (!user) return;
    setIsAutosaving(true);
    
    const nextStep = customStep ?? (studentProgress ? studentProgress.currentStep : 1);
    const updatedProg: GroupProgress = {
      uid: user.uid,
      groupName: profile?.groupName || studentProgress?.groupName || 'Tanpa Nama',
      leaderName: profile?.leaderName || studentProgress?.leaderName || '',
      members: profile?.members || studentProgress?.members || [],
      currentStep: nextStep,
      isCompleted: studentProgress?.isCompleted || false,
      answers: updatedAnswers,
      updatedAt: new Date().toISOString(),
      teacherScore: studentProgress?.teacherScore,
      teacherFeedback: studentProgress?.teacherFeedback
    };

    setStudentProgress(updatedProg);

    localStorage.setItem('lkpd_current_progress', JSON.stringify(updatedProg));

    const allProgStr = localStorage.getItem('lkpd_progress');
    let allProgList: GroupProgress[] = allProgStr ? JSON.parse(allProgStr) : [];
    const index = allProgList.findIndex(p => p.uid === user.uid);
    if (index !== -1) {
      allProgList[index] = updatedProg;
    } else {
      allProgList.push(updatedProg);
    }
    localStorage.setItem('lkpd_progress', JSON.stringify(allProgList));
    setIsAutosaving(false);
  };

  // --- Auth Actions: SignUp ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRError('');
    setActionLoading(true);

    try {
      if (regRole === 'student') {
        if (!rGroup.trim() || !rLeader.trim() || !rMembers.trim() || !rPassword) {
          throw new Error("Mohon lengkapi seluruh formulir kelompok!");
        }
        if (rPassword.length < 6) {
          throw new Error("Password wajib minimal 6 karakter!");
        }

        const generatedEmail = getEmailForGroup(rGroup);
        const localUid = 'local_uid_' + Math.random().toString(36).substr(2, 9);
        
        const profileObj: UserProfile = {
          uid: localUid,
          email: generatedEmail,
          role: 'student',
          groupName: rGroup.trim(),
          leaderName: rLeader.trim(),
          members: rMembers.split(',').map(m => m.trim()).filter(Boolean),
          createdAt: new Date().toISOString()
        };

        const progressObj: GroupProgress = {
          uid: localUid,
          groupName: rGroup.trim(),
          leaderName: rLeader.trim(),
          members: profileObj.members || [],
          currentStep: 1,
          isCompleted: false,
          answers: INITIAL_STUDENT_ANSWERS,
          updatedAt: new Date().toISOString()
        };

        const usersStr = localStorage.getItem('lkpd_users');
        const usersList: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
        
        const alreadyExists = usersList.some(u => u.groupName?.toLowerCase() === rGroup.trim().toLowerCase());
        if (alreadyExists) {
          throw new Error("Nama kelompok ini sudah terdaftar!");
        }

        const passStr = localStorage.getItem('lkpd_passwords') || '{}';
        const passMap = JSON.parse(passStr);
        passMap[generatedEmail] = rPassword;
        localStorage.setItem('lkpd_passwords', JSON.stringify(passMap));

        usersList.push(profileObj);
        localStorage.setItem('lkpd_users', JSON.stringify(usersList));

        const progStr = localStorage.getItem('lkpd_progress');
        const progList: GroupProgress[] = progStr ? JSON.parse(progStr) : [];
        progList.push(progressObj);
        localStorage.setItem('lkpd_progress', JSON.stringify(progList));

        localStorage.setItem('lkpd_current_user', JSON.stringify(profileObj));
        localStorage.setItem('lkpd_current_progress', JSON.stringify(progressObj));

        setUser({ uid: localUid, email: generatedEmail });
        setProfile(profileObj);
        setStudentProgress(progressObj);

        setRGroup(''); setRLeader(''); setRMembers(''); setRPassword('');
        setView('DASHBOARD');
      } else {
        // Teacher SignUp
        if (!rEmail.trim() || !rPassword) {
          throw new Error("Mohon isi Email dan Password!");
        }
        if (rPassword.length < 6) {
          throw new Error("Password guru minimal 6 karakter!");
        }

        const localUid = 'local_uid_teacher_' + Math.random().toString(36).substr(2, 9);
        const profileObj: UserProfile = {
          uid: localUid,
          email: rEmail.trim(),
          role: 'admin',
          username: "Bapak/Ibu Guru",
          createdAt: new Date().toISOString()
        };

        const usersStr = localStorage.getItem('lkpd_users');
        const usersList: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];

        const passStr = localStorage.getItem('lkpd_passwords') || '{}';
        const passMap = JSON.parse(passStr);
        passMap[rEmail.trim().toLowerCase()] = rPassword;
        localStorage.setItem('lkpd_passwords', JSON.stringify(passMap));

        usersList.push(profileObj);
        localStorage.setItem('lkpd_users', JSON.stringify(usersList));

        localStorage.setItem('lkpd_current_user', JSON.stringify(profileObj));
        
        setUser({ uid: localUid, email: rEmail.trim() });
        setProfile(profileObj);

        setREmail(''); setRPassword('');
        setView('GURU');
      }
    } catch (err: any) {
      console.error("Register err:", err);
      setRError(err.message || String(err));
    } finally {
      setActionLoading(false);
    }
  };

  // --- Auth Actions: Login ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLError('');
    setActionLoading(true);

    try {
      const usersStr = localStorage.getItem('lkpd_users');
      const usersList: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
      const passStr = localStorage.getItem('lkpd_passwords') || '{}';
      const passMap = JSON.parse(passStr);

      if (authRole === 'student') {
        const inputGroupTrimmed = lGroup.trim().replace(/\s+/g, ' ');
        if (!inputGroupTrimmed || !lPassword) {
          throw new Error("Isikan nama kelompok dan password!");
        }

        // 1. Try to find user in usersList
        let foundUser = usersList.find(u => 
          u.role === 'student' && 
          u.groupName?.trim().replace(/\s+/g, ' ').toLowerCase() === inputGroupTrimmed.toLowerCase()
        );

        // 2. Fetch or heal from progress list if profile is missing
        const progStr = localStorage.getItem('lkpd_progress');
        const progList: GroupProgress[] = progStr ? JSON.parse(progStr) : [];
        const foundProg = progList.find(p => 
          p.groupName?.trim().replace(/\s+/g, ' ').toLowerCase() === inputGroupTrimmed.toLowerCase()
        );

        if (foundProg && !foundUser) {
          const generatedEmail = getEmailForGroup(foundProg.groupName);
          foundUser = {
            uid: foundProg.uid,
            email: generatedEmail,
            role: 'student',
            groupName: foundProg.groupName,
            leaderName: foundProg.leaderName,
            members: foundProg.members,
            createdAt: foundProg.updatedAt || new Date().toISOString()
          };
          usersList.push(foundUser);
          localStorage.setItem('lkpd_users', JSON.stringify(usersList));
        }

        if (!foundUser) {
          throw new Error("Nama kelompok tidak ditemukan atau belum terdaftar! Silakan daftarkan terlebih dahulu.");
        }

        // Look up correct password via sanitized email address
        const generatedEmail = getEmailForGroup(foundUser.groupName || lGroup);
        const correctPass = passMap[generatedEmail] === lPassword;
        const isBypass = lPassword === 'siswa123'; // Sandbox fallback password

        if (!correctPass && !isBypass) {
          throw new Error("Kata sandi kelompok Anda salah! Silakan coba lagi.");
        }

        const foundProgFinal = foundProg || progList.find(p => p.uid === foundUser?.uid);

        localStorage.setItem('lkpd_current_user', JSON.stringify(foundUser));
        if (foundProgFinal) {
          localStorage.setItem('lkpd_current_progress', JSON.stringify(foundProgFinal));
          setStudentProgress(foundProgFinal);
        }

        setUser({ uid: foundUser.uid, email: foundUser.email });
        setProfile(foundUser);
        setView('DASHBOARD');
      } else {
        // Teacher
        if (!lEmail.trim() || !lPassword) {
          throw new Error("Isikan email guru dan password!");
        }
        const foundUser = usersList.find(u => u.email.toLowerCase() === lEmail.trim().toLowerCase() && u.role === 'admin');
        const correctPass = passMap[lEmail.trim().toLowerCase()] === lPassword;

        if ((lEmail.trim().toLowerCase() === 'syifasirait21@gmail.com' || lEmail.trim().toLowerCase() === 'guru@sch.id') && lPassword === 'guru123') {
          const adminProfile: UserProfile = foundUser || {
            uid: 'local_admin_bypass',
            email: lEmail.trim().toLowerCase(),
            role: 'admin',
            username: "Bapak/Ibu Guru (Bypass)",
            createdAt: new Date().toISOString()
          };
          
          if (!foundUser) {
            usersList.push(adminProfile);
            localStorage.setItem('lkpd_users', JSON.stringify(usersList));
            passMap[lEmail.trim().toLowerCase()] = 'guru123';
            localStorage.setItem('lkpd_passwords', JSON.stringify(passMap));
          }

          localStorage.setItem('lkpd_current_user', JSON.stringify(adminProfile));
          setUser({ uid: adminProfile.uid, email: adminProfile.email });
          setProfile(adminProfile);

          const allProgStr = localStorage.getItem('lkpd_progress');
          if (allProgStr) {
            setAllGroups(JSON.parse(allProgStr));
          }

          setView('GURU');
          setActionLoading(false);
          return;
        }

        if (!foundUser || !correctPass) {
          throw new Error("E-mail guru tidak ditemukan atau password salah. (Bypass: syifasirait21@gmail.com / guru123)");
        }

        localStorage.setItem('lkpd_current_user', JSON.stringify(foundUser));
        setUser({ uid: foundUser.uid, email: foundUser.email });
        setProfile(foundUser);

        const allProgStr = localStorage.getItem('lkpd_progress');
        if (allProgStr) {
          setAllGroups(JSON.parse(allProgStr));
        }

        setView('GURU');
      }
    } catch (err: any) {
      console.error("Login err:", err);
      setLError(err.message || String(err));
    } finally {
      setActionLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    setLoading(true);
    
    localStorage.removeItem('lkpd_current_user');
    localStorage.removeItem('lkpd_current_progress');
    
    setUser(null);
    setProfile(null);
    setStudentProgress(null);
    
    // Maintain the list of groups loaded so users can easily select them to login
    const allProg = localStorage.getItem('lkpd_progress');
    if (allProg) {
      try {
        setAllGroups(JSON.parse(allProg));
      } catch (e) {
        setAllGroups([]);
      }
    }
    
    setView('LANDING');
    setLoading(false);
  };

  // Step Navigations
  const handleNextStep = async () => {
    if (!studentProgress) return;
    const next = studentProgress.currentStep + 1;
    if (next <= 5) {
      await triggerAutosave(studentProgress.answers, next);
    } else {
      const finalAnswers = studentProgress.answers;
      const updatedProg = {
        ...studentProgress,
        isCompleted: true,
        answers: finalAnswers,
        currentStep: 5,
        updatedAt: new Date().toISOString()
      };

      setStudentProgress(updatedProg);

      localStorage.setItem('lkpd_current_progress', JSON.stringify(updatedProg));

      const allProgStr = localStorage.getItem('lkpd_progress');
      let allProgList = allProgStr ? JSON.parse(allProgStr) : [];
      const index = allProgList.findIndex((p: any) => p.uid === user!.uid);
      if (index !== -1) {
        allProgList[index] = updatedProg;
      } else {
        allProgList.push(updatedProg);
      }
      localStorage.setItem('lkpd_progress', JSON.stringify(allProgList));

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setView('DASHBOARD');
    }
  };

  const handlePrevStep = async () => {
    if (!studentProgress) return;
    const prev = studentProgress.currentStep - 1;
    if (prev >= 1) {
      await triggerAutosave(studentProgress.answers, prev);
    }
  };

  // Teacher feedback submission
  const saveTeacherEvaluation = async () => {
    if (!selectedGroup) return;
    setActionLoading(true);
    const updatedProg = {
      ...selectedGroup,
      teacherScore: Number(teacherScoreInput),
      teacherFeedback: teacherFeedbackInput
    };

    const progStr = localStorage.getItem('lkpd_progress');
    let progList = progStr ? JSON.parse(progStr) : [];
    const index = progList.findIndex((p: any) => p.uid === selectedGroup.uid);
    if (index !== -1) {
      progList[index] = updatedProg;
    } else {
      progList.push(updatedProg);
    }
    localStorage.setItem('lkpd_progress', JSON.stringify(progList));

    setAllGroups(progList);
    setSelectedGroup(updatedProg);

    confetti({
      particleCount: 60,
      colors: ['#10b981', '#3b82f6']
    });
    setActionLoading(false);
  };

  // Statistics calculation for teacher charts
  const totalCreatedGroups = allGroups.length;
  const stepCompletions = [0, 0, 0, 0, 0]; // count groups on step 1-5
  let totalEvaluated = 0;
  let runningScoreTotal = 0;

  allGroups.forEach(g => {
    if (g.currentStep >= 1 && g.currentStep <= 5) {
      stepCompletions[g.currentStep - 1] += 1;
    }
    if (g.teacherScore !== undefined) {
      totalEvaluated += 1;
      runningScoreTotal += g.teacherScore;
    }
  });

  const averageScore = totalEvaluated > 0 ? Math.round(runningScoreTotal / totalEvaluated) : 100;

  // Chart configs
  const chartDataBar = {
    labels: ['Langkah 1', 'Langkah 2', 'Langkah 3', 'Langkah 4', 'Langkah 5'],
    datasets: [
      {
        label: 'Kelompok Aktif',
        data: stepCompletions,
        backgroundColor: 'rgba(59, 130, 246, 0.4)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const chartDataPie = {
    labels: ['Tuntas Evaluasi', 'Belum Dinilai'],
    datasets: [
      {
        data: [totalEvaluated, totalCreatedGroups - totalEvaluated],
        backgroundColor: ['rgba(34, 197, 94, 0.4)', 'rgba(245, 158, 11, 0.4)'],
        borderColor: ['#22c55e', '#f59e0b'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/10 via-sky-50/20 to-amber-50/10 flex flex-col relative">
      
      {/* Decorative Cloud Header Background */}
      <div className="absolute top-0 inset-x-0 h-40 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 320%22%3E%3Cpath fill=%22%23e0f2fe%22 fill-opacity=%220.6%22 d=%22M0,96L120,112C240,128,480,160,720,144C960,128,1200,64,1320,32L1440,0L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z%22%3E%3C/path%3E%3C/svg%3E')] bg-cover opacity-60 pointer-events-none" />

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-slate-100 shadow-xs px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('LANDING')}>
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-xl font-bold">
            🌍
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none">{SCHOOL_INFO.title}</h1>
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1 block tracking-wider uppercase font-mono">{SCHOOL_INFO.level}</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-650">
          <button onClick={() => setView('LANDING')} className={view === 'LANDING' ? "text-emerald-500 font-extrabold" : "hover:text-emerald-500 cursor-pointer"}>Home</button>
          <button onClick={() => setView('ABOUT')} className={view === 'ABOUT' ? "text-emerald-500 font-extrabold" : "hover:text-emerald-500 cursor-pointer"}>Tentang LKPD</button>
          <button onClick={() => setView('MATERI')} className={view === 'MATERI' ? "text-emerald-500 font-extrabold" : "hover:text-emerald-500 cursor-pointer"}>Materi</button>
          {profile?.role === 'student' && (
            <button onClick={() => setView('DASHBOARD')} className={view === 'DASHBOARD' ? "text-emerald-500 font-extrabold" : "hover:text-emerald-500 cursor-pointer"}>Dashboard Kelompok</button>
          )}
          {profile?.role === 'admin' && (
            <button onClick={() => setView('GURU')} className={view === 'GURU' ? "text-emerald-500 font-extrabold" : "hover:text-emerald-500 cursor-pointer"}>Dashboard Guru</button>
          )}
        </div>

        {/* Auth status buttons */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-32 h-8 bg-slate-100 rounded-full animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-block text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full font-bold text-slate-600">
                {profile?.role === 'admin' ? "👨‍🏫 Guru/Admin" : `👥 Kelompok: ${profile?.groupName}`}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border-2 border-red-200 rounded-xl text-red-600 text-xs font-bold hover:bg-red-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Keluar</span>
              </button>
            </div>
          ) : null}
        </div>
      </nav>

      {/* --- RENDER PRIMARY VIEW --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 relative">



        <AnimatePresence mode="wait">
          
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center py-20 bg-white/30 rounded-2xl">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-500 animate-pulse">Menyiapkan Lembar Kerja Digital...</p>
            </div>
          ) : (
            <>
              {/* LANDING PAGE */}
              {view === 'LANDING' && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-12"
                >
                  {/* Hero Section */}
                  <div className="bg-gradient-to-r from-emerald-100/50 via-sky-100/40 to-amber-100/50 border-2 border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-inner relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                    
                    {/* Clouds visual items */}
                    <div className="absolute top-10 left-10 text-white/80 animate-pulse"><CloudSvg size={54} /></div>
                    <div className="absolute top-24 right-1/4 text-white hover:scale-115 transition-all cursor-default"><CloudSvg size={80} /></div>

                    <div className="space-y-6 max-w-2xl relative z-10">
                      <span className="px-4 py-1.5 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-heavy rounded-full tracking-wider font-mono">
                        🧭 PENDEKATAN PROBLEM BASED LEARNING
                      </span>
                      <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                        Ayo Selidiki <span className="text-emerald-500 underline decoration-emerald-250">Struktur Bumi</span> & Tangguh Menghadapi Bencana!
                      </h1>
                      <p className="text-slate-600 font-medium leading-relaxed text-sm md:text-base">
                        LKPD interaktif Kurikulum Merdeka ini melatih siswa berkemampuan berpikir kritis, kolaboratif, kreatif, dan cerdas memecahkan kasus banjir dan longsor di Tanah Rencong Aceh. Temukan solusi mitigasi terbaik inovatif kelompokmu!
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            if (user) {
                              setView(profile?.role === 'admin' ? 'GURU' : 'DASHBOARD');
                            } else {
                              setRegRole('student');
                              setView('REGISTER');
                            }
                          }}
                          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-lg rounded-[1.2rem] text-sm font-black transition-all cursor-pointer flex items-center gap-2"
                        >
                          <BookOpen size={18} />
                          <span>Mulai Belajar Sekarang</span>
                        </button>
                      </div>
                    </div>

                    {/* Vector / CSS Cartoon earth and mountains simulation */}
                    <div className="w-full max-w-[340px] shrink-0 relative flex items-center justify-center p-4">
                      <div className="relative w-72 h-72 bg-gradient-to-tr from-sky-200 to-green-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                        {/* CSS animated hills & tree */}
                        <div className="absolute bottom-0 inset-x-0 h-28 bg-emerald-400 rounded-t-[5rem] flex flex-col items-center justify-center">
                          <span className="text-2xl animate-bounce">🌳</span>
                          <span className="text-3xl mt-[-6px]">🏡</span>
                        </div>
                        {/* Water ripple */}
                        <div className="absolute bottom-0 inset-x-0 h-10 bg-cyan-400 opacity-60 animate-pulse" />
                        
                        {/* Earth visual center */}
                        <div className="absolute top-10 flex flex-col items-center">
                          <div className="w-20 h-20 rounded-full bg-cyan-300 border-2 border-white flex items-center justify-center text-3xl shadow-md animate-spin-slow">
                            🌍
                          </div>
                          <span className="text-xs font-black text-emerald-800 mt-2 bg-white/80 px-3 py-1 rounded-full border border-emerald-200">
                            Bumi Aceh Lestari
                          </span>
                        </div>
                      </div>
                      
                      {/* Studing child emblem */}
                      <div className="absolute bottom-2 -left-2 bg-white border border-slate-200 p-3 rounded-[1.2rem] shadow-md text-center max-w-[120px]">
                        <span className="text-xl">🎒</span>
                        <p className="text-[9px] font-black text-slate-800 uppercase tracking-wide mt-1">Siswa SMP Siaga Aceh</p>
                      </div>
                    </div>

                  </div>

                  {/* PBL Steps Feature Cards Grid */}
                  <div className="space-y-6">
                    <div className="text-center max-w-lg mx-auto">
                      <h2 className="text-2xl font-black text-slate-800">5 Siklus Problem Based Learning (PBL)</h2>
                      <p className="text-xs text-slate-500 mt-1">Tiap tahapan melatih kompetensi mitigasi bencana secara terukur</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {[
                        { step: "1", title: "Orientasi Masalah", desc: "Menganalisis kasus nyata banjir dan genangan sungai di Aceh.", color: "bg-red-50 hover:bg-red-100 border-red-200", icon: "🔴" },
                        { step: "2", title: "Organisasi Belajar", desc: "Mengelompokkan faktor alami & aktivitas manusia.", color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200", icon: "🟢" },
                        { step: "3", title: "Penyelidikan Mandiri", desc: "Mengisi tabel analisis siber BMKG & data lapangan.", color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200", icon: "🔵" },
                        { step: "4", title: "Rancang Solusi", desc: "Mengembangkan 4 pilar mitigasi & karya poster kreatif.", color: "bg-orange-50 hover:bg-orange-100 border-orange-200", icon: "🟡" },
                        { step: "5", title: "Uji & Evaluasi", desc: "Menilai kelayakan & merombak solusi untuk masa depan.", color: "bg-teal-50 hover:bg-teal-100 border-teal-200", icon: "🟣" }
                      ].map((card) => (
                        <div key={card.step} className={cn("p-5 border-2 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.02]", card.color)}>
                          <div className="space-y-2">
                            <span className="text-2xl">{card.icon}</span>
                            <h3 className="font-extrabold text-sm text-slate-800 leading-tight">
                              Langkah {card.step}: {card.title}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-3 leading-relaxed">{card.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* TENTANG LKPD PAGE */}
              {view === 'ABOUT' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-2 border-slate-200 rounded-[2.5rem] p-8 md:p-12 space-y-8 shadow-sm max-w-3xl mx-auto"
                >
                  <div className="space-y-2 text-center">
                    <span className="text-4xl text-emerald-400">🏫</span>
                    <h2 className="text-2xl font-black text-slate-800">Tentang LKPD Interaktif Kurikulum Merdeka</h2>
                    <p className="text-xs text-slate-400">Lembar Kerja digital interaktif berstandar akademik</p>
                  </div>

                  <div className="prose text-sm text-slate-600 leading-relaxed font-normal space-y-4">
                    <p>
                      Media pembelajaran digital <strong>Problem Based Learning (PBL)</strong> khusus disusun untuk melatih pemahaman materi sains Struktur Bumi dan kebencanaan pada tingkat Sekolah Menengah Pertama (SMP) Kelas 8. Menghikmati geografi bumi Aceh, siswa tidak lagi sekedar menghafal tetapi menyelidiki solusi kebencanaan secara kolaboratif.
                    </p>
                    <p>
                      Dibuat oleh <strong>{SCHOOL_INFO.designer}</strong> bersama pendampingan ahli di Universitas Syiah Kuala.
                    </p>
                  </div>

                  {/* Capaian Pembelajaran & Tujuan Pembelajaran */}
                  <div className="space-y-6 pt-2">
                    <div className="bg-emerald-55/40 border border-emerald-100 rounded-2xl p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Target size={18} /></span>
                        <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Capaian Pembelajaran (CP)</h3>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <p className="font-bold text-slate-700">{CAPAIAN_PEMBELAJARAN.fase}</p>
                        <p className="leading-relaxed italic">"{CAPAIAN_PEMBELAJARAN.deskripsi}"</p>
                      </div>
                    </div>

                    <div className="bg-sky-50/40 border border-sky-100 rounded-2xl p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-sky-100 text-sky-600 rounded-lg"><Sparkles size={18} /></span>
                        <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Tujuan Pembelajaran (TP)</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                        {TUJUAN_PEMBELAJARAN.map((obj, i) => (
                          <div key={obj.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-2xs flex gap-2.5 items-start transition-all hover:border-sky-205">
                            <span className="pt-0.5 text-base">{obj.icon}</span>
                            <div>
                              <p className="font-bold text-[9px] text-sky-600 tracking-wider uppercase font-mono mb-0.5">TP {i + 1}</p>
                              <p className="leading-relaxed font-sans font-medium text-slate-650">{obj.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 rounded-2xl p-6">
                    <div className="space-y-2">
                      <p>🎓 Mata Kuliah: Kajian Pembelajaran IPA inovatif</p>
                      <p>👨‍🏫 Dosen Pengampu: Dr. Susilawati, S.Pd., M.Ed.</p>
                    </div>
                    <div className="space-y-2">
                      <p>✨ Universitas: Universitas Syiah Kuala</p>
                      <p>🔐 Lokasi : Banda Aceh, Indonesia </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MATERI EKSTRA */}
              {view === 'MATERI' && (
                <motion.div
                  key="materi"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center max-w-md mx-auto space-y-1">
                    <span className="text-3xl">🌋</span>
                    <h2 className="text-2xl font-black text-slate-800">Buku Saku Mitigasi Bencana Bumi</h2>
                    <p className="text-xs text-slate-400">Gunakan sebagai panduan melakukan penyelidikan mandiri di Langkah 3</p>
                  </div>

                  {/* Target Pembelajaran Expandable Section */}
                  <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 max-w-4xl mx-auto">
                    <button 
                      onClick={() => setShowTargetsInMateri(!showTargetsInMateri)}
                      className="w-full flex items-center justify-between text-left font-sans font-medium cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Target size={18} /></span>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Target Pembelajaran (CP & TP)</h3>
                          <p className="text-[10px] text-slate-400">Klik untuk melihat Capaian dan Tujuan Pembelajaran Kurikulum Merdeka</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full font-black text-slate-600 transition-all">
                        {showTargetsInMateri ? "Sembunyikan" : "Tampilkan"}
                      </span>
                    </button>

                    {showTargetsInMateri && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-4 border-t border-slate-100 space-y-4 text-xs"
                      >
                        <div className="bg-emerald-50/50 p-4 rounded-xl space-y-1.5">
                          <p className="font-bold text-emerald-800 uppercase tracking-wider text-[9px] font-mono">Capaian Pembelajaran (CP)</p>
                          <p className="leading-relaxed text-slate-700 italic">"{CAPAIAN_PEMBELAJARAN.deskripsi}"</p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-sky-800 uppercase tracking-wider text-[9px] font-mono">Tujuan Pembelajaran (TP)</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {TUJUAN_PEMBELAJARAN.map((obj, i) => (
                              <div key={obj.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-2.5 items-start">
                                <span className="text-base">{obj.icon}</span>
                                <div>
                                  <p className="font-extrabold text-[8px] text-sky-600 tracking-wider font-mono mb-0.5">TP {i + 1}</p>
                                  <p className="leading-relaxed font-sans font-medium text-slate-600">{obj.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Petunjuk Pengerjaan LKPD */}
                        <div className="space-y-2 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="p-1 bg-amber-500 text-white rounded text-[10px]"><BookOpen size={12} /></span>
                            <p className="font-bold text-amber-800 uppercase tracking-wider text-[9px] font-mono">Petunjuk Pengerjaan LKPD Interaktif</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                            {[
                              { step: 1, title: "Orientasi Masalah", desc: "Pahami masalah banjir/longsor di Langkah 1 & 2 secara saksama.", icon: "📖" },
                              { step: 2, title: "Kliping & Kategori", desc: "Buat kliping mitigasi bencana serta prioritaskan urgensi masalah.", icon: "📌" },
                              { step: 3, title: "Kajian Mandiri", desc: "Manfaatkan Buku Saku Mitigasi ini untuk landasan ilmiah kelompok.", icon: "🔍" },
                              { step: 4, title: "Rekayasa Solusi", desc: "Rancang rekayasa solusi bencana yang kreatif dan berdampak nyata.", icon: "💡" },
                              { step: 5, title: "Refleksi & Kirim", desc: "Isi lembar evaluasi kontribusi kerja tim dan kirim berkas final.", icon: "🏁" }
                            ].map((p) => (
                              <div key={p.step} className="p-3 bg-amber-50/30 border border-amber-100/70 rounded-xl space-y-1 hover:border-amber-200 transition-all">
                                <div className="flex items-center justify-between text-[9px] font-black font-mono text-slate-400">
                                  <span>{p.icon}</span>
                                  <span className="bg-white px-1.5 py-0.5 rounded border border-slate-100 text-[8px]">Step {p.step}</span>
                                </div>
                                <h4 className="font-extrabold text-[10px] text-slate-800 leading-tight">{p.title}</h4>
                                <p className="text-[9px] text-slate-500 leading-normal font-sans font-medium">{p.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <hr className="border-slate-100" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MATERI_LIST.map((mat) => (
                      <div key={mat.id} className={cn("border-2 rounded-2xl p-6 transition-all hover:scale-[1.01] hover:shadow-md", mat.color)}>
                        <h3 className="font-extrabold text-base mb-3 flex items-center gap-1.5">
                          {mat.title}
                        </h3>
                        <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans font-medium">
                          {mat.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* LOGIN SCREEN */}
              {view === 'LOGIN' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-md mx-auto bg-white border-2 border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6"
                >
                  <div className="text-center space-y-1.5">
                    <span className="text-3xl">🔑</span>
                    <h2 className="text-2xl font-black text-slate-800">Masuk Aplikasi</h2>
                    <p className="text-xs text-slate-400">Siswa silakan pilih tab kelompok dan masukkan sandi Anda</p>
                  </div>



                  {/* Tabs Login Role (Siswa / Guru) */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      onClick={() => setAuthRole('student')}
                      className={cn(
                        "py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer",
                        authRole === 'student' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      👥 Kelompok Siswa
                    </button>
                    <button
                      onClick={() => setAuthRole('guru')}
                      className={cn(
                        "py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer",
                        authRole === 'guru' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      👨‍🏫 Bapak/Ibu Guru
                    </button>
                  </div>

                  {/* Formulir */}
                  <form onSubmit={handleLogin} className="space-y-4 font-sans">
                    {authRole === 'student' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">Nama Kelompok</label>
                        <input
                          type="text"
                          required
                          className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:border-emerald-400 focus:outline-none bg-slate-50/50"
                          placeholder="Contoh: Kelompok Seulawah"
                          value={lGroup}
                          onChange={(e) => setLGroup(e.target.value)}
                        />


                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">E-mail Guru</label>
                        <input
                          type="email"
                          required
                          className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:border-sky-400 focus:outline-none bg-slate-50/50"
                          placeholder="syifasirait21@gmail.com"
                          value={lEmail}
                          onChange={(e) => setLEmail(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">Password</label>
                      <input
                        type="password"
                        required
                        className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:border-emerald-400 focus:outline-none bg-slate-50/50"
                        placeholder="••••••••"
                        value={lPassword}
                        onChange={(e) => setLPassword(e.target.value)}
                      />
                    </div>

                    {lError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex gap-2 items-center">
                        <AlertTriangle size={16} />
                        <span>{lError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-white shadow-md shadow-emerald-500/10 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? "Sedang Masuk..." : "Masuk Kelas"}
                    </button>
                  </form>

                  <p className="text-[11px] text-center text-slate-500">
                    Belum mendaftarkan kelompok kelompok?{" "}
                    <button onClick={() => setView('REGISTER')} className="text-emerald-500 font-bold hover:underline cursor-pointer">Daftar sekarang</button>
                  </p>
                </motion.div>
              )}

              {/* REGISTER SCREEN */}
              {view === 'REGISTER' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-md mx-auto bg-white border-2 border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6"
                >
                  <div className="text-center space-y-1.5">
                    <span className="text-3xl">📝</span>
                    <h2 className="text-2xl font-black text-slate-800">Daftar Akun Baru</h2>
                    <p className="text-xs text-slate-400">Silakan daftarkan kelompok Anda atau sebagai guru/admin kelas</p>
                  </div>



                  {/* Tabs signup roles */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      onClick={() => setRegRole('student')}
                      className={cn(
                        "py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer",
                        regRole === 'student' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      👥 Kelompok Siswa
                    </button>
                    <button
                      onClick={() => setRegRole('guru')}
                      className={cn(
                        "py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer",
                        regRole === 'guru' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      👨‍🏫 Bapak/Ibu Guru
                    </button>
                  </div>

                  {/* Formulir */}
                  <form onSubmit={handleRegister} className="space-y-4">
                    {regRole === 'student' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-650 mb-1 uppercase tracking-wide">Nama Kelompok</label>
                          <input
                            type="text"
                            required
                            className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-400 focus:outline-none bg-slate-50/50"
                            placeholder="Contoh: Kelompok Tsunami Aceh"
                            value={rGroup}
                            onChange={(e) => setRGroup(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-650 mb-1 uppercase tracking-wide">Nama Ketua Kelompok</label>
                          <input
                            type="text"
                            required
                            className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-400 focus:outline-none bg-slate-50/50"
                            placeholder="Tulis nama ketua tim..."
                            value={rLeader}
                            onChange={(e) => setRLeader(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-650 mb-1 uppercase tracking-wide">Nama Anggota Kelompok (Batasi dengan Koma)</label>
                          <textarea
                            required
                            className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-400 focus:outline-none bg-slate-50/50 h-20"
                            placeholder="Maimun, Zainuddin, Syarifah, Khairani"
                            value={rMembers}
                            onChange={(e) => setRMembers(e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1 uppercase tracking-wide">E-mail Guru (Akses Valid)</label>
                        <input
                          type="email"
                          required
                          className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs focus:border-sky-400 focus:outline-none bg-slate-50/50"
                          placeholder="Contoh: guru@sekolah.sch.id"
                          value={rEmail}
                          onChange={(e) => setREmail(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-650 mb-1 uppercase tracking-wide">Sandi / Password Akun</label>
                      <input
                        type="password"
                        required
                        className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs focus:border-emerald-400 focus:outline-none bg-slate-50/50"
                        placeholder="Minimal 6 karakter..."
                        value={rPassword}
                        onChange={(e) => setRPassword(e.target.value)}
                      />
                    </div>

                    {rError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex gap-2 items-center">
                        <AlertTriangle size={16} />
                        <span>{rError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-white shadow-md shadow-emerald-500/10 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? "Sedang Mendaftarkan..." : "Mendaftarkan & Mulai Belajar"}
                    </button>
                  </form>

                  <p className="text-[11px] text-center text-slate-500 animate-pulse">
                    Sudah memiliki akun?{" "}
                    <button onClick={() => setView('LOGIN')} className="text-emerald-500 font-bold hover:underline cursor-pointer">Login sekarang</button>
                  </p>
                </motion.div>
              )}

              {/* STUDENT DASHBOARD */}
              {view === 'DASHBOARD' && (
                <motion.div
                  key="studentDashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  
                  {/* Banner Kelompok */}
                  <div className="bg-gradient-to-r from-emerald-50 via-sky-50 to-amber-50 border-2 border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">👥</span>
                        <h2 className="text-2xl font-black text-slate-800">
                          Selamat Datang Kelompok: <span className="text-emerald-500">{profile?.groupName}</span>
                        </h2>
                      </div>
                      
                      {/* Anggota */}
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-650">
                        <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-2.5 py-1 rounded-full">
                          👑 Ketua: {profile?.leaderName}
                        </span>
                        {(profile?.members || []).map((m) => (
                          <span key={m} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-500">
                            Member: {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setView('MODULE')}
                      className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-extrabold shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
                    >
                      <Sparkles size={16} />
                      <span>{studentProgress?.currentStep && studentProgress.currentStep > 1 ? "Lanjutkan Pembelajaran" : "Mulai Pembelajaran LKPD"}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Capaian Pembelajaran & Tujuan Pembelajaran (Presented after Registration/Login) */}
                  <div
                    className="border-2 border-emerald-100 bg-emerald-50/20 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-xs"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-5">
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-inner shadow-emerald-600/20">
                          <Target size={20} />
                        </span>
                        <div>
                          <span className="text-[9px] bg-emerald-200/60 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono">
                            Target Kurikulum Merdeka
                          </span>
                          <h2 className="text-lg md:text-xl font-black text-slate-800 mt-0.5">Capaian & Tujuan Pembelajaran</h2>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-3xs">
                        {CAPAIAN_PEMBELAJARAN.fase}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Capaian Box */}
                      <div className="lg:col-span-1 bg-white border border-emerald-100 rounded-2xl p-5 shadow-3xs space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-emerald-600 tracking-wider uppercase font-mono block">Capaian Pembelajaran (CP)</span>
                          <h3 className="font-extrabold text-xs text-slate-800 leading-tight">Sains & Mitigasi Kebencanaan</h3>
                          <p className="text-xs text-slate-500 leading-relaxed italic">
                            "{CAPAIAN_PEMBELAJARAN.deskripsi}"
                          </p>
                        </div>
                        <div className="bg-emerald-50/60 rounded-xl p-3 text-[10px] text-emerald-800 font-bold border border-emerald-100/30 mt-2">
                          💡 Memahami struktur bumi dan memetakan aksi mitigasi bencana banjir/longsor di Aceh secara kolaboratif.
                        </div>
                      </div>

                      {/* Tujuan Box */}
                      <div className="lg:col-span-2 space-y-3">
                        <span className="text-[9px] font-black text-sky-600 tracking-wider uppercase font-mono block">Tujuan Pembelajaran (TP) Kelas VIII</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {TUJUAN_PEMBELAJARAN.map((obj, i) => (
                            <div 
                              key={obj.id} 
                              className="p-3.5 bg-white border border-slate-100 hover:border-sky-305 rounded-xl shadow-4xs flex gap-2.5 items-start transition-all"
                            >
                              <span className="text-lg pt-0.5">{obj.icon}</span>
                              <div>
                                <p className="font-extrabold text-[8px] text-sky-600 tracking-wider uppercase font-mono mb-0.5">Tujuan {i + 1}</p>
                                <p className="leading-relaxed font-sans font-semibold text-[11px] text-slate-700">{obj.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-emerald-100/50" />

                    {/* Petunjuk Pengerjaan */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
                          <BookOpen size={14} />
                        </span>
                        <div>
                          <span className="text-[9px] bg-amber-200/60 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono">
                            Alur Aktivitas PBL
                          </span>
                          <h3 className="font-extrabold text-xs md:text-sm text-slate-800 mt-0.5">Petunjuk Pengerjaan LKPD Interaktif</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                        {[
                          {
                            step: 1,
                            title: "Orientasi Masalah",
                            desc: "Diskusikan pertanyaan pemantik kebencanaan di Aceh secara orisinal bersama kelompok.",
                            icon: "📖",
                          },
                          {
                            step: 2,
                            title: "Kliping & Kategori",
                            desc: "Pilih kliping bencana mitigasi, lalu buat list prioritas masalah sesuai urgensinya.",
                            icon: "📌",
                          },
                          {
                            step: 3,
                            title: "Kajian & Data",
                            desc: "Kumpulkan bahan referensi ilmiah pendukung menggunakan menu Buku Saku Mitigasi.",
                            icon: "🔍",
                          },
                          {
                            step: 4,
                            title: "Rekayasa Solusi",
                            desc: "Rancang rekayasa solusi konstruktif/sosial yang inovatif dan relevan dengan daerah setempat.",
                            icon: "💡",
                          },
                          {
                            step: 5,
                            title: "Refleksi & Kirim",
                            desc: "Lakukan penilaian jujur kontribusi tim dan kirim jawaban final agar dapat dinilai oleh Guru.",
                            icon: "🏁",
                          }
                        ].map((p) => (
                          <div 
                            key={p.step} 
                            className="p-3.5 bg-amber-50/20 hover:bg-amber-50/40 border border-amber-105 rounded-2xl transition-all flex flex-col justify-between space-y-2 shadow-4xs"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-base">{p.icon}</span>
                                <span className="text-[8px] bg-white border border-slate-100 px-2 py-0.5 rounded-full font-black text-slate-500">
                                  Step {p.step}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-[11px] text-slate-800 leading-tight">{p.title}</h4>
                              <p className="text-[10px] text-slate-500 leading-normal font-sans font-medium">{p.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Kemajuan Studi & Nilai */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Status Penyelesaian */}
                    <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <ClipboardCheck className="text-emerald-500" />
                        Status Penyelesaian Tiap Langkah PBL
                      </h3>
                      
                      <div className="space-y-4">
                        {[
                          { step: 1, title: "Orientasi Masalah", badge: "Karakteristik Kasus Banjir Aceh" },
                          { step: 2, title: "Mengorganisasi Belajar", badge: "Fakta Genesa Alami vs Manusia" },
                          { step: 3, title: "Penyelidikan Mandiri", badge: "Analisis Siber & Input Data Temuan" },
                          { step: 4, title: "Penyajian Solusi", badge: "Kategori Mitigasi & Karya Kreatif" },
                          { step: 5, title: "Analisis & Evaluasi", badge: "Skor Mandiri & Refleksi Kerja" }
                        ].map((s) => {
                          const isActive = studentProgress?.currentStep === s.step;
                          const isDone = (studentProgress?.currentStep || 1) > s.step || studentProgress?.isCompleted;
                          return (
                            <div key={s.step} className="flex items-center justify-between border-b border-slate-50 pb-2 flex-wrap gap-2 text-xs">
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "w-6 h-6 rounded-full font-bold flex items-center justify-center text-[10px]",
                                  isDone ? "bg-emerald-500 text-white" : isActive ? "bg-amber-400 text-slate-800" : "bg-slate-100 text-slate-400"
                                )}>
                                  {isDone ? "✓" : s.step}
                                </span>
                                <div>
                                  <h4 className="font-bold text-slate-800">{s.title}</h4>
                                  <p className="text-[10px] text-slate-400">{s.badge}</p>
                                </div>
                              </div>
                              <span className={cn(
                                "px-2.5 py-1 rounded-full font-bold uppercase text-[9px]",
                                isDone ? "bg-emerald-50 text-emerald-600" : isActive ? "bg-amber-50 text-amber-600 animate-pulse" : "bg-slate-50 text-slate-400"
                              )}>
                                {isDone ? "Selesai" : isActive ? "Sedang Dikerjakan" : "Menunggu"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Evaluasi Guru Column */}
                    <div className="space-y-6">
                      
                      {/* Nilai Evaluasi Card */}
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-250 rounded-[2rem] p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-1.5 border-b border-yellow-200 pb-2">
                          <Trophy className="text-yellow-500 animate-pulse" />
                          Hasil Review & Nilai Evaluasi Guru
                        </h3>

                        {studentProgress?.teacherScore !== undefined ? (
                          <div className="flex items-center gap-5">
                            <div className="w-20 h-20 bg-yellow-400 border-4 border-white shadow-md rounded-full flex flex-col items-center justify-center text-white shrink-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Skor</span>
                              <span className="text-2xl font-black">{studentProgress.teacherScore}</span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-850 text-sm">Umpan Balik Guru Terkait Solusi:</h4>
                              <p className="text-xs text-slate-650 italic leading-relaxed bg-white border border-yellow-100/50 rounded-xl p-3">
                                "{studentProgress.teacherFeedback || 'Solusi kalian luar biasa kreatif! Silakan dikembangkan.'}"
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-center py-6 text-slate-400">
                            <span className="text-4xl block">⏳</span>
                            <p className="text-xs font-bold font-sans">Belum Dinilai oleh Bapak/Ibu Guru.</p>
                            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Setelah seluruh kelompok Anda menuntaskan isi Langkah 5 dan menyerahkan, Bapak/Ibu guru akan memasukkan nilai evaluasi di sini.</p>
                          </div>
                        )}
                      </div>

                      {/* Info Box */}
                      <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-5 flex gap-3.5 shadow-xs">
                        <span className="p-2.5 bg-sky-50 text-sky-500 rounded-xl self-start"><Info size={18} /></span>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Koreksi & Penyimpanan Otomatis (AutoSave)</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Aplikasi LKPD ini dilengkapi dengan teknologi <strong>Penyimpanan Otomatis (AutoSave)</strong>. Tiap huruf yang kalian ketik, checklist yang dicentang, atau data baris tabel yang diubah akan disimpan secara otomatis. Pekerjaan kelompok tetap aman sekalipun halaman tidak sengaja tertutup atau komputer mati mendadak!
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>

                </motion.div>
              )}

              {/* MODULE WORKSPACE */}
              {view === 'MODULE' && studentProgress && (
                <motion.div
                  key="moduleLayout"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  
                  {/* Top Progress bar */}
                  <div className="bg-white border-2 border-slate-100 rounded-[1.8rem] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setView('DASHBOARD')}
                        className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 cursor-pointer text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <ChevronLeft size={16} />
                        <span>Kembalikan ke Dashboard</span>
                      </button>
                    </div>

                    {/* Progress tracking display circles */}
                    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto py-1">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const isActive = studentProgress.currentStep === s;
                        const isDone = studentProgress.currentStep > s || studentProgress.isCompleted;
                        return (
                          <div key={s} className="flex items-center shrink-0">
                            <div className="flex flex-col items-center">
                              <span className={cn(
                                "w-7 h-7 rounded-full font-black text-xs flex items-center justify-center transition-all border-2",
                                isDone 
                                  ? "bg-emerald-500 border-emerald-500 text-white" 
                                  : isActive 
                                    ? "bg-amber-400 border-amber-400 text-slate-800"
                                    : "bg-slate-105 border-slate-200 text-slate-400"
                              )}>
                                {s}
                              </span>
                            </div>
                            {s < 5 && (
                              <div className={cn(
                                "w-6 md:w-12 h-[3px] mx-1 rounded-full",
                                isDone ? "bg-emerald-500" : "bg-slate-200"
                              )} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP CONTENT SECTION */}
                  <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 border-2 border-slate-200/85">
                    <PBLSteps
                      currentStep={studentProgress.currentStep}
                      answers={studentProgress.answers || INITIAL_STUDENT_ANSWERS}
                      onChange={(updatedAnswers) => triggerAutosave(updatedAnswers)}
                      isAutosaving={isAutosaving}
                    />
                  </div>

                  {/* BOTTOM STEPS CONTROL (Kembali & lanjut) */}
                  <div className="flex items-center justify-between bg-white border-2 border-slate-100 rounded-[1.8rem] p-4 shadow-sm">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={studentProgress.currentStep <= 1}
                      className="px-5 py-3 border-2 border-slate-200 hover:border-slate-300 rounded-[1.2rem] text-xs font-bold text-slate-700 disabled:opacity-30 cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <ChevronLeft size={16} />
                      <span>Kembali</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className={cn(
                        "px-6 py-3 rounded-[1.2rem] text-xs font-black shadow-sm text-white transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.01]",
                        studentProgress.currentStep === 5 
                          ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10" 
                          : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/10"
                      )}
                    >
                      <span>{studentProgress.currentStep === 5 ? "Kirim Pekerjaan Kelompok" : "Pembelajaran Lanjut"}</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>

                </motion.div>
              )}

              {/* TEACHER/ADMIN WORKSPACE */}
              {view === 'GURU' && profile?.role === 'admin' && (
                <motion.div
                  key="teacherWorkspace"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  
                  {/* Statistik kelas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-[1.8rem] p-5 flex items-center justify-between shadow-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider font-mono">Total Kelompok Terdaftar</span>
                        <h4 className="text-2xl font-black text-slate-800 font-sans">{totalCreatedGroups}</h4>
                      </div>
                      <span className="text-3xl">👥</span>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-[1.8rem] p-5 flex items-center justify-between shadow-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider font-mono">Rata-Rata Nilas Solusi</span>
                        <h4 className="text-2xl font-black text-slate-800 font-sans">{averageScore} / 100</h4>
                      </div>
                      <span className="text-3xl">🏆</span>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-[1.8rem] p-5 flex items-center justify-between shadow-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider font-mono">Kelompok Tuntas Evaluasi</span>
                        <h4 className="text-2xl font-black text-slate-800 font-sans">{totalEvaluated} / {totalCreatedGroups}</h4>
                      </div>
                      <span className="text-3xl">🌟</span>
                    </div>

                  </div>

                  {/* Dashboard Visual Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Bar Chart kelompok */}
                    <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-3">
                      <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider">Sebaran Kelompok di Tiap Langkah PBL</h3>
                      <div 
                        key={`bar-chart-container-${allGroups.length}-${stepCompletions.join('-')}`}
                        className="h-64 flex items-center justify-center"
                      >
                        <Bar 
                          data={chartDataBar} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { ticks: { stepSize: 1 } } }
                          }} 
                        />
                      </div>
                    </div>

                    {/* Pie chart */}
                    <div className="bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-3">
                      <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider">Status Penilaian Solusi</h3>
                      <div 
                        key={`pie-chart-container-${allGroups.length}-${totalEvaluated}`}
                        className="h-64 flex items-center justify-center"
                      >
                        <Pie 
                          data={chartDataPie} 
                          options={{ responsive: true, maintainAspectRatio: false }} 
                        />
                      </div>
                    </div>

                  </div>

                  {/* Main container: Left table list of groups, Right drawer of answers */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left: Table Groups */}
                    <div className="lg:col-span-1 bg-white border-2 border-slate-200 rounded-[1.8rem] p-5 space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-2 flex items-center gap-1.5">
                        <Users size={18} className="text-emerald-500" />
                        <span>Daftar Kelompok Kelas VIII</span>
                      </h3>

                      {allGroups.length === 0 ? (
                        <div className="py-8 text-center space-y-4">
                          <p className="text-xs text-slate-400 italic">Belum ada kelompok yang terdaftar.</p>
                          <button
                            onClick={() => {
                                const dummyGroupsList: GroupProgress[] = [
                                  {
                                    uid: 'dummy_group_1',
                                    groupName: 'Kelompok Rencong',
                                    leaderName: 'Fajri Syahputra',
                                    members: ['Fajri', 'Nabila', 'Rahmat', 'Cut Meutia'],
                                    currentStep: 5,
                                    isCompleted: true,
                                    updatedAt: new Date().toISOString(),
                                    answers: {
                                      orientasi: {
                                        masalahUtama: 'Bencana banjir luapan sungai dan musibah tanah longsor di pemukiman warga lereng bukit curam wilayah Aceh.',
                                        penyebab: 'Intensitas curah hujan ekstrem tahunan dikombinasikan dengan berkurangnya daerah resapan air di pegunungan akibat tebang liar.',
                                        dampak: 'Putusnya akses jalan penghubung antarkabupaten, kerusakan fisik jembatan, kerugian materiil warga, serta potensi wabah pascabencana.'
                                      },
                                      organisasi: {
                                        selectedChecklists: ['c1', 'c2', 'c4', 'c5'],
                                        faktorAlami: ['Hujan deras terus-menerus', 'Lereng bukit terjal alami'],
                                        faktorManusia: ['Sumbatan sampah drainase', 'Pembalakan liar di hulu sungai'],
                                        diskusiLanjutan: 'Kami akan berfokus menyelidiki metode pembuatan sabuk hijau dan sistem drainase serapan bertingkat guna mitigasi terpadu.'
                                      },
                                      penyelidikan: {
                                        tableRows: [
                                          { id: 'row-1', info: 'Lumpur tebal menutupi pemukiman pasca banjir', sumber: 'Liputan Penyelidikan Aceh Barat', fakta: 'Sungai meluap melampaui tanggul darurat', hubungan: 'Struktur bumi berupa lapisan aluvial atas sangat mudah tergerus limpahan air deras' },
                                          { id: 'row-2', info: 'Lereng bukit jalan utama longsor menutup jalan', sumber: 'Dokumen BPBD Gayo Lues', fakta: 'Tanah lempung jenuh air karena hujan deras', hubungan: 'Struktur lapisan tanah kehilangan kohesi/perekat karena ketiadaan tali akar vegetasi pelindung' }
                                        ],
                                        catatanDiskusi: 'Sumber rujukan BPBD dan video lapangan membuktikan tata guna lahan lereng kritis memegang posisi sentral terjadinya bencana.'
                                      },
                                      solusi: {
                                        pencegahan: 'Penanaman pohon vetiver berakar dalam di lereng curam (reboisasi) dan pembuatan zonasi penataan pemukiman bebas bantaran sungai.',
                                        kesiapsiagaan: 'Membagikan pamflet evakuasi, melatih simulasi evakuasi berkala (smong mandiri), serta menyiapkan tas siaga bencana keluarga.',
                                        penanganan: 'Pendirian posko pengungsian tanggap darurat, penyiaran alarm tanda bahaya dini siber-fisik, dan pengerahan alat berat cepat.',
                                        pemulihan: 'Gotong royong pembersihan sarana umum, normalisasi saluran air, serta konseling trauma korban anak-anak.',
                                        solusiTerbaik: 'Integrasi penanaman rumput vetiver penahan longsor dengan revitalisasi drainase kota berkelanjutan.',
                                        alasanSolusiTerbaik: 'Solusi ini menyerang akar masalah dari faktor alami sekaligus faktor buatan manusia secara simultan, murah, dan ramah lingkungan.',
                                        rancanganSolusi: 'Membuat modul panduan saku untuk masyarakat mengenai penanaman mandiri tanaman vetiver di sekeliling tebing.',
                                        mediaPresentasi: ['Poster Infografis', 'PowerPoint Slide'],
                                        uploadedFileName: 'Rancangan_Mitigasi_Rencong.pdf',
                                        uploadedFileUrl: '#'
                                      },
                                      evaluasi: {
                                        kelayakan: 4,
                                        efektivitas: 4,
                                        dampakPositif: 4,
                                        keberlanjutan: 4,
                                        jawabanTerbaik: 'Integrasi solusi mitigasi struktural dan non-struktural.',
                                        kelebihan: 'Melibatkan kearifan lokal warga pesisir dan pegunungan daerah Aceh.',
                                        kelemahan: 'Membutuhkan waktu minimal 1-2 tahun untuk pertumbuhan vegetasi vetiver yang maksimal.',
                                        perbaikanSolusi: 'Menambahkan tumpukan geosintetis atau bronjong kawat penahan batu sementara sembari menunggu vetiver tumbuh.',
                                        refleksiKerjasama: 'Kelompok bekerja dengan sangat solid membagi beban kerja secara adil dan transparan.',
                                        refleksiKritis: 'Kami berhasil mendeduksi hubungan sebab akibat bencana berdasarkan data BPBD secara objektif.',
                                        refleksiKreativitas: 'Menemukan metode visualisasi komik mini saku yang disukai anak-anak sekolah untuk penyuluhan smong.',
                                        refleksiPenerapan: 'LKPD ini memberikan wawasan tak ternilai untuk ketahanan bencana di lingkungan rumah kami masing-masing.'
                                      }
                                    },
                                    teacherScore: 92,
                                    teacherFeedback: 'Kerja kelompok yang luar biasa! Analisis siklus penanganan bencana Aceh sangat detail dengan korelasi kearifan lokal yang kuat.'
                                  },
                                  {
                                    uid: 'dummy_group_2',
                                    groupName: 'Kelompok Samudra Pasai',
                                    leaderName: 'Farhan Al-Fatih',
                                    members: ['Farhan', 'Shalim', 'Tengku Riana'],
                                    currentStep: 3,
                                    isCompleted: false,
                                    updatedAt: new Date().toISOString(),
                                    answers: {
                                      orientasi: {
                                        masalahUtama: 'Tingginya kerentanan longsor tebing di jalan lintas pegunungan tengah Aceh akibat gundulnya lereng.',
                                        penyebab: 'Alih fungsi lahan lereng perbukitan menjadi kebun semusim yang berakar serabut pendek ditiup angin kencang.',
                                        dampak: 'Logistik pangan terhambat, harga komoditas melonjak, dan mengancam keselamatan pengendara lintas daerah.'
                                      },
                                      organisasi: {
                                        selectedChecklists: ['c1', 'c4', 'c5'],
                                        faktorAlami: ['Kemiringan lereng tajam curam', 'Struktur batuan lapuk ringkih'],
                                        faktorManusia: ['Penebangan liar di bagian puncak mahkota tebing'],
                                        diskusiLanjutan: 'Akan didiskusikan efektivitas pemasangan jaring baja kawat penahan batu jatuh di tebing.'
                                      },
                                      penyelidikan: {
                                        tableRows: [
                                          { id: 'row-1', info: 'Lumpur tebal menutupi pemukiman pasca banjir', sumber: 'Liputan Penyelidikan Aceh Barat', fakta: 'Sungai meluap melampaui tanggul darurat', hubungan: 'Struktur bumi berupa lapisan aluvial atas sangat mudah tergerus limpahan air deras' }
                                        ],
                                        catatanDiskusi: 'Pengendalian air permukaan di lereng (water run-off) adalah prioritas agar tebing tidak jenuh air.'
                                      },
                                      solusi: {
                                        pencegahan: 'Menanam sayuran dengan tumpang sari tanaman berakar kuat.',
                                        kesiapsiagaan: 'Pemasangan sensor pergerakan tanah sederhana berbunyi nyaring.',
                                        penanganan: 'Evakuasi segera setelah terdengar bunyi retakan tanah.',
                                        pemulihan: 'Membersihkan muntahan material longsor dengan alat berat.',
                                        solusiTerbaik: 'Sistem terasering bertingkat dengan saluran pembuangan air teratur.',
                                        alasanSolusiTerbaik: 'Mencegah akumulasi air di satu titik punggung tebing.',
                                        rancanganSolusi: 'Gambar teknis pembuatan selokan lereng.',
                                        mediaPresentasi: ['Poster Infografis'],
                                        uploadedFileName: '',
                                        uploadedFileUrl: ''
                                      },
                                      evaluasi: {
                                        kelayakan: 3,
                                        efektivitas: 3,
                                        dampakPositif: 3,
                                        keberlanjutan: 3,
                                        jawabanTerbaik: 'Penggunaan terasering.',
                                        kelebihan: 'Murah dan mudah dipraktikkan petani setempat.',
                                        kelemahan: 'Kurang andal pada lereng dengan sudut kemiringan di atas 45 derajat.',
                                        perbaikanSolusi: 'Kombinasikan dengan penanaman bambu di batas kaki lekuk tebing.',
                                        refleksiKerjasama: 'Kooperasi berjalan baik tetapi perlu perbaikan manajemen tenggat waktu.',
                                        refleksiKritis: 'Mampu menyortir data penting dari studi kepustakaan ringan.',
                                        refleksiKreativitas: 'Menggagas pemanfaatan limbah bambu sisa bangunan untuk penahan longsor awal.',
                                        refleksiPenerapan: 'Penting diaplikasikan pada kebun lereng milik keluarga anggota kelompok.'
                                      }
                                    }
                                  }
                                ];
                                localStorage.setItem('lkpd_progress', JSON.stringify(dummyGroupsList));
                                
                                const dummyUsers: UserProfile[] = [
                                  {
                                    uid: 'dummy_group_1',
                                    email: 'kelompok-rencong@lkpd-aceh.example.com',
                                    role: 'student',
                                    groupName: 'Kelompok Rencong',
                                    leaderName: 'Fajri Syahputra',
                                    members: ['Fajri', 'Nabila', 'Rahmat', 'Cut Meutia'],
                                    createdAt: new Date().toISOString()
                                  },
                                  {
                                    uid: 'dummy_group_2',
                                    email: 'kelompok-samudra-pasai@lkpd-aceh.example.com',
                                    role: 'student',
                                    groupName: 'Kelompok Samudra Pasai',
                                    leaderName: 'Farhan Al-Fatih',
                                    members: ['Farhan', 'Shalim', 'Tengku Riana'],
                                    createdAt: new Date().toISOString()
                                  }
                                ];
                                localStorage.setItem('lkpd_users', JSON.stringify(dummyUsers));

                                const passwords = JSON.parse(localStorage.getItem('lkpd_passwords') || '{}');
                                passwords['kelompok-rencong@lkpd-aceh.example.com'] = 'siswa123';
                                passwords['kelompok-samudra-pasai@lkpd-aceh.example.com'] = 'siswa123';
                                localStorage.setItem('lkpd_passwords', JSON.stringify(passwords));

                                setAllGroups(dummyGroupsList);
                                confetti({
                                  particleCount: 50,
                                  spread: 60
                                });
                              }}
                              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl text-[11px] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm mx-auto"
                            >
                              🚀 Aktifkan Data Kelompok Demo
                            </button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                          {allGroups.map((group) => {
                            const isSelected = selectedGroup?.uid === group.uid;
                            return (
                              <button
                                key={group.uid}
                                onClick={() => {
                                  setSelectedGroup(group);
                                  setTeacherScoreInput(group.teacherScore || 0);
                                  setTeacherFeedbackInput(group.teacherFeedback || '');
                                }}
                                className={cn(
                                  "w-full text-left p-4 rounded-xl border-2 transition-all flex flex-col gap-1.5 cursor-pointer hover:border-emerald-300",
                                  isSelected ? "bg-emerald-50 border-emerald-400" : "bg-slate-50 border-slate-100"
                                )}
                              >
                                <div className="flex justify-between items-start w-full">
                                  <h4 className="font-black text-slate-800 text-xs md:text-sm">{group.groupName}</h4>
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[8.5px] font-heavy font-mono tracking-wider transition-all shadow-xs",
                                    group.isCompleted ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-800"
                                  )}>
                                    {group.isCompleted ? "Tuntas" : `Siklus ${group.currentStep}`}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400">Ketua: {group.leaderName}</p>
                                
                                {group.teacherScore !== undefined ? (
                                  <div className="flex justify-between items-center w-full mt-2 text-[10px] border-t border-slate-200/50 pt-1.5">
                                    <span className="text-emerald-600 font-bold">Teruji & Diuji</span>
                                    <strong className="text-slate-850">Skor: {group.teacherScore}/100</strong>
                                  </div>
                                ) : (
                                  <span className="text-[9px] uppercase font-bold text-amber-500 mt-2 bg-amber-100/50 px-2 py-0.5 rounded-md inline-block self-start">
                                    Butuh Penilaian
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right: Detailed Answers Drawer */}
                    <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-[1.8rem] p-6 space-y-6">
                      
                      {selectedGroup ? (
                        <div className="space-y-6">
                          
                          {/* Heading group */}
                          <div className="border-b-2 border-slate-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">🌍</span>
                                <h3 className="text-lg font-black text-slate-850">Review Jawaban: <span className="text-emerald-500">{selectedGroup.groupName}</span></h3>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">Mengoreksi berkas PBL Langkah 1-5 kelayakan tsunami & tanah banjir lereng Aceh</p>
                            </div>

                            {/* Scoring Box */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-2 items-center">
                              <div>
                                <label className="block text-[8.5px] font-bold text-slate-500 uppercase">Input Skor (0-100)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  className="w-16 border rounded bg-white font-heavy px-2 py-1 text-slate-800"
                                  value={teacherScoreInput}
                                  onChange={(e) => setTeacherScoreInput(Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <label className="block text-[8.5px] font-bold text-slate-500 uppercase">Input Feedback Guru</label>
                                <input
                                  type="text"
                                  className="w-48 md:w-60 border rounded bg-white px-2 py-1 text-xs text-slate-700"
                                  placeholder="Saran kelompok..."
                                  value={teacherFeedbackInput}
                                  onChange={(e) => setTeacherFeedbackInput(e.target.value)}
                                />
                              </div>
                              <button
                                onClick={saveTeacherEvaluation}
                                disabled={actionLoading}
                                className="px-3 py-2 bg-emerald-500 font-bold hover:bg-emerald-600 rounded text-xs text-white cursor-pointer mt-4"
                              >
                                <Sparkles size={11} className="inline mr-1" /> Simpan
                              </button>
                            </div>
                          </div>

                          {/* Accordion detail steps */}
                          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                            
                            {/* Step 1 */}
                            <div className="bg-slate-50/50 rounded-xl p-4 space-y-2 text-xs">
                              <h4 className="font-extrabold text-slate-750 uppercase text-[10px] tracking-wide text-blue-800">Langkah 1: Jawaban Orientasi Masalah</h4>
                              <div className="space-y-2 bg-white rounded-lg p-3 border">
                                <p><strong>• Masalah utama di Aceh:</strong> {selectedGroup.answers.orientasi?.masalahUtama || '-'}</p>
                                <p><strong>• Penyebab:</strong> {selectedGroup.answers.orientasi?.penyebab || '-'}</p>
                                <p><strong>• Dampak:</strong> {selectedGroup.answers.orientasi?.dampak || '-'}</p>
                              </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-slate-50/50 rounded-xl p-4 space-y-2 text-xs">
                              <h4 className="font-extrabold text-slate-750 uppercase text-[10px] tracking-wide text-emerald-800">Langkah 2: Kliping Pemilihan Kategori</h4>
                              <div className="grid grid-cols-2 gap-3 bg-white rounded-lg p-3 border">
                                <div className="border-r border-slate-100 pr-2">
                                  <strong className="text-[10px] text-sky-800">🏞️ Faktor Alami:</strong>
                                  <ul className="list-disc pl-3 mt-1 space-y-1">
                                    {(selectedGroup.answers.organisasi?.faktorAlami || []).map(x => <li key={x}>{x}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <strong className="text-[10px] text-orange-850">👥 Faktor Manusia:</strong>
                                  <ul className="list-disc pl-3 mt-1 space-y-1">
                                    {(selectedGroup.answers.organisasi?.faktorManusia || []).map(x => <li key={x}>{x}</li>)}
                                  </ul>
                                </div>
                              </div>
                              <p className="bg-white p-3 border rounded-lg"><strong>Diskusi Lanjutan:</strong> {selectedGroup.answers.organisasi?.diskusiLanjutan || '-'}</p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-slate-50/50 rounded-xl p-4 space-y-2 text-xs">
                              <h4 className="font-extrabold text-slate-750 uppercase text-[10px] tracking-wide text-cyan-800">Langkah 3: Lembar Analisis Siber & Data</h4>
                              <div className="overflow-x-auto bg-white rounded-lg p-2 border">
                                <table className="w-full text-left font-mono text-[10px] min-w-[500px]">
                                  <thead>
                                    <tr className="border-b">
                                      <th>Temuan Info</th>
                                      <th>Sumber</th>
                                      <th>Fakta</th>
                                      <th>Hubungan</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(selectedGroup.answers.penyelidikan?.tableRows || []).map(row => (
                                      <tr key={row.id}>
                                        <td className="p-1">{row.info}</td>
                                        <td className="p-1">{row.sumber}</td>
                                        <td className="p-1">{row.fakta}</td>
                                        <td className="p-1">{row.hubungan}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <p className="bg-white p-3 border rounded-lg"><strong>Catatan Hambatan:</strong> {selectedGroup.answers.penyelidikan?.catatanDiskusi || '-'}</p>
                            </div>

                            {/* Step 4 */}
                            <div className="bg-slate-50/50 rounded-xl p-4 space-y-2 text-xs">
                              <h4 className="font-extrabold text-slate-750 uppercase text-[10px] tracking-wide text-orange-800">Langkah 4: Ragam Rekayasa Solusi Bencana</h4>
                              <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-3 border">
                                <p><strong>• Cegah:</strong> {selectedGroup.answers.solusi?.pencegahan || '-'}</p>
                                <p><strong>• Siaga:</strong> {selectedGroup.answers.solusi?.kesiapsiagaan || '-'}</p>
                                <p><strong>• Atasi:</strong> {selectedGroup.answers.solusi?.penanganan || '-'}</p>
                                <p><strong>• Pulih:</strong> {selectedGroup.answers.solusi?.pemulihan || '-'}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border space-y-1">
                                <p><strong>• Karya Pilihan Terbaik:</strong> {selectedGroup.answers.solusi?.solusiTerbaik} (Alasan: {selectedGroup.answers.solusi?.alasanSolusiTerbaik})</p>
                                <p><strong>• Desain Rincian:</strong> {selectedGroup.answers.solusi?.rancanganSolusi || '-'}</p>
                                <p><strong>• Penyajian Media:</strong> {(selectedGroup.answers.solusi?.mediaPresentasi || []).join(', ') || '-'}</p>
                                {selectedGroup.answers.solusi?.uploadedFileName && (
                                  <p className="font-bold text-emerald-600 bg-emerald-50 p-1.5 rounded inline-block">📁 File Karya: {selectedGroup.answers.solusi.uploadedFileName}</p>
                                )}
                              </div>
                            </div>

                            {/* Step 5 */}
                            <div className="bg-slate-50/50 rounded-xl p-4 space-y-2 text-xs">
                              <h4 className="font-extrabold text-slate-750 uppercase text-[10px] tracking-wide text-teal-800">Langkah 5: Penilaian Mandiri Kelompok & Refleksi</h4>
                              <div className="grid grid-cols-4 gap-2 text-center bg-white rounded-lg p-3 border">
                                <div className="bg-slate-50 p-2 rounded">
                                  <span>Kelayakan</span>
                                  <strong className="block text-emerald-600 text-sm">{selectedGroup.answers.evaluasi?.kelayakan}/4</strong>
                                </div>
                                <div className="bg-slate-50 p-2 rounded">
                                  <span>Efektivitas</span>
                                  <strong className="block text-emerald-600 text-sm">{selectedGroup.answers.evaluasi?.efektivitas}/4</strong>
                                </div>
                                <div className="bg-slate-50 p-2 rounded">
                                  <span>Dampak</span>
                                  <strong className="block text-emerald-600 text-sm">{selectedGroup.answers.evaluasi?.dampakPositif}/4</strong>
                                </div>
                                <div className="bg-slate-50 p-2 rounded">
                                  <span>Lanjutan</span>
                                  <strong className="block text-emerald-600 text-sm">{selectedGroup.answers.evaluasi?.keberlanjutan}/4</strong>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border space-y-1">
                                <p><strong>• Kelebihan Solusi:</strong> {selectedGroup.answers.evaluasi?.kelebihan || '-'}</p>
                                <p><strong>• Kelemahan Solusi:</strong> {selectedGroup.answers.evaluasi?.keleman || '-'}</p>
                                <p><strong>• Perbaikan:</strong> {selectedGroup.answers.evaluasi?.perbaikanSolusi || '-'}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border grid grid-cols-2 gap-2 text-[11px]">
                                <p><strong>• Kerja Sama:</strong> {selectedGroup.answers.evaluasi?.refleksiKerjasama || '-'}</p>
                                <p><strong>• Berpikir Kritis:</strong> {selectedGroup.answers.evaluasi?.refleksiKritis || '-'}</p>
                                <p><strong>• Kreativitas:</strong> {selectedGroup.answers.evaluasi?.refleksiKreativitas || '-'}</p>
                                <p><strong>• Lapangan:</strong> {selectedGroup.answers.evaluasi?.refleksiPenerapan || '-'}</p>
                              </div>
                            </div>

                          </div>

                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                          <span className="text-5xl block mb-2">📋</span>
                          <h4 className="font-bold text-slate-700">Pilih Kelompok Siswa untuk Mengoreksi Jawaban</h4>
                          <p className="text-xs text-slate-500 mt-1">Silakan klik salah satu kelompok di panel kiri untuk membuka lembar kerjanya.</p>
                        </div>
                      )}

                    </div>

                  </div>

                </motion.div>
              )}

            </>
          )}

        </AnimatePresence>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t-2 border-slate-100 py-6 px-4 md:px-8 mt-12 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 {SCHOOL_INFO.university} - Dikembangkan oleh {SCHOOL_INFO.designer}</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 font-sans">
          <span>Tampilan Ceria Pastel</span>•<span>Problem Based Learning</span>•<span>Aceh Disaster Mitigation Center</span>
        </p>
      </footer>

    </div>
  );
}
