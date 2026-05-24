export interface MemberInfo {
  name: string;
  role?: string;
}

export interface TableRow {
  id: string;
  info: string;
  sumber: string;
  fakta: string;
  hubungan: string;
}

export interface CustomReferenceItem {
  id: string;
  title: string;
  type: string;
  desc: string;
  url: string;
}

export interface StudentAnswers {
  orientasi: {
    masalahUtama: string;
    penyebab: string;
    dampak: string;
  };
  organisasi: {
    selectedChecklists: string[];
    faktorAlami: string[];
    faktorManusia: string[];
    diskusiLanjutan: string;
  };
  penyelidikan: {
    tableRows: TableRow[];
    catatanDiskusi: string;
    customReferences?: CustomReferenceItem[];
  };
  solusi: {
    pencegahan: string;
    kesiapsiagaan: string;
    penanganan: string;
    pemulihan: string;
    solusiTerbaik: string;
    alasanSolusiTerbaik: string;
    rancanganSolusi: string;
    mediaPresentasi: string[];
    uploadedFileName?: string;
    uploadedFileUrl?: string;
  };
  evaluasi: {
    kelayakan: number; // 1-4
    efektivitas: number; // 1-4
    dampakPositif: number; // 1-4
    keberlanjutan: number; // 1-4
    jawabanTerbaik: string;
    kelebihan: string;
    kelemahan: string;
    perbaikanSolusi: string;
    refleksiKerjasama: string;
    refleksiKritis: string;
    refleksiKreativitas: string;
    refleksiPenerapan: string;
  };
}

export interface GroupProgress {
  uid: string;
  groupName: string;
  leaderName: string;
  members: string[];
  currentStep: number; // 1 to 5
  isCompleted: boolean;
  answers: StudentAnswers;
  teacherFeedback?: string;
  teacherScore?: number; // 0-100
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'student' | 'admin';
  username?: string;
  groupName?: string;
  leaderName?: string;
  members?: string[];
  createdAt: string;
}

export type View = 'LANDING' | 'ABOUT' | 'MATERI' | 'LOGIN' | 'REGISTER' | 'DASHBOARD' | 'GURU' | 'MODULE';
