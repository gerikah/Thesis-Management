import './index.css';
import projectLogo from './assets/cpe-archive-logo.png';
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Archive,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CloudUpload,
  Database,
  FileArchive,
  FileText,
  Filter,
  GraduationCap,
  Grid3X3,
  Layers3,
  LibraryBig,
  List,
  LockKeyhole,
  PieChart as PieChartIcon,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

type Thesis = {
  archive_id: string;
  thesis_title: string;
  author_name?: string;
  batch_year?: string;
  section_block?: string;
  group_code?: string;
  main_adviser?: string;
  final_panel_members?: string;
  abstract?: string;
  created_at?: string;
};

type View = 'dashboard' | 'repository' | 'analytics';
type LayoutMode = 'grid' | 'table';

const API_BASE = 'http://localhost/backend';
const MIN_LOADING_TIME_MS = 2600;

const adviserOptions = [
  'Dr. Antonio Y. Velasco',
  'Engr. Orlando V. Pajabera',
  'Engr. Julian L. Lorico Jr.',
  'Engr. Pedrito M. Tenerife Jr.',
  'Dr. Lutzer U. Reyes',
  'Engr. Rolito L. Mahaguay',
  'Dr. Remedios G. Ado',
  'Engr. Julius S. Cansino',
  'Dr. Arvin R. De La Cruz',
  'Engr. Florinda H. Oquindo',
];

const techCategories = [
  { label: 'IoT', terms: ['iot', 'sensor', 'embedded', 'arduino', 'raspberry'], color: 'bg-emerald-500' },
  { label: 'Robotics', terms: ['robot', 'robotics', 'automation', 'autonomous'], color: 'bg-amber-500' },
  { label: 'AI/ML', terms: ['ai', 'machine learning', 'neural', 'vision', 'prediction'], color: 'bg-violet-500' },
  { label: 'Software', terms: ['system', 'web', 'mobile', 'application', 'software'], color: 'bg-sky-500' },
];

const badgePalette = [
  'bg-rose-50 text-rose-700 ring-rose-200',
  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'bg-sky-50 text-sky-700 ring-sky-200',
  'bg-amber-50 text-amber-800 ring-amber-200',
  'bg-violet-50 text-violet-700 ring-violet-200',
];

const emptyForm = {
  group_code: '',
  batch_year: '',
  section_block: '',
  thesis_title: '',
  abstract: '',
  main_adviser: '',
  author_name: '',
};

function normalize(value?: string) {
  return (value || '').toLowerCase();
}

function getAuthors(thesis: Thesis) {
  return thesis.author_name?.split(',').map(author => author.trim()).filter(Boolean) || [];
}

function getTechBadges(thesis: Thesis) {
  const content = `${thesis.thesis_title || ''} ${thesis.abstract || ''}`.toLowerCase();
  const matched = techCategories
    .filter(category => category.terms.some(term => content.includes(term)))
    .map(category => category.label);

  if (content.includes('python')) matched.push('Python');
  if (content.includes('hardware') || content.includes('embedded')) matched.push('Hardware');
  if (content.includes('web') || content.includes('system')) matched.push('Web App');
  if (content.includes('mobile')) matched.push('Mobile');

  return Array.from(new Set(matched)).slice(0, 4).length
    ? Array.from(new Set(matched)).slice(0, 4)
    : ['Research', 'CpE'];
}

function getKeywords(thesis: Thesis) {
  const badges = getTechBadges(thesis);
  const technicalWords = `${thesis.thesis_title || ''} ${thesis.abstract || ''}`
    .split(/[^A-Za-z0-9+/.-]+/)
    .map(word => word.trim())
    .filter(word => word.length > 4 && !['thesis', 'system', 'using', 'based', 'study', 'research'].includes(word.toLowerCase()))
    .slice(0, 8);

  return Array.from(new Set([...badges, ...technicalWords])).slice(0, 8);
}

