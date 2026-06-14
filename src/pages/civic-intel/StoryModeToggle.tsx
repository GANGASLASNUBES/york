type Props = {
  active: boolean;
  onToggle: () => void;
};

export default function StoryModeToggle({ active, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
        active ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50' : 'bg-gray-800 text-gray-500'
      }`}
    >
      Story Mode
    </button>
  );
}
