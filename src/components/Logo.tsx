import { Crown } from 'lucide-react';
import { LOGO_TEXT } from '../lib/constants';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showCrown?: boolean;
}

export function Logo({ size = 'md', showCrown = true }: LogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const crownSizes = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`font-bold ${sizeClasses[size]} text-amber-500 tracking-tight`}>
        {LOGO_TEXT}
      </span>
      {showCrown && (
        <Crown
          size={crownSizes[size]}
          className="text-amber-500"
          fill="currentColor"
        />
      )}
    </div>
  );
}
