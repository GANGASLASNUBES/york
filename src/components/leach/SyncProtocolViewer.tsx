import { type ReactElement } from 'react';
import { BookOpen, Clock, User } from 'lucide-react';

type Props = {
  content: string;
  updatedAt: number;
  updatedBy: string;
};

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderMarkdown(md: string) {
  const lines = md.split('\n');
  const elements: ReactElement[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-white mb-4 mt-8 first:mt-0">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-lg font-semibold text-white mb-3 mt-6">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-gray-200 mb-2 mt-4">
          {line.slice(4)}
        </h3>
      );
    } else if (line === '---') {
      elements.push(<hr key={i} className="border-gray-800 my-6" />);
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={i} className="text-sm text-gray-300 leading-relaxed ml-4 list-disc mb-1">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, '');
      elements.push(
        <li key={i} className="text-sm text-gray-300 leading-relaxed ml-4 list-decimal mb-1">
          {renderInline(text)}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-gray-300 leading-relaxed mb-2">
          {renderInline(line)}
        </p>
      );
    }
  }

  return elements;
}

export function SyncProtocolViewer({ content, updatedAt, updatedBy }: Props) {
  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600/20 rounded-xl flex items-center justify-center">
              <BookOpen size={16} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Sync Protocol</h2>
              <p className="text-[10px] text-gray-500">Operational alignment guide</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Clock size={10} />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <User size={10} />
              <span>{updatedBy === 'system' ? 'Default' : updatedBy}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {renderMarkdown(content)}
        </div>
      </div>
    </div>
  );
}
