import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, Save, Check, Globe, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcher from '../../components/LanguageSwitcher';

type TranslationRow = {
  id: string;
  key: string;
  en: string;
  fr: string;
  es: string;
  zh: string;
};

type FilterMode = 'all' | 'missing';

export default function TranslationConsolePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [editedRows, setEditedRows] = useState<Map<string, Partial<TranslationRow>>>(new Map());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('translations')
        .select('*')
        .order('key');
      if (data) {
        setRows(data as TranslationRow[]);
      }
    }
    load();
  }, []);

  const filteredRows = rows.filter((row) => {
    const matchesSearch = !search || row.key.toLowerCase().includes(search.toLowerCase()) ||
      row.en.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (!row.fr || !row.es || !row.zh);
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (id: string, lang: string, value: string) => {
    const existing = editedRows.get(id) || {};
    const updated = new Map(editedRows);
    updated.set(id, { ...existing, [lang]: value });
    setEditedRows(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const updates = Array.from(editedRows.entries());
    for (const [id, changes] of updates) {
      await supabase.from('translations').update({
        ...changes,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }).eq('id', id);
    }
    setEditedRows(new Map());
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    const { data } = await supabase.from('translations').select('*').order('key');
    if (data) setRows(data as TranslationRow[]);
  };

  const handleAddKey = async () => {
    if (!user || !search.trim()) return;
    const { data } = await supabase.from('translations').insert({
      key: search.trim(),
      en: '',
      fr: '',
      es: '',
      zh: '',
      updated_by: user.id,
    }).select().maybeSingle();
    if (data) {
      setRows((prev) => [...prev, data as TranslationRow]);
      setSearch('');
    }
  };

  const missingCount = rows.filter((r) => !r.fr || !r.es || !r.zh).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-900/95 border-b border-gray-800 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-white">
              <ArrowLeft size={16} />
            </button>
            <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center">
              <Globe size={14} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold">{t('admin.translationConsole')}</h1>
              <p className="text-[10px] text-gray-500">{rows.length} keys | {missingCount} incomplete</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            {editedRows.size > 0 && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
              >
                {saving ? <span className="animate-pulse">...</span> : saved ? <Check size={12} /> : <Save size={12} />}
                {saved ? t('admin.saved') : t('admin.saveChanges')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.searchKeys')}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-600"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                filter === 'all' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t('admin.allKeys')}
            </button>
            <button
              onClick={() => setFilter('missing')}
              className={`px-3 py-2 rounded-lg text-[10px] font-medium transition-colors flex items-center gap-1 ${
                filter === 'missing' ? 'bg-amber-900/40 text-amber-300' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <AlertCircle size={10} />
              {t('admin.missingTranslations')} ({missingCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[200px_1fr_1fr_1fr_1fr] gap-0 border-b border-gray-800 bg-gray-800/50">
            <div className="px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase">{t('admin.key')}</div>
            <div className="px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase border-l border-gray-800">EN</div>
            <div className="px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase border-l border-gray-800">FR</div>
            <div className="px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase border-l border-gray-800">ES</div>
            <div className="px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase border-l border-gray-800">ZH</div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredRows.map((row) => {
              const edited = editedRows.get(row.id);
              return (
                <div key={row.id} className="grid grid-cols-[200px_1fr_1fr_1fr_1fr] gap-0 border-b border-gray-800/50 hover:bg-gray-800/20">
                  <div className="px-3 py-2 text-[10px] text-gray-300 font-mono truncate">{row.key}</div>
                  {(['en', 'fr', 'es', 'zh'] as const).map((lang) => {
                    const val = edited?.[lang] ?? row[lang];
                    const missing = !val;
                    return (
                      <div key={lang} className={`border-l border-gray-800/50 ${missing ? 'bg-red-900/10' : ''}`}>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleEdit(row.id, lang, e.target.value)}
                          className="w-full bg-transparent px-3 py-2 text-[10px] text-gray-200 focus:outline-none focus:bg-gray-800/50"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add new key */}
        {search && !rows.some((r) => r.key === search) && (
          <div className="mt-3">
            <button
              onClick={handleAddKey}
              className="text-[10px] text-amber-400 hover:text-amber-300"
            >
              + Add key "{search}"
            </button>
          </div>
        )}

        {filteredRows.length === 0 && (
          <div className="text-center py-12">
            <Globe size={24} className="text-gray-700 mx-auto mb-3" />
            <p className="text-xs text-gray-500">No translation keys found</p>
          </div>
        )}
      </div>
    </div>
  );
}
