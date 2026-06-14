import { MapPin, User, CircleCheck as CheckCircle } from 'lucide-react';

interface Ritual {
  _id: string;
  _creationTime: number;
  label: string;
  description: string;
  scope: 'triad' | 'site' | 'contact';
  siteId?: string;
  contactId?: string;
  steps: string[];
  createdAt: number;
}

interface RitualCardProps {
  ritual: Ritual;
  siteName?: string;
  contactName?: string;
  onClick?: () => void;
}

const scopeColors = {
  triad: 'from-blue-400 to-blue-600',
  site: 'from-teal-400 to-teal-600',
  contact: 'from-purple-400 to-purple-600',
};

export function RitualCard({
  ritual,
  siteName,
  contactName,
  onClick,
}: RitualCardProps) {
  const gradient = scopeColors[ritual.scope as keyof typeof scopeColors];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient}`} />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{ritual.label}</h3>
          <p className="text-sm text-gray-500 capitalize">{ritual.scope}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ritual.description}</p>

      <div className="mb-3 flex flex-wrap gap-2">
        {ritual.steps.slice(0, 2).map((step, idx) => (
          <div key={idx} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
            <CheckCircle size={12} />
            <span className="line-clamp-1">{step}</span>
          </div>
        ))}
        {ritual.steps.length > 2 && (
          <p className="text-xs text-gray-500 px-2 py-1">+{ritual.steps.length - 2} more</p>
        )}
      </div>

      <div className="flex gap-4 text-xs text-gray-500">
        {siteName && (
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{siteName}</span>
          </div>
        )}
        {contactName && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{contactName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