function dateLabel(date?: string) {
  if (!date) return 'Recently archived';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [allTheses, setAllTheses] = useState<Thesis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedAdviser, setSelectedAdviser] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [adminFlowOpen, setAdminFlowOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchTheses = async (params = new URLSearchParams()) => {
    const query = params.toString();
    try {
      const response = await fetch(`${API_BASE}/fetch_theses.php${query ? `?${query}` : ''}`);
      const result = await response.json();

      if (result.status === 'success') {
        setTheses(result.data);
        if (!query) setAllTheses(result.data);
      }
    } finally {
      if (!query) {
        window.setTimeout(() => setIsInitialLoading(false), MIN_LOADING_TIME_MS);
      }
    }
  };

  useEffect(() => {
    fetchTheses().catch(console.error);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (selectedYear) params.set('batch_year', selectedYear);
      if (selectedAdviser) params.set('adviser', selectedAdviser);
      if (selectedSection) params.set('section', selectedSection);
      fetchTheses(params).catch(console.error);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [searchTerm, selectedYear, selectedAdviser, selectedSection]);

  const visibleTheses = useMemo(() => {
    if (!selectedTech) return theses;
    return theses.filter(thesis => getTechBadges(thesis).includes(selectedTech));
  }, [theses, selectedTech]);

  const years = useMemo(
    () => Array.from(new Set(allTheses.map(thesis => thesis.batch_year).filter(Boolean))).sort().reverse() as string[],
    [allTheses],
  );

  const sections = useMemo(
    () => Array.from(new Set(allTheses.map(thesis => thesis.section_block).filter(Boolean))).sort() as string[],
    [allTheses],
  );

  const categoryStats = useMemo(() => {
    const total = Math.max(allTheses.length, 1);
    return techCategories.map(category => {
      const count = allTheses.filter(thesis => {
        const text = normalize(`${thesis.thesis_title} ${thesis.abstract}`);
        return category.terms.some(term => text.includes(term));
      }).length;
      return { ...category, count, percentage: Math.max(8, Math.round((count / total) * 100)) };
    });
  }, [allTheses]);

  const metrics = [
    { label: 'Total Archived Theses', value: allTheses.length, icon: LibraryBig, accent: 'text-[#7f1d1d]' },
    { label: 'Active Batches', value: years.length, icon: Layers3, accent: 'text-sky-700' },
    { label: 'Academic Sections', value: sections.length, icon: Users, accent: 'text-emerald-700' },
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYear('');
    setSelectedAdviser('');
    setSelectedSection('');
    setSelectedTech('');
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('csv_file', file);

    const response = await fetch(`${API_BASE}/import_csv.php`, { method: 'POST', body: formData });
    const result = await response.json();
    alert(result.status === 'success' ? `Import successful. ${result.imported_count} records added.` : `Import failed: ${result.message}`);
    await fetchTheses();
  };

  const handleArchive = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch(`${API_BASE}/save_thesis.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        authors: form.author_name.split(',').map(name => ({ name: name.trim(), student_number: '' })).filter(author => author.name),
      }),
    });
    const result = await response.json();
    setIsSaving(false);

    if (result.status === 'success') {
      setAdminFlowOpen(false);
      setForm(emptyForm);
      await fetchTheses();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  return (
    <div className="min-h-screen text-slate-950">
      {isInitialLoading && <LoadingScreen />}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-maroon-900/10 bg-maroon-gradient px-4 py-5 text-white shadow-2xl shadow-maroon-950/40 lg:flex lg:flex-col">
        <div className="mb-9 flex items-center gap-3 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 shadow-inner">
            <BookOpen className="h-6 w-6 text-maroon-100" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">PUP CpE</h1>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-maroon-100/70">Thesis System</p>
          </div>
        </div>

        <nav className="space-y-2">
          <NavButton active={view === 'dashboard'} icon={BarChart3} label="Dashboard" onClick={() => setView('dashboard')} />
          <NavButton active={view === 'repository'} icon={Database} label="Repository" onClick={() => setView('repository')} />
          <NavButton active={view === 'analytics'} icon={TrendingUp} label="Analytics" onClick={() => setView('analytics')} />
        </nav>
      </aside>

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 pb-20">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/80 bg-gradient-to-br from-white/90 to-slate-200/60 p-5 shadow-xl shadow-maroon-900/10 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-maroon-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-maroon-900 ring-1 ring-maroon-100/50">
              <Sparkles className="h-3.5 w-3.5" />
              Computer Engineering
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
              {view === 'dashboard' ? 'Archive Intelligence' : 'Digital Repository'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:shadow-md active:scale-[0.98]" onClick={() => setAdminFlowOpen(true)}>
              <Upload className="h-4 w-4" />
              Import CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-maroon-gradient px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-maroon-900/20 transition-all hover:shadow-maroon-900/30 hover:brightness-110 active:scale-[0.98]" onClick={() => setAdminFlowOpen(true)}>
              <Plus className="h-4 w-4" />
              Archive New Thesis
            </button>
          </div>
        </header>

        {view === 'dashboard' ? (
          <Dashboard metrics={metrics} stats={categoryStats} theses={allTheses} onArchive={() => setAdminFlowOpen(true)} onImport={() => setAdminFlowOpen(true)} />
        ) : view === 'repository' ? (
          <Repository
            theses={visibleTheses}
            years={years}
            sections={sections}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedAdviser={selectedAdviser}
            setSelectedAdviser={setSelectedAdviser}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            selectedTech={selectedTech}
            setSelectedTech={setSelectedTech}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            clearFilters={clearFilters}
            onSelect={setSelectedThesis}
          />
        ) : (
          <Analytics theses={allTheses} />
        )}
      </main>

      {selectedThesis && <ThesisModal thesis={selectedThesis} onClose={() => setSelectedThesis(null)} />}
      {adminFlowOpen && (
        <AdminArchiveFlow
          form={form}
          setForm={setForm}
          isSaving={isSaving}
          onClose={() => setAdminFlowOpen(false)}
          onSubmit={handleArchive}
          onImport={handleImport}
        />
      )}
    </div>
  );
}

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof BarChart3; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
        active 
          ? 'bg-white text-maroon-900 shadow-xl shadow-maroon-950/20' 
          : 'text-maroon-100/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-maroon-800' : ''}`} />
      {label}
      {active && <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-maroon-600 shadow-sm" />}
    </button>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-maroon-950 px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(255,255,255,0.08),transparent_32rem),radial-gradient(circle_at_76%_76%,rgba(254,226,226,0.08),transparent_28rem)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        <div className="mb-10 flex justify-center">
          <div className="flex h-56 w-56 animate-[float_4s_ease-in-out_infinite] items-center justify-center rounded-[3rem] bg-white p-6 shadow-[0_0_60px_rgba(255,255,255,0.25)] ring-1 ring-white/30">
            <img src={projectLogo} alt="Thesis archive project logo" className="h-full w-full object-contain" />
          </div>
        </div>

        <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-maroon-200/60">Computer Engineering Department</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          Thesis Management <span className="text-maroon-200">System</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-maroon-50/70 sm:text-xl">
          The Definitive Archive of Computer Engineering Innovation
        </p>

        <div className="mt-12 w-full max-w-sm">
          <div className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-maroon-200/40">
            <span>Preparing repository</span>
            <span>Secure archive</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
            <div className="h-full w-1/2 animate-[loading-slide_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-maroon-200 via-white to-maroon-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ metrics, stats, theses, onArchive, onImport }: any) {
  const recent = theses.slice(0, 6);
  const latest = recent[0];

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 md:grid-cols-3">
        {metrics.map((metric: any) => (
          <div key={metric.label} className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-white/90 to-slate-200/60 p-7 shadow-xl shadow-maroon-900/10 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-maroon-900/10">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-maroon-50/50 transition-transform duration-500 group-hover:scale-110" />
            <div className="relative mb-6 flex items-center justify-between">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 ${metric.accent}`}>
                <metric.icon className="h-7 w-7" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
            <p className="relative text-sm font-bold uppercase tracking-widest text-slate-400">{metric.label}</p>
            <p className="relative mt-2 text-5xl font-black tracking-tight text-slate-950">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="flex flex-col rounded-[2rem] border border-white bg-gradient-to-br from-white/90 to-slate-200/60 p-8 shadow-xl shadow-maroon-900/10 backdrop-blur-md">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-950">Technology Landscape</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">Distribution of innovation categories across the archive.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon-50 text-maroon-900 ring-1 ring-maroon-100">
              <Archive className="h-6 w-6" />
            </div>
          </div>
          <div className="grid flex-1 gap-6 md:grid-cols-2">
            {stats.map((category: any) => (
              <div key={category.label} className="group flex flex-col justify-center rounded-3xl bg-slate-50/50 p-5 ring-1 ring-slate-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-800">{category.label}</span>
                  <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-slate-400 shadow-sm ring-1 ring-slate-100">{category.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200/50 ring-1 ring-slate-200/50">
                  <div className={`h-full rounded-full transition-all duration-1000 ${category.color} shadow-[0_0_12px_rgba(0,0,0,0.1)]`} style={{ width: `${category.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[2rem] border border-white bg-gradient-to-br from-white/90 to-slate-200/60 p-7 shadow-xl shadow-maroon-900/10 backdrop-blur-md">
            <h3 className="mb-5 text-xl font-black tracking-tight text-slate-950">Quick Operations</h3>
            <div className="grid gap-3">
              <button onClick={onImport} className="flex items-center justify-between rounded-2xl bg-maroon-gradient px-5 py-4 text-left font-bold text-white shadow-lg shadow-maroon-900/20 transition-all hover:brightness-110 active:scale-[0.98]">
                <span className="inline-flex items-center gap-3"><Upload className="h-5 w-5" /> Bulk Import CSV</span>
                <ChevronRight className="h-5 w-5 opacity-50" />
              </button>
              <button onClick={onArchive} className="flex items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-left font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]">
                <span className="inline-flex items-center gap-3"><Plus className="h-5 w-5" /> Manual Archive</span>
                <ChevronRight className="h-5 w-5 opacity-50" />
              </button>
            </div>
          </div>
          
          <div className="relative flex flex-1 flex-col justify-end overflow-hidden rounded-[2rem] bg-maroon-950 p-7 text-white shadow-2xl shadow-maroon-950/40">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-maroon-900/30 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-maroon-200/60">Recently Ingested</p>
              <h4 className="mt-4 line-clamp-3 text-xl font-black leading-tight tracking-tight">{latest?.thesis_title || 'Awaiting first archive record...'}</h4>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <GraduationCap className="h-5 w-5 text-maroon-100" />
                </div>
                <div>
                  <p className="text-xs font-bold text-maroon-100">{latest?.batch_year || 'N/A'}</p>
                  <p className="text-[10px] font-medium text-maroon-100/50 uppercase tracking-wider">{latest?.section_block || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white bg-gradient-to-br from-white/90 to-slate-200/60 p-8 shadow-xl shadow-maroon-900/10 backdrop-blur-md">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-black tracking-tight text-slate-950">Recent History</h3>
          <button className="text-sm font-bold text-maroon-900 hover:underline">View all activity</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recent.map((thesis: Thesis) => (
            <div key={thesis.archive_id} className="group flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-maroon-100">
              <p className="line-clamp-2 text-sm font-bold leading-relaxed text-slate-800 group-hover:text-maroon-950">{thesis.thesis_title}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dateLabel(thesis.created_at)}</p>
                <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-100">{thesis.batch_year || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Repository(props: any) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/80 bg-gradient-to-br from-white/90 to-slate-200/60 p-6 shadow-xl shadow-maroon-900/10 backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={props.searchTerm}
              onChange={(event) => props.setSearchTerm(event.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white/50 pl-14 pr-6 text-sm font-bold text-slate-950 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-maroon-900 focus:bg-white focus:ring-4 focus:ring-maroon-100"
              placeholder="Query the repository by title, author, or research keyword..."
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => props.setFiltersOpen(!props.filtersOpen)} 
              className={`inline-flex h-14 items-center gap-2 rounded-2xl px-6 text-sm font-black transition-all ${
                props.filtersOpen ? 'bg-slate-950 text-white shadow-lg' : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="h-4 w-4" /> 
              {props.filtersOpen ? 'Clear Filters' : 'Filter'}
            </button>
            <div className="flex rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
              <button onClick={() => props.setLayoutMode('grid')} className={`rounded-xl p-2.5 transition-all ${props.layoutMode === 'grid' ? 'bg-maroon-gradient text-white shadow-lg shadow-maroon-900/20' : 'text-slate-400 hover:text-slate-600'}`}><Grid3X3 className="h-5 w-5" /></button>
              <button onClick={() => props.setLayoutMode('table')} className={`rounded-xl p-2.5 transition-all ${props.layoutMode === 'table' ? 'bg-maroon-gradient text-white shadow-lg shadow-maroon-900/20' : 'text-slate-400 hover:text-slate-600'}`}><List className="h-5 w-5" /></button>
            </div>
          </div>
        </div>

        {props.filtersOpen && (
          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 md:grid-cols-2 xl:grid-cols-5">
            <FilterSelect label="Batch Year" value={props.selectedYear} onChange={props.setSelectedYear} options={props.years} fallback="All Batches" />
            <FilterSelect label="Lead Adviser" value={props.selectedAdviser} onChange={props.setSelectedAdviser} options={adviserOptions} fallback="All Advisers" />
            <FilterSelect label="Academic Section" value={props.selectedSection} onChange={props.setSelectedSection} options={props.sections} fallback="All Sections" />
            <FilterSelect label="Tech Category" value={props.selectedTech} onChange={props.setSelectedTech} options={['IoT', 'Robotics', 'AI/ML', 'Software', 'Python', 'Hardware', 'Web App', 'Mobile']} fallback="All Technology" />
            <button onClick={props.clearFilters} className="mt-auto h-12 rounded-2xl bg-slate-950 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800">Reset All</button>
          </div>
        )}
      </section>

      {props.layoutMode === 'grid' ? (
        <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {props.theses.map((thesis: Thesis) => <ThesisCard key={thesis.archive_id} thesis={thesis} onSelect={props.onSelect} />)}
        </section>
      ) : (
        <ThesisTable theses={props.theses} onSelect={props.onSelect} />
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, fallback }: any) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <select 
        value={value} 
        onChange={event => onChange(event.target.value)} 
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-maroon-900 focus:ring-4 focus:ring-maroon-100"
      >
        <option value="">{fallback}</option>
        {options.map((option: string) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ThesisCard({ thesis, onSelect }: { thesis: Thesis; onSelect: (thesis: Thesis) => void }) {
  const authors = getAuthors(thesis);
  const badges = getTechBadges(thesis);

  return (
    <button 
      onClick={() => onSelect(thesis)} 
      className="group flex flex-col rounded-[2rem] border border-white/80 bg-gradient-to-br from-white/90 to-slate-200/60 p-7 text-left shadow-xl shadow-maroon-900/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:from-white hover:to-slate-50 hover:shadow-2xl hover:shadow-maroon-900/15 hover:ring-1 hover:ring-maroon-200"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <span className="rounded-xl bg-maroon-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-maroon-900 ring-1 ring-maroon-100">
          Batch {thesis.batch_year || 'N/A'}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-300 transition-colors group-hover:bg-maroon-50 group-hover:text-maroon-600">
          <BookOpen className="h-5 w-5" />
        </div>
      </div>
      
      <h3 className="line-clamp-3 min-h-[4.5rem] text-lg font-black leading-tight tracking-tight text-slate-950 group-hover:text-maroon-950">
        {thesis.thesis_title}
      </h3>
      
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <p className="truncate">{authors.length ? authors.slice(0, 2).join(', ') : 'No authors listed'}{authors.length > 2 ? ' et al.' : ''}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <UserRound className="h-3.5 w-3.5 text-slate-400" />
          <p className="truncate">{thesis.main_adviser || 'Unassigned Adviser'}</p>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {badges.map((badge, index) => (
          <span key={badge} className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${badgePalette[index % badgePalette.length]}`}>
            {badge}
          </span>
        ))}
      </div>
    </button>
  );
}

function ThesisTable({ theses, onSelect }: { theses: Thesis[]; onSelect: (thesis: Thesis) => void }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-white/90 to-slate-200/60 shadow-xl shadow-maroon-900/10 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="whitespace-nowrap px-8 py-5">Intellectual Property / Title</th>
              <th className="whitespace-nowrap px-8 py-5 text-center">Batch</th>
              <th className="whitespace-nowrap px-8 py-5">Key Contributors</th>
              <th className="whitespace-nowrap px-8 py-5">Classification</th>
              <th className="whitespace-nowrap px-8 py-5 text-right">Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {theses.map(thesis => {
              const authors = getAuthors(thesis);
              const authorLabel = authors.length ? `${authors[0]}${authors.length > 1 ? ' et al.' : ''}` : 'No authors';

              return (
                <tr key={thesis.archive_id} onClick={() => onSelect(thesis)} className="group cursor-pointer transition-colors hover:bg-maroon-50/30">
                  <td className="px-8 py-5">
                    <p className="line-clamp-1 text-sm font-bold text-slate-900 group-hover:text-maroon-900 transition-colors">{thesis.thesis_title}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-block rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500 group-hover:bg-white group-hover:shadow-sm">{thesis.batch_year || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">{authorLabel}</td>
                  <td className="px-8 py-5">
                    <span className="rounded-lg bg-maroon-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-maroon-900 ring-1 ring-maroon-100">
                      {getTechBadges(thesis)[0]}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {thesis.section_block || 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ThesisModal({ thesis, onClose }: { thesis: Thesis; onClose: () => void }) {
  const authors = getAuthors(thesis);
  const panelMembers = thesis.final_panel_members?.split(',').map(panel => panel.trim()).filter(Boolean) || [];
  const keywords = getKeywords(thesis);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-maroon-950/40 p-4 backdrop-blur-lg">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-[3rem] border border-white/40 bg-gradient-to-br from-white to-slate-100 shadow-[0_0_80px_rgba(69,10,10,0.25)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon-gradient text-white shadow-lg shadow-maroon-900/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Archive Record Detail</h3>
              <p className="text-xs font-bold text-maroon-900">Digital ID: {thesis.archive_id || 'RE-001'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-all hover:bg-maroon-100 hover:text-maroon-900 active:scale-95"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid max-h-[calc(94vh-100px)] overflow-y-auto lg:grid-cols-[1fr_400px]">
          <article className="p-8 sm:p-12 lg:p-16">
            <div className="mb-8 flex flex-wrap gap-3">
              <p className="inline-flex items-center gap-2 rounded-xl bg-maroon-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-maroon-900 ring-1 ring-maroon-100">
                <FileText className="h-4 w-4" />
                Verified Research
              </p>
              <p className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                <Database className="h-4 w-4" />
                Master Archive
              </p>
            </div>

            <h2 className="text-4xl font-black leading-[1.15] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {thesis.thesis_title || 'Untitled Academic Study'}
            </h2>

            <section className="mt-16">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Executive Abstract</h3>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="relative rounded-[2.5rem] bg-slate-50/50 p-10 ring-1 ring-slate-100">
                <p className="relative z-10 whitespace-pre-line text-lg font-medium leading-relaxed text-slate-700 italic">
                  "{thesis.abstract || 'No abstract record available for this repository entry.'}"
                </p>
              </div>
            </section>

            <section className="mt-12">
              <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Research Indicators</h3>
              <div className="flex flex-wrap gap-3">
                {keywords.map((keyword, index) => (
                  <span key={keyword} className={`rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest ring-1 ${badgePalette[index % badgePalette.length]}`}>
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          </article>

          <aside className="border-t border-slate-100 bg-slate-50/50 p-8 sm:p-12 lg:border-l lg:border-t-0">
            <div className="sticky top-0 flex flex-col gap-8">
              <div className="rounded-[2.5rem] border border-white bg-white/80 p-8 shadow-2xl shadow-maroon-900/10 backdrop-blur-md">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-maroon-gradient text-white shadow-xl shadow-maroon-900/20">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-950">Academic Meta</h3>
                    <p className="text-xs font-bold text-slate-400">Registry classification</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <MetadataSection title="Core Research Team">
                    <div className="space-y-4">
                      {(authors.length ? authors : ['Record Missing']).map(author => (
                        <div key={author} className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-black tracking-tight text-slate-800">{author}</span>
                        </div>
                      ))}
                    </div>
                  </MetadataSection>

                  <MetadataSection title="Academic Oversight">
                    <div className="space-y-5">
                      <AcademicPerson label="Principal Adviser" name={thesis.main_adviser || 'Unassigned'} />
                      <div className="h-px bg-slate-100" />
                      {(panelMembers.length ? panelMembers : ['Panel Unrecorded']).map(panel => (
                        <AcademicPerson key={panel} label="Panel Member" name={panel} muted={!panelMembers.length} />
                      ))}
                    </div>
                  </MetadataSection>

                  <MetadataSection title="Repository Context">
                    <div className="grid grid-cols-2 gap-4">
                      <ContextTile label="Archive Year" value={thesis.batch_year || 'N/A'} />
                      <ContextTile label="Section" value={thesis.section_block || 'N/A'} />
                      <ContextTile label="Group Code" value={thesis.group_code || 'N/A'} wide />
                    </div>
                  </MetadataSection>
                </div>

                <div className="mt-8 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-xs font-bold text-maroon-100 shadow-xl">
                  <CalendarDays className="h-5 w-5 opacity-60" />
                  <span>Registry Entry: {dateLabel(thesis.created_at)}</span>
                </div>
              </div>
              
              <button className="flex h-16 w-full items-center justify-center gap-3 rounded-3xl bg-maroon-gradient text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-maroon-900/20 transition-all hover:scale-[1.02] active:scale-95">
                <FileArchive className="h-5 w-5" />
                Request Document Access
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MetadataSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{title}</h4>
      {children}
    </section>
  );
}

function AcademicPerson({ label, name, muted }: { label: string; name: string; muted?: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maroon-50 text-maroon-900 shadow-sm ring-1 ring-maroon-100">
        <GraduationCap className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-sm font-black tracking-tight ${muted ? 'text-slate-300' : 'text-slate-900'}`}>{name}</p>
      </div>
    </div>
  );
}

function ContextTile({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100/50 ${wide ? 'col-span-2' : ''}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1.5 text-sm font-black tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function AdminArchiveFlow({ form, setForm, isSaving, onClose, onSubmit, onImport }: any) {
  const [authenticated, setAuthenticated] = useState(false);
  const [mode, setMode] = useState<'choice' | 'manual' | 'bulk'>('choice');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  const submitAuth = (event: React.FormEvent) => {
    event.preventDefault();
    const validAdmins = ['admin', 'thesis_head', 'coordinator'];

    if (!validAdmins.includes(credentials.username.toLowerCase()) || !credentials.password.trim()) {
      setAuthError('Identity verification failed. Please use authorized credentials.');
      return;
    }

    setAuthError('');
    setAuthenticated(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-maroon-950/40 p-4 backdrop-blur-lg">
      <div className="w-full max-w-5xl overflow-hidden rounded-[3rem] border border-white/40 bg-gradient-to-br from-white to-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-950">Administrative Control</h3>
              <p className="text-xs font-bold text-slate-400">{authenticated ? 'Repository write access granted' : 'Authorization protocol required'}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-all hover:bg-maroon-100 hover:text-maroon-900 active:scale-95">
            <X className="h-6 w-6" />
          </button>
        </div>

        {!authenticated ? (
          <form onSubmit={submitAuth} className="mx-auto max-w-md p-12">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-maroon-gradient text-white shadow-xl shadow-maroon-900/20">
                <LockKeyhole className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">Secure Login</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">Access restricted to authorized department personnel.</p>
            </div>

            <div className="space-y-5">
              <Input label="Admin Identifier" value={credentials.username} onChange={(value: string) => setCredentials({ ...credentials, username: value })} required />
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Security Phrase</span>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={event => setCredentials({ ...credentials, password: event.target.value })}
                  required
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-950 outline-none transition focus:border-maroon-900 focus:bg-white focus:ring-4 focus:ring-maroon-100"
                />
              </label>
            </div>
            {authError && <p className="mt-6 rounded-2xl bg-maroon-50 px-5 py-4 text-xs font-bold text-maroon-900 ring-1 ring-maroon-100">{authError}</p>}
            <button type="submit" className="mt-10 h-14 w-full rounded-2xl bg-maroon-gradient text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-maroon-900/20 transition-all hover:scale-[1.02] active:scale-95">
              Verify Credentials
            </button>
          </form>
        ) : (
          <div className="max-h-[82vh] overflow-y-auto p-8 sm:p-12">
            {mode === 'choice' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <ArchiveChoice 
                  onClick={() => setMode('manual')}
                  icon={FileArchive}
                  title="Manual Deposition"
                  description="Register a single finalized research document with comprehensive metadata and abstract records."
                  action="Initialize Form"
                />
                <ArchiveChoice 
                  onClick={() => setMode('bulk')}
                  icon={CloudUpload}
                  title="Bulk Intelligence Import"
                  description="Propagate multiple research records simultaneously using structured data schemas (CSV)."
                  action="Prepare Sequence"
                  secondary
                />
              </div>
            )}

            {mode === 'manual' && (
              <div>
                <FlowBackButton onClick={() => setMode('choice')} />
                <ArchiveForm form={form} setForm={setForm} isSaving={isSaving} onClose={onClose} onSubmit={onSubmit} />
              </div>
            )}

            {mode === 'bulk' && (
              <div>
                <FlowBackButton onClick={() => setMode('choice')} />
                <CsvDropzone onImport={onImport} onClose={onClose} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ArchiveChoice({ onClick, icon: Icon, title, description, action, secondary }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`group relative overflow-hidden rounded-[2.5rem] border p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        secondary 
          ? 'border-dashed border-slate-300 bg-slate-50 hover:border-maroon-900 hover:bg-maroon-50/20' 
          : 'border-slate-200 bg-white hover:border-maroon-100 hover:shadow-maroon-900/10'
      }`}
    >
      <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110 ${
        secondary ? 'bg-white text-maroon-900 ring-1 ring-slate-100' : 'bg-maroon-gradient text-white shadow-maroon-900/20'
      }`}>
        <Icon className="h-8 w-8" />
      </div>
      <h4 className="text-2xl font-black tracking-tight text-slate-950">{title}</h4>
      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">{description}</p>
      <span className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-maroon-900">
        {action} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}

function FlowBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mb-8 inline-flex items-center gap-3 rounded-2xl bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-200 active:scale-95">
      <ChevronRight className="h-4 w-4 rotate-180" />
      Return to Operations
    </button>
  );
}

function CsvDropzone({ onImport, onClose }: { onImport: (file?: File) => Promise<void>; onClose: () => void }) {
  const [isImporting, setIsImporting] = useState(false);

  const importFile = async (file?: File) => {
    if (!file) return;
    setIsImporting(true);
    await onImport(file);
    setIsImporting(false);
    onClose();
  };

  return (
    <label className="group block cursor-pointer rounded-[3rem] border-4 border-dashed border-slate-200 bg-slate-50 p-16 text-center transition-all hover:border-maroon-900 hover:bg-maroon-50/20">
      <input type="file" accept=".csv" className="hidden" onChange={event => importFile(event.target.files?.[0])} />
      <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-maroon-900 shadow-xl shadow-slate-200 ring-1 ring-slate-100 transition-transform group-hover:scale-110">
        <CloudUpload className="h-12 w-12" />
      </div>
      <h4 className="text-3xl font-black tracking-tight text-slate-950">Streamline Deployment</h4>
      <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-slate-500">Integrate departmental archives via CSV. The system will automatically parse titles, authors, academic batches, and complex abstract data into the master repository.</p>
      <div className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-maroon-gradient px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-maroon-900/30 transition-all hover:brightness-110 active:scale-95">
        {isImporting ? 'Processing Sequence...' : 'Initialize Schema Import'}
      </div>
    </label>
  );
}

function ArchiveForm({ form, setForm, isSaving, onClose, onSubmit }: any) {
  const update = (field: string, value: string) => setForm((current: typeof emptyForm) => ({ ...current, [field]: value }));

  return (
      <form onSubmit={onSubmit} className="rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-white to-slate-100 p-8 shadow-2xl shadow-slate-300/50">
        <div className="mb-10 flex items-center justify-between">
          <h3 className="text-2xl font-black tracking-tight text-slate-950">Manual Deposition Entry</h3>
          <div className="rounded-xl bg-maroon-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-maroon-900 ring-1 ring-maroon-100">Draft Status</div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Input label="Research Designation (Title)" value={form.thesis_title} onChange={(value: string) => update('thesis_title', value)} placeholder="Enter finalized thesis title..." required wide />
          <Input label="Lead Investigators (Authors)" value={form.author_name} onChange={(value: string) => update('author_name', value)} placeholder="Separate contributors with commas..." required wide />
          <Input label="Academic Batch" value={form.batch_year} onChange={(value: string) => update('batch_year', value)} placeholder="e.g., 2024" required />
          <Input label="Registry Section" value={form.section_block} onChange={(value: string) => update('section_block', value)} placeholder="e.g., 5-1" required />
          <Input label="Group Identifier" value={form.group_code} onChange={(value: string) => update('group_code', value)} placeholder="e.g., G-01" />
          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Principal Academic Adviser</span>
            <select 
              value={form.main_adviser} 
              onChange={event => update('main_adviser', event.target.value)} 
              required 
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-950 outline-none transition focus:border-maroon-900 focus:bg-white focus:ring-4 focus:ring-maroon-100"
            >
              <option value="">Select official adviser...</option>
              {adviserOptions.map(adviser => <option key={adviser}>{adviser}</option>)}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Executive Abstract & Findings</span>
            <textarea 
              value={form.abstract} 
              onChange={event => update('abstract', event.target.value)} 
              required 
              rows={6} 
              placeholder="Paste the approved thesis abstract here..."
              className="w-full rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-medium leading-relaxed text-slate-700 outline-none transition focus:border-maroon-900 focus:bg-white focus:ring-4 focus:ring-maroon-100" 
            />
          </label>
        </div>
        <div className="mt-10 flex justify-end gap-4 border-t border-slate-50 pt-8">
          <button type="button" onClick={onClose} className="h-14 rounded-2xl bg-slate-100 px-8 text-sm font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-200 active:scale-95">Discard</button>
          <button type="submit" disabled={isSaving} className="h-14 rounded-2xl bg-maroon-gradient px-10 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-maroon-900/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60">
            {isSaving ? 'Synchronizing...' : 'Finalize Archive'}
          </button>
        </div>
      </form>
  );
}

function Analytics({ theses }: { theses: Thesis[] }) {
  const yearsData = useMemo(() => {
    const counts = theses.reduce((acc, thesis) => {
      const year = thesis.batch_year || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year))
      .filter(item => item.year !== 'Unknown');
  }, [theses]);

  const adviserData = useMemo(() => {
    const counts = theses.reduce((acc, thesis) => {
      const adviser = thesis.main_adviser || 'Unassigned';
      acc[adviser] = (acc[adviser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [theses]);

  const techData = useMemo(() => {
    const counts: Record<string, number> = {};
    theses.forEach(thesis => {
      const badges = getTechBadges(thesis);
      badges.forEach(badge => {
        counts[badge] = (counts[badge] || 0) + 1;
      });
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [theses]);

  const COLORS = ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171'];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h3 className="text-3xl font-black tracking-tight text-slate-950">Repository Analytics</h3>
        <p className="mt-2 text-sm font-medium text-slate-500">Comprehensive data visualization of academic output, technological trends, and faculty engagement.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col overflow-hidden rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-white/90 to-slate-200/60 p-8 shadow-xl shadow-maroon-900/10 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon-50 text-maroon-900 ring-1 ring-maroon-100">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-950">Archive Volume Trend</h4>
              <p className="text-xs font-bold text-slate-400">Total publications per batch year</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7f1d1d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7f1d1d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                  itemStyle={{ color: '#7f1d1d' }}
                />
                <Area type="monotone" dataKey="count" stroke="#7f1d1d" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-white/90 to-slate-200/60 p-8 shadow-xl shadow-maroon-900/10 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon-50 text-maroon-900 ring-1 ring-maroon-100">
              <PieChartIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-950">Technology Distribution</h4>
              <p className="text-xs font-bold text-slate-400">Primary research domains (Top 5)</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={techData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {techData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {techData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-bold text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-white/90 to-slate-200/60 p-8 shadow-xl shadow-maroon-900/10 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon-50 text-maroon-900 ring-1 ring-maroon-100">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-950">Adviser Engagement</h4>
              <p className="text-xs font-bold text-slate-400">Top 5 faculty members by supervised archives</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adviserData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }} width={140} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="url(#colorBar)" radius={[0, 8, 8, 0]} barSize={24}>
                  {adviserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % 2]} /> // Alternate between two deep maroons
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#991b1b" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, required, wide }: any) {
  return (
    <label className={wide ? 'block md:col-span-2' : 'block'}>
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <input 
        value={value} 
        onChange={event => onChange(event.target.value)} 
        placeholder={placeholder} 
        required={required} 
        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-950 outline-none transition focus:border-maroon-900 focus:bg-white focus:ring-4 focus:ring-maroon-100" 
      />
    </label>
  );
}

createRoot(document.getElementById('root')!).render(<App />);