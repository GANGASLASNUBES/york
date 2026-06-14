import { Archive, Image } from 'lucide-react';

interface ProvenanceObject {
  _id: string;
  _creationTime: number;
  ownerContactId: string;
  label: string;
  description: string;
  type: string;
  siteId?: string;
  createdAt: number;
}

interface ProvenanceCardProps {
  provenance: ProvenanceObject;
  ownerName?: string;
  mediaCount?: number;
  onClick?: () => void;
}

const typeColors = {
  recipe: 'from-pink-400 to-pink-600',
  artifact: 'from-yellow-400 to-yellow-600',
  event: 'from-purple-400 to-purple-600',
  other: 'from-gray-400 to-gray-600',
};

export function ProvenanceCard({
  provenance,
  ownerName = 'Unknown',
  mediaCount = 0,
  onClick,
}: ProvenanceCardProps) {
  const typeKey = (provenance.type as keyof typeof typeColors) || 'other';
  const gradient = typeColors[typeKey] || typeColors.other;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient}`} />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{provenance.label}</h3>
          <p className="text-sm text-gray-500 capitalize">{provenance.type}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{provenance.description}</p>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{ownerName}</p>
        {mediaCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Image size={14} />
            <span>{mediaCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
