import { CivicTimeSlider } from '../../components/civic/CivicTimeSlider';

export default function BottomBar() {
  return (
    <div className="h-14 bg-gray-900/95 border-t border-gray-800 flex items-center px-4 z-30 backdrop-blur shrink-0">
      <div className="flex-1">
        <CivicTimeSlider onChange={() => {}} onReset={() => {}} />
      </div>
    </div>
  );
}
