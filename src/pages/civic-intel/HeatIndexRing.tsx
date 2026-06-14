import { CityHeatIndexRing } from '../../components/civic/CityHeatIndexRing';
import type { HeatMood } from './hooks/useHeatIndex';

type Props = {
  score: number;
  mood: HeatMood;
};

export default function HeatIndexRing({ score, mood }: Props) {
  return <CityHeatIndexRing compositeScore={score} mood={mood} size="sm" />;
}
