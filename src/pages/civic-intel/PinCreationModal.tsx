import { CivicPinForm, type PinData } from '../../components/civic/CivicPinForm';

type Props = {
  position: { lat: number; lng: number } | null;
  onSave: (pin: PinData) => void;
  onCancel: () => void;
};

export default function PinCreationModal({ position, onSave, onCancel }: Props) {
  if (!position) return null;

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
      <CivicPinForm
        lat={position.lat}
        lng={position.lng}
        onSave={onSave}
        onCancel={onCancel}
      />
    </div>
  );
}
