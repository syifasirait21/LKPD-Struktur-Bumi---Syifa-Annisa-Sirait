export const SCHOOL_INFO = {
  university: "LMS Mitigasi Bencana Aceh",
  title: "LKPD Interaktif: Struktur Bumi & Mitigasi Bencana",
  level: "Kelas VIII SMP - Kurikulum Merdeka",
  designer: "Syifa Annisa Sirait"
};

export const MATERI_LIST = [
  {
    id: "struktur",
    title: "🔬 Bagian 1: Struktur Lapisan Bumi",
    icon: "Database",
    color: "bg-emerald-100 border-emerald-300 text-emerald-800",
    content: "Bumi kita terdiri dari 3 lapisan utama: Kerak Bumi (lapisan terluar padat tempat kita tinggal), Mantel Bumi (lapisan tebal semi-cair yang bergerak), dan Inti Bumi (lapisan terdalam yang sangat panas).\n\nPergerakan di mantel Bumi menyebabkan lempeng tektonik bergerak, membentuk pegunungan curam, patahan, dan jalur gempa. Di wilayah Aceh yang dilalui Patahan Besar Sumatra (Great Sumatran Fault), struktur tanah pegunungan cenderung tidak stabil dan mudah longsor, terutama saat dipicu oleh curah hujan yang tinggi."
  },
  {
    id: "banjir",
    title: "🌊 Bagian 2: Karakteristik Banjir di Aceh",
    icon: "Droplets",
    color: "bg-cyan-100 border-cyan-300 text-cyan-800",
    content: "Banjir luapan sering terjadi di daerah dataran rendah Aceh akibat curah hujan esktrem. Penyebabnya bervariasi antara faktor alam dan manusia:\n\n1. Faktor Alami: Curah hujan tinggi di pegunungan, pendangkalan sungai alami, dan bentuk lembah sungai.\n2. Faktor Manusia: Membuang sampah sembarangan yang menyumbat saluran drainase, penggundulan hutan (deforestasi) di hulu sungai sehingga menghilangkan daerah tangkapan air alami, serta pembangunan beton yang mengurangi infiltrasi tanah."
  },
  {
    id: "longsor",
    title: "⛰️ Bagian 3: Tanah Longsor & Lereng Curam",
    icon: "Anchor",
    color: "bg-amber-100 border-amber-300 text-amber-800",
    content: "Tanah longsor terjadi karena adanya gaya pendorong (berat tanah & air) yang melebihi gaya penahan di lereng bukit. Di daerah pegunungan Aceh (seperti Gayo Lues atau Aceh Tengah), kondisi lereng yang curam, gundul tanpa vegetasi akar pohon, dan penyerapan air yang jenuh membuat tanah menjadi licin dan meluncur ke bawah menimbun pemukiman atau jalan raya."
  },
  {
    id: "mitigasi",
    title: "🛡️ Bagian 4: Mitigasi Bencana Penting",
    icon: "Shield",
    color: "bg-orange-100 border-orange-300 text-orange-800",
    content: "Mitigasi adalah upaya mengurangi risiko bencana. Terdiri dari:\n\n• Prabencana: Membuat peta jalur evakuasi, menanam pohon berakar dalam (vetiver) di tebing, membersihkan selokan kelompok, menyiapkan tas siaga bencana.\n• Saat Bencana: Segera lari ke tempat tinggi (evakuasi mandiri), amankan dokumen berharga, pantau informasi darurat.\n• Pascabencana: Gotong royong membersihkan lingkungan, mencegah wabah penyakit, melakukan rehabilitasi psikologis."
  }
];

export const INITIAL_CHECKLISTS = [
  { id: "c1", text: "Hujan deras terus-menerus selama dua hari", defaultType: "alami" },
  { id: "c2", text: "Sampah menumpuk menyumbat saluran air dan sungai", defaultType: "manusia" },
  { id: "c3", text: "Saluran drainase perkotaan sempit dan tersumbat sedimen", defaultType: "manusia" },
  { id: "c4", text: "Penebangan pohon liar (hutan gundul) di daerah hulu sungai", defaultType: "manusia" },
  { id: "c5", text: "Kemiringan lereng bukit curam dan tidak memiliki penahan vegetasi", defaultType: "alami" },
  { id: "c6", text: "Pembangunan rumah tinggal sangat dekat dengan bantaran sungai", defaultType: "manusia" },
  { id: "c7", text: "Kurangnya kesadaran masyarakat dalam memelihara kebersihan selokan", defaultType: "manusia" }
];

