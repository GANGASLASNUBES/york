import { Shield, Tag } from 'lucide-react';

interface Contact {
  _id: string;
  _creationTime: number;
  displayName: string;
  type: 'person' | 'org' | 'device' | 'site';
  avatarSeed: string;
  importanceLevel: number;
  tags: string[];
  shortNote: string;
  longNote: string;
  createdAt: number;
}

interface ContactCardProps {
  contact: Contact;
  trustLevel?: 'unknown' | 'known' | 'trusted' | 'critical';
  onClick?: () => void;
}

const trustColors = {
  unknown: 'bg-gray-100 text-gray-700',
  known: 'bg-blue-100 text-blue-700',
  trusted: 'bg-green-100 text-green-700',
  critical: 'bg-orange-100 text-orange-700',
};

export function ContactCard({ contact, trustLevel = 'unknown', onClick }: ContactCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br"
            style={{
              backgroundImage: `linear-gradient(135deg, hsl(${Math.abs(contact.avatarSeed.charCodeAt(0)) * 360 / 256}, 70%, 60%), hsl(${Math.abs(contact.avatarSeed.charCodeAt(1)) * 360 / 256}, 70%, 70%))`,
            }}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{contact.displayName}</h3>
            <p className="text-sm text-gray-500 capitalize">{contact.type}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${trustColors[trustLevel]}`}>
          {trustLevel}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{contact.shortNote}</p>

      <div className="flex items-center gap-2 mb-3">
        {contact.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
            <Tag size={12} />
            {tag}
          </span>
        ))}
        {contact.tags.length > 2 && (
          <span className="text-xs text-gray-500">+{contact.tags.length - 2}</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Shield size={14} />
          Level {contact.importanceLevel}
        </div>
      </div>
    </div>
  );
}
