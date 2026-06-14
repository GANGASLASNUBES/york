import { Users, Archive, BookOpen } from 'lucide-react';

interface Site {
  _id: string;
  _creationTime: number;
  label: string;
  code: string;
  type: 'shelter' | 'field' | 'work' | 'other';
  latitude: number | null;
  longitude: number | null;
  description: string;
  active: boolean;
  createdAt: number;
}

interface SiteCardProps {
  site: Site;
  contactCount?: number;
  provenanceCount?: number;
  ritualCount?: number;
  onClick?: () => void;
}

const siteColors = {
  shelter: 'from-teal-400 to-teal-600',
  field: 'from-amber-400 to-amber-600',
  work: 'from-indigo-400 to-indigo-600',
  other: 'from-gray-400 to-gray-600',
};

export function SiteCard({
  site,
  contactCount = 0,
  provenanceCount = 0,
  ritualCount = 0,
  onClick,
}: SiteCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${siteColors[site.type]}`} />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{site.label}</h3>
          <p className="text-sm text-gray-500">
            {site.code}
            {site.latitude && ` · ${site.latitude.toFixed(2)}, ${site.longitude?.toFixed(2)}`}
          </p>
        </div>
        {site.active && (
          <div className="w-3 h-3 rounded-full bg-green-500" title="Active" />
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{site.description}</p>

      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <Users size={14} />
          <span>{contactCount}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Archive size={14} />
          <span>{provenanceCount}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <BookOpen size={14} />
          <span>{ritualCount}</span>
        </div>
      </div>
    </div>
  );
}