export const INVESTIGASI_SOURCES = [
  {
    id: "src1",
    title: "Liputan Penyelidikan Banjir Luapan Aceh Barat",
    type: "Video & Artikel Informasi",
    desc: "Menjelaskan bagaimana luapan sungai menghanyutkan jembatan kayu dan menyisakan genangan lumpur tebal.",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    icon: "PlayCircle",
    qrLabel: "PBL-ACEH-01"
  },
  {
    id: "src2",
    title: "Dokumen BPBD Aceh: Penyebab Longsor di Gayo Lues",
    type: "Laporan Lapangan",
    desc: "Data kualitatif mengenai struktur tanah lempung basah yang labil di sepanjang lereng bukit jalan utama pegunungan.",
    url: "https://bpba.acehprov.go.id/",
    icon: "FileText",
    qrLabel: "PBL-ACEH-02"
  },
  {
    id: "src3",
    title: "Studi Kasus: Sistem Drainase & Pengelolaan Sampah Kota Banda Aceh",
    type: "Dokumen Analisis",
    desc: "Menghubungkan curah hujan ekstrem dengan kapasitas drainase perkotaan pasca-pasang air laut (rob).",
    url: "#",
    icon: "BookOpen",
    qrLabel: "PBL-ACEH-03"
  }
];

export const INITIAL_STUDENT_ANSWERS = {
  orientasi: {
    masalahUtama: "",
    penyebab: "",
    dampak: ""
  },
  organisasi: {
    selectedChecklists: [],
    faktorAlami: [],
    faktorManusia: [],
    diskusiLanjutan: ""
  },
  penyelidikan: {
    tableRows: [
      { id: "row-1", info: "Lumpur tebal menutupi pemukiman pasca banjir", sumber: "Liputan Penyelidikan Aceh Barat", fakta: "Sungai meluap melampaui tanggul darurat", hubungan: "Struktur bumi berupa lapisan aluvial atas sangat mudah tergerus limpahan air deras" }
    ],
    catatanDiskusi: "",
    customReferences: []
  },
  solusi: {
    pencegahan: "",
    kesiapsiagaan: "",
    penanganan: "",
    pemulihan: "",
    solusiTerbaik: "",
    alasanSolusiTerbaik: "",
    rancanganSolusi: "",
    mediaPresentasi: [],
    uploadedFileName: "PosterACEH.png",
    uploadedFileUrl: "/PosterACEH.png"
  },
  evaluasi: {
    kelayakan: 3,
    efektivitas: 3,
    dampakPositif: 3,
    keberlanjutan: 3,
    jawabanTerbaik: "",
    kelebihan: "",
    kelemahan: "",
    perbaikanSolusi: "",
    refleksiKerjasama: "",
    refleksiKritis: "",
    refleksiKreativitas: "",
    refleksiPenerapan: ""
  }
};

export const CAPAIAN_PEMBELAJARAN = {
  fase: "Fase D (Fokus Kelas VIII SMP)",
  deskripsi: "Peserta didik memahami struktur lapisan bumi untuk menjelaskan berbagai fenomena alam yang terjadi serta kaitannya dengan upaya mitigasi bencana dalam kehidupan sehari-hari."
};

export const TUJUAN_PEMBELAJARAN = [
  {
    id: "tp1",
    text: "Menjelaskan penyebab terjadinya bencana banjir dan longsor.",
    icon: "⛈️"
  },
  {
    id: "tp2",
    text: "Menganalisis dampak bencana terhadap lingkungan dan masyarakat.",
    icon: "📊"
  },
  {
    id: "tp3",
    text: "Menentukan solusi dan upaya mitigasi untuk mengurangi risiko bencana.",
    icon: "🛡️"
  },
  {
    id: "tp4",
    text: "Menyajikan hasil diskusi atau pengamatan terkait mitigasi bencana di lingkungan sekitar.",
    icon: "📝"
  }
];

