import { useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import {
  adminListCareers,
  adminCreateCareer,
  adminDeleteCareer,
  adminListSkills,
  adminCreateSkill,
  adminDeleteSkill,
  adminListResources,
  adminCreateResource,
  adminDeleteResource,
} from '../services/adminApi';
import { getErrorMessage } from '../services/api';

const TABS = ['Careers', 'Skills', 'Resources'];

const SKILL_CATEGORIES = ['frontend', 'backend', 'database', 'devops', 'data', 'ai-ml', 'security', 'cloud', 'design', 'soft-skills', 'other'];
const RESOURCE_TYPES = ['video', 'course', 'documentation', 'article', 'tutorial', 'practice', 'project'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminPage() {
  const [tab, setTab] = useState('Careers');
  const [careers, setCareers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = () => {
    setLoading(true);
    setError('');
    Promise.all([adminListCareers(), adminListSkills(), adminListResources()])
      .then(([c, s, r]) => {
        setCareers(c);
        setSkills(s);
        setResources(r);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  if (loading) return <LoadingSpinner fullScreen label="Loading admin data..." />;
  if (error) return <ErrorState message={error} onRetry={loadAll} />;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${
              tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Careers' && <CareersTab careers={careers} skills={skills} onChange={loadAll} />}
      {tab === 'Skills' && <SkillsTab skills={skills} onChange={loadAll} />}
      {tab === 'Resources' && <ResourcesTab resources={resources} skills={skills} onChange={loadAll} />}
    </div>
  );
}

function CareersTab({ careers, skills, onChange }) {
  const [form, setForm] = useState({ name: '', description: '', category: 'software-development', requiredSkills: [], recommendedSkills: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminCreateCareer({ ...form, slug: slugify(form.name), typicalProjects: [] });
      setForm({ name: '', description: '', category: 'software-development', requiredSkills: [], recommendedSkills: [] });
      onChange();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="font-semibold text-slate-900">All Careers ({careers.length})</h3>
        <ul className="mt-4 divide-y divide-slate-100">
          {careers.map((c) => (
            <li key={c._id} className="flex items-center justify-between py-2.5 text-sm">
              <span>{c.name} <span className="text-xs text-slate-400">({c.requiredSkills.length} required skills)</span></span>
              <button onClick={() => adminDeleteCareer(c._id).then(onChange)} className="text-slate-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900">Add Career</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} />
          <select multiple value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: Array.from(e.target.selectedOptions, (o) => o.value) })} className="h-32 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {skills.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <p className="text-xs text-slate-400">Ctrl/Cmd-click to select multiple required skills.</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" loading={saving} size="sm"><Plus className="h-4 w-4" /> Add Career</Button>
        </form>
      </Card>
    </div>
  );
}

function SkillsTab({ skills, onChange }) {
  const [form, setForm] = useState({ name: '', category: 'frontend', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminCreateSkill({ ...form, slug: slugify(form.name) });
      setForm({ name: '', category: 'frontend', description: '' });
      onChange();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="font-semibold text-slate-900">All Skills ({skills.length})</h3>
        <ul className="mt-4 max-h-96 divide-y divide-slate-100 overflow-y-auto">
          {skills.map((s) => (
            <li key={s._id} className="flex items-center justify-between py-2.5 text-sm">
              <span>{s.name} <span className="text-xs capitalize text-slate-400">({s.category})</span></span>
              <button onClick={() => adminDeleteSkill(s._id).then(onChange)} className="text-slate-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900">Add Skill</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" loading={saving} size="sm"><Plus className="h-4 w-4" /> Add Skill</Button>
        </form>
      </Card>
    </div>
  );
}

function ResourcesTab({ resources, skills, onChange }) {
  const [form, setForm] = useState({ title: '', provider: '', url: '', type: 'course', skill: skills[0]?._id || '', level: 'beginner', isFree: true, description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminCreateResource({ ...form, tags: [] });
      setForm({ title: '', provider: '', url: '', type: 'course', skill: skills[0]?._id || '', level: 'beginner', isFree: true, description: '' });
      onChange();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="font-semibold text-slate-900">All Resources ({resources.length})</h3>
        <ul className="mt-4 max-h-96 divide-y divide-slate-100 overflow-y-auto">
          {resources.map((r) => (
            <li key={r._id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="truncate pr-2">{r.title} <span className="text-xs text-slate-400">({r.provider})</span></span>
              <button onClick={() => adminDeleteResource(r._id).then(onChange)} className="shrink-0 text-slate-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900">Add Resource</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input required placeholder="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input required type="url" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <select required value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Select skill</option>
            {skills.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} /> Free resource
          </label>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" loading={saving} size="sm"><Plus className="h-4 w-4" /> Add Resource</Button>
        </form>
      </Card>
    </div>
  );
}
