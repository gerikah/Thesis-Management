import './index.css';
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Archive,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
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
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
  X,
} from 'lucide-react';

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

type View = 'dashboard' | 'repository';
type LayoutMode = 'grid' | 'table';

const API_BASE = 'http://localhost/Thesis-Management/backend';

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

const pendingApprovals = [
  'Capstone metadata review',
  'Hardbound copy verification',
  'Panel signature completion',
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

  const fetchTheses = async (params = new URLSearchParams()) => {
    const query = params.toString();
    const response = await fetch(`${API_BASE}/fetch_theses.php${query ? `?${query}` : ''}`);
    const result = await response.json();

    if (result.status === 'success') {
      setTheses(result.data);
      if (!query) setAllTheses(result.data);
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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-[#4b0713] px-4 py-5 text-white shadow-2xl shadow-rose-950/20 lg:flex lg:flex-col">
        <div className="mb-9 flex items-center gap-3 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <BookOpen className="h-6 w-6 text-rose-100" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">PUP CpE</h1>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-rose-100/70">Thesis System</p>
          </div>
        </div>

        <nav className="space-y-2">
          <NavButton active={view === 'dashboard'} icon={BarChart3} label="Dashboard" onClick={() => setView('dashboard')} />
          <NavButton active={view === 'repository'} icon={Database} label="Repository" onClick={() => setView('repository')} />
        </nav>

        <div className="mt-auto rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-sm font-bold text-[#4b0713]">AD</div>
            <div>
              <p className="text-sm font-semibold">Admin Office</p>
              <p className="text-xs text-rose-100/70">Repository Control</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-72 lg:px-10">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white bg-white/80 p-5 shadow-sm shadow-slate-200/70 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7f1d1d] ring-1 ring-rose-100">
              <Sparkles className="h-3.5 w-3.5" />
              Computer Engineering
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              {view === 'dashboard' ? 'Archive Intelligence Dashboard' : 'Digital Thesis Repository'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => setAdminFlowOpen(true)}>
              <Upload className="h-4 w-4" />
              Import CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-[#7f1d1d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-900/20 hover:bg-[#681919]" onClick={() => setAdminFlowOpen(true)}>
              <Plus className="h-4 w-4" />
              Archive New Thesis
            </button>
          </div>
        </header>

        {view === 'dashboard' ? (
          <Dashboard metrics={metrics} stats={categoryStats} theses={allTheses} onArchive={() => setAdminFlowOpen(true)} onImport={() => setAdminFlowOpen(true)} />
        ) : (
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
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active ? 'bg-white text-[#4b0713] shadow-lg shadow-black/10' : 'text-rose-50/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function Dashboard({ metrics, stats, theses, onArchive, onImport }: any) {
  const recent = theses.slice(0, 4);

  return (
    <div className="space-y-7">
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric: any) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
            <div className="mb-5 flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ${metric.accent}`}>
                <metric.icon className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Live</span>
            </div>
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-7 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Theses by Technology Category</h3>
              <p className="text-sm text-slate-500">Classification inferred from thesis titles and abstracts.</p>
            </div>
            <Archive className="h-5 w-5 text-[#7f1d1d]" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {stats.map((category: any) => (
              <div key={category.label} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{category.label}</span>
                  <span className="text-sm font-bold text-slate-500">{category.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                  <div className={`h-full rounded-full ${category.color}`} style={{ width: `${category.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <h3 className="mb-4 text-lg font-bold text-slate-950">Admin Quick Actions</h3>
          <div className="grid gap-3">
            <button onClick={onImport} className="flex items-center justify-between rounded-2xl bg-[#7f1d1d] px-4 py-3 text-left font-semibold text-white shadow-lg shadow-rose-900/20">
              <span className="inline-flex items-center gap-3"><Upload className="h-5 w-5" />Import CSV</span>
              <ChevronRight className="h-5 w-5" />
            </button>
            <button onClick={onArchive} className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-left font-semibold text-white">
              <span className="inline-flex items-center gap-3"><FileArchive className="h-5 w-5" />Archive New Thesis</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Pending Approvals</p>
            <div className="space-y-3">
              {pendingApprovals.map(item => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <h3 className="mb-4 text-lg font-bold text-slate-950">Recent Activity</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {recent.map((thesis: Thesis) => (
            <div key={thesis.archive_id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="line-clamp-2 font-semibold text-slate-900">{thesis.thesis_title}</p>
              <p className="mt-2 text-sm text-slate-500">{dateLabel(thesis.created_at)} / {thesis.batch_year || 'No batch'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Repository(props: any) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={props.searchTerm}
              onChange={(event) => props.setSearchTerm(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium outline-none transition focus:border-[#7f1d1d] focus:bg-white focus:ring-4 focus:ring-rose-100"
              placeholder="Search by thesis title or keyword..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => props.setFiltersOpen(!props.filtersOpen)} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#7f1d1d] px-4 text-sm font-semibold text-white shadow-lg shadow-rose-900/15">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <div className="flex rounded-2xl bg-slate-100 p-1 ring-1 ring-slate-200">
              <button onClick={() => props.setLayoutMode('grid')} className={`rounded-xl p-2.5 ${props.layoutMode === 'grid' ? 'bg-white text-[#7f1d1d] shadow-sm' : 'text-slate-500'}`}><Grid3X3 className="h-4 w-4" /></button>
              <button onClick={() => props.setLayoutMode('table')} className={`rounded-xl p-2.5 ${props.layoutMode === 'table' ? 'bg-white text-[#7f1d1d] shadow-sm' : 'text-slate-500'}`}><List className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {props.filtersOpen && (
          <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-2 xl:grid-cols-5">
            <FilterSelect label="Batch" value={props.selectedYear} onChange={props.setSelectedYear} options={props.years} fallback="All Batches" />
            <FilterSelect label="Adviser" value={props.selectedAdviser} onChange={props.setSelectedAdviser} options={adviserOptions} fallback="All Advisers" />
            <FilterSelect label="Section" value={props.selectedSection} onChange={props.setSelectedSection} options={props.sections} fallback="All Sections" />
            <FilterSelect label="Tech Stack" value={props.selectedTech} onChange={props.setSelectedTech} options={['IoT', 'Robotics', 'AI/ML', 'Software', 'Python', 'Hardware', 'Web App', 'Mobile']} fallback="All Tech" />
            <button onClick={props.clearFilters} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Clear Filters</button>
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
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#7f1d1d] focus:ring-4 focus:ring-rose-100">
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
    <button onClick={() => onSelect(thesis)} className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200">
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-[#7f1d1d] ring-1 ring-rose-100">{thesis.batch_year || 'No batch'}</span>
        <BookOpen className="h-5 w-5 text-slate-300 transition group-hover:text-[#7f1d1d]" />
      </div>
      <h3 className="line-clamp-3 min-h-[4.5rem] text-lg font-bold leading-snug text-slate-950">{thesis.thesis_title}</h3>
      <p className="mt-4 text-sm font-medium text-slate-500">{authors.length ? authors.slice(0, 2).join(', ') : 'No authors listed'}{authors.length > 2 ? ' et al.' : ''}</p>
      <div className="mt-5 grid gap-2 text-sm">
        <p className="text-slate-500"><span className="font-semibold text-slate-700">Adviser:</span> {thesis.main_adviser || 'Unassigned'}</p>
        <p className="text-slate-500"><span className="font-semibold text-slate-700">Section:</span> {thesis.section_block || 'N/A'}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {badges.map((badge, index) => (
          <span key={badge} className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgePalette[index % badgePalette.length]}`}>{badge}</span>
        ))}
      </div>
    </button>
  );
}

function ThesisTable({ theses, onSelect }: { theses: Thesis[]; onSelect: (thesis: Thesis) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          <tr>
            <th className="px-5 py-4">Title</th>
            <th className="px-5 py-4">Batch</th>
            <th className="px-5 py-4">Adviser</th>
            <th className="px-5 py-4">Section</th>
            <th className="px-5 py-4">Technology</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {theses.map(thesis => (
            <tr key={thesis.archive_id} onClick={() => onSelect(thesis)} className="cursor-pointer hover:bg-rose-50/40">
              <td className="max-w-xl px-5 py-4 font-semibold text-slate-900">{thesis.thesis_title}</td>
              <td className="px-5 py-4 text-sm text-slate-600">{thesis.batch_year || 'N/A'}</td>
              <td className="px-5 py-4 text-sm text-slate-600">{thesis.main_adviser || 'Unassigned'}</td>
              <td className="px-5 py-4 text-sm text-slate-600">{thesis.section_block || 'N/A'}</td>
              <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{getTechBadges(thesis)[0]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ThesisModal({ thesis, onClose }: { thesis: Thesis; onClose: () => void }) {
  const authors = getAuthors(thesis);
  const panelMembers = thesis.final_panel_members?.split(',').map(panel => panel.trim()).filter(Boolean) || [];
  const keywords = getKeywords(thesis);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <BookOpen className="h-4 w-4 text-[#7f1d1d]" />
            Thesis Detail
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>

        <div className="grid max-h-[calc(92vh-73px)] overflow-y-auto lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="p-6 sm:p-8 lg:p-10">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#7f1d1d] ring-1 ring-rose-100">
              <FileText className="h-3.5 w-3.5" />
              Archived Research
            </p>
            <h2 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              {thesis.thesis_title || 'Untitled Thesis'}
            </h2>

            <section className="mt-10">
              <h3 className="mb-4 text-lg font-bold text-slate-950">Abstract</h3>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                <p className="whitespace-pre-line text-base leading-8 text-slate-700">
                  {thesis.abstract || 'No abstract has been provided for this archived thesis.'}
                </p>
              </div>
            </section>

            <section className="mt-8">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span key={keyword} className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${badgePalette[index % badgePalette.length]}`}>
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          </article>

          <aside className="border-t border-slate-100 bg-slate-50/80 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="sticky top-0 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/80 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7f1d1d] text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950">Thesis Metadata</h3>
                  <p className="text-sm text-slate-500">Academic record summary</p>
                </div>
              </div>

              <MetadataSection title="Authors">
                <div className="space-y-3">
                  {(authors.length ? authors : ['No authors listed']).map(author => (
                    <div key={author} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <UserRound className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{author}</span>
                    </div>
                  ))}
                </div>
              </MetadataSection>

              <MetadataSection title="Adviser & Panel Members">
                <div className="space-y-3">
                  <AcademicPerson label="Adviser" name={thesis.main_adviser || 'Unassigned'} />
                  {(panelMembers.length ? panelMembers : ['No panel members recorded']).map(panel => (
                    <AcademicPerson key={panel} label="Panel" name={panel} muted={!panelMembers.length} />
                  ))}
                </div>
              </MetadataSection>

              <MetadataSection title="Academic Context">
                <div className="grid grid-cols-2 gap-3">
                  <ContextTile label="Batch" value={thesis.batch_year || 'N/A'} />
                  <ContextTile label="Section" value={thesis.section_block || 'N/A'} />
                  <ContextTile label="Group" value={thesis.group_code || 'N/A'} wide />
                </div>
              </MetadataSection>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-100">
                <CalendarDays className="h-4 w-4" />
                <span>Date archived: <strong className="font-semibold text-slate-700">{dateLabel(thesis.created_at)}</strong></span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MetadataSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-100 py-5 first:border-t-0 first:pt-0">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{title}</h4>
      {children}
    </section>
  );
}

function AcademicPerson({ label, name, muted }: { label: string; name: string; muted?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-[#7f1d1d]">
        <GraduationCap className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className={`text-sm font-semibold ${muted ? 'text-slate-400' : 'text-slate-800'}`}>{name}</p>
      </div>
    </div>
  );
}

function ContextTile({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100 ${wide ? 'col-span-2' : ''}`}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
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
      setAuthError('Use an authorized admin, thesis head, or coordinator account.');
      return;
    }

    setAuthError('');
    setAuthenticated(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7f1d1d] text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-950">Administrative Archiving</h3>
              <p className="text-sm text-slate-500">{authenticated ? 'Choose an archive method' : 'Authentication required'}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!authenticated ? (
          <form onSubmit={submitAuth} className="mx-auto max-w-md p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-[#7f1d1d] ring-1 ring-rose-100">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">Admin Authentication</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Verify administrative privileges before modifying repository records.</p>
            </div>

            <div className="space-y-4">
              <Input label="Username" value={credentials.username} onChange={(value: string) => setCredentials({ ...credentials, username: value })} required />
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={event => setCredentials({ ...credentials, password: event.target.value })}
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-[#7f1d1d] focus:ring-4 focus:ring-rose-100"
                />
              </label>
            </div>
            {authError && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">{authError}</p>}
            <button type="submit" className="mt-6 w-full rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-900/20">
              Unlock Administrative Tools
            </button>
          </form>
        ) : (
          <div className="max-h-[82vh] overflow-y-auto p-6 sm:p-8">
            {mode === 'choice' && (
              <div className="grid gap-5 lg:grid-cols-2">
                <button onClick={() => setMode('manual')} className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-xl hover:shadow-slate-200">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7f1d1d] text-white shadow-lg shadow-rose-900/20">
                    <FileArchive className="h-7 w-7" />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-950">Manual Archive</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Add a single finalized thesis record with authors, adviser, academic context, and abstract.</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#7f1d1d]">Open form <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </button>

                <button onClick={() => setMode('bulk')} className="group rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-[#7f1d1d] hover:bg-rose-50/40">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#7f1d1d] shadow-sm ring-1 ring-rose-100">
                    <CloudUpload className="h-7 w-7" />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-950">Bulk Import CSV</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Upload a structured CSV file to parse and archive multiple thesis records in one workflow.</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#7f1d1d]">Prepare upload <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </button>
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

function FlowBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
      <ChevronRight className="h-4 w-4 rotate-180" />
      Back to choices
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
    <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-[#7f1d1d] hover:bg-rose-50/40">
      <input type="file" accept=".csv" className="hidden" onChange={event => importFile(event.target.files?.[0])} />
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-[#7f1d1d] shadow-sm ring-1 ring-rose-100">
        <CloudUpload className="h-10 w-10" />
      </div>
      <h4 className="text-2xl font-extrabold text-slate-950">Drop or select a CSV file</h4>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Use the department thesis archive template. The importer will parse thesis title, authors, batch, section, adviser, panel members, and abstract.</p>
      <span className="mt-6 inline-flex rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-900/20">
        {isImporting ? 'Importing...' : 'Choose CSV File'}
      </span>
    </label>
  );
}

function ArchiveForm({ form, setForm, isSaving, onClose, onSubmit }: any) {
  const update = (field: string, value: string) => setForm((current: typeof emptyForm) => ({ ...current, [field]: value }));

  return (
      <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <h3 className="mb-6 text-2xl font-extrabold text-slate-950">Manual Thesis Archive</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Thesis Title" value={form.thesis_title} onChange={(value: string) => update('thesis_title', value)} required wide />
          <Input label="Authors" value={form.author_name} onChange={(value: string) => update('author_name', value)} placeholder="Separate names with commas" required wide />
          <Input label="Batch Year" value={form.batch_year} onChange={(value: string) => update('batch_year', value)} required />
          <Input label="Section" value={form.section_block} onChange={(value: string) => update('section_block', value)} required />
          <Input label="Group Code" value={form.group_code} onChange={(value: string) => update('group_code', value)} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Main Adviser</span>
            <select value={form.main_adviser} onChange={event => update('main_adviser', event.target.value)} required className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-[#7f1d1d] focus:ring-4 focus:ring-rose-100">
              <option value="">Select adviser</option>
              {adviserOptions.map(adviser => <option key={adviser}>{adviser}</option>)}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Abstract</span>
            <textarea value={form.abstract} onChange={event => update('abstract', event.target.value)} required rows={5} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#7f1d1d] focus:ring-4 focus:ring-rose-100" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
          <button type="submit" disabled={isSaving} className="rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? 'Saving...' : 'Archive Thesis'}</button>
        </div>
      </form>
  );
}

function Input({ label, value, onChange, placeholder, required, wide }: any) {
  return (
    <label className={wide ? 'block md:col-span-2' : 'block'}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} required={required} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-[#7f1d1d] focus:ring-4 focus:ring-rose-100" />
    </label>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
