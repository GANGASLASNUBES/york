import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export type HeatMood = 'energized' | 'stable' | 'stressed' | 'overloaded';

export type HeatFactors = {
  noise: number;
  traffic: number;
  airQuality: number;
  events: number;
  weather: number;
  transit: number;
};

export type HeatIndexState = {
  mood: HeatMood;
  score: number;
  factors: HeatFactors;
  updatedAt: string;
};

function computeMood(score: number): HeatMood {
  if (score <= 30) return 'stable';
  if (score <= 55) return 'energized';
  if (score <= 75) return 'stressed';
  return 'overloaded';
}

const DEFAULT_FACTORS: HeatFactors = {
  noise: 45,
  traffic: 58,
  airQuality: 32,
  events: 72,
  weather: 40,
  transit: 55,
};

function computeComposite(factors: HeatFactors): number {
  const weights = { noise: 0.15, traffic: 0.2, airQuality: 0.15, events: 0.2, weather: 0.15, transit: 0.15 };
  return Math.round(
    factors.noise * weights.noise +
    factors.traffic * weights.traffic +
    factors.airQuality * weights.airQuality +
    factors.events * weights.events +
    factors.weather * weights.weather +
    factors.transit * weights.transit
  );
}

export function useHeatIndex() {
  const [state, setState] = useState<HeatIndexState>(() => {
    const score = computeComposite(DEFAULT_FACTORS);
    return {
      mood: computeMood(score),
      score,
      factors: DEFAULT_FACTORS,
      updatedAt: new Date().toISOString(),
    };
  });
  const [history, setHistory] = useState<Array<{ score: number; timestamp: string }>>([]);

  useEffect(() => {
    async function fetchLatest() {
      const { data } = await supabase
        .from('city_heat_index')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const factors: HeatFactors = {
          noise: data.noise_score,
          traffic: data.traffic_score,
          airQuality: data.air_quality_score,
          events: data.events_score,
          weather: data.weather_score,
          transit: data.transit_score,
        };
        setState({
          mood: data.overall_mood as HeatMood,
          score: data.composite_score,
          factors,
          updatedAt: data.recorded_at,
        });
      }
    }

    async function fetchHistory() {
      const { data } = await supabase
        .from('city_heat_index')
        .select('composite_score, recorded_at')
        .order('recorded_at', { ascending: false })
        .limit(24);

      if (data) {
        setHistory(data.map((d) => ({ score: d.composite_score, timestamp: d.recorded_at })));
      }
    }

    fetchLatest();
    fetchHistory();
  }, []);

  return { ...state, history };
}
