// ===========================================================================
// weather.ts — live forecast for each base, and the ONE call it implies.
//
// Why this exists: the plan is full of "clear-day pick", "go at opening,
//   mornings are glass", "cloud kills the 5 Fingers view", "check the
//   forecast/webcams that morning". That instruction is useless if checking
//   means leaving the app. So the app checks.
//
// Source: Open-Meteo (open-meteo.com) — free, no API key, CORS-enabled, and
//   it does not require registration that could expire mid-trip. Model data,
//   updated hourly. It is a FORECAST and the UI says so, with the time it was
//   fetched — never a confident-sounding claim about next Tuesday.
//
// Offline: the last successful response is kept in localStorage. With no
//   signal she gets the last known forecast, clearly labelled with its age,
//   rather than a blank box. Stale-and-labelled beats absent.
//   (This is a cache of public forecast data, not private state — the tandem
//   rule is about state Claude can't reach, which this is not.)
// ===========================================================================

export interface BaseCoord {
  key: string;
  name: string;
  lat: number;
  lon: number;
}

export const BASE_COORDS: BaseCoord[] = [
  { key: 'goisern', name: 'Bad Goisern', lat: 47.6408, lon: 13.6183 },
  { key: 'zell', name: 'Zell am See', lat: 47.3232, lon: 12.7942 },
  { key: 'gosau', name: 'Gosau', lat: 47.5847, lon: 13.5347 },
  { key: 'wals', name: 'Wals / Salzburg', lat: 47.7833, lon: 12.9667 },
];

export interface DayWeather {
  date: string; // YYYY-MM-DD
  code: number; // WMO weather code
  tMin: number;
  tMax: number;
  rainMm: number;
  rainChance: number;
  sunset: string; // HH:MM
}

export interface BaseForecast {
  base: BaseCoord;
  days: DayWeather[];
}

interface CacheShape {
  fetchedAt: number;
  data: BaseForecast[];
}

const CACHE_KEY = 'austria_weather_cache_v1';
const START = '2026-07-24';
const END = '2026-07-31';

/** WMO code → a plain-words label and an emoji. No meteorology jargon. */
export function describe(code: number): { icon: string; label: string; wet: boolean } {
  if (code === 0) return { icon: '☀️', label: 'clear', wet: false };
  if (code <= 2) return { icon: '🌤', label: 'mostly sunny', wet: false };
  if (code === 3) return { icon: '☁️', label: 'cloudy', wet: false };
  if (code === 45 || code === 48) return { icon: '🌫', label: 'fog', wet: false };
  if (code >= 51 && code <= 57) return { icon: '🌦', label: 'drizzle', wet: true };
  if (code >= 61 && code <= 67) return { icon: '🌧', label: 'rain', wet: true };
  if (code >= 71 && code <= 77) return { icon: '🌨', label: 'snow', wet: true };
  if (code >= 80 && code <= 82) return { icon: '🌧', label: 'showers', wet: true };
  if (code >= 85 && code <= 86) return { icon: '🌨', label: 'snow showers', wet: true };
  if (code >= 95) return { icon: '⛈', label: 'thunderstorms', wet: true };
  return { icon: '•', label: 'unknown', wet: false };
}

interface OpenMeteoDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: (number | null)[];
  sunset: string[];
}

async function fetchOne(base: BaseCoord): Promise<BaseForecast> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${base.lat}&longitude=${base.lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunset` +
    `&timezone=Europe%2FVienna&start_date=${START}&end_date=${END}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather ${base.key} failed (${res.status})`);
  const json = (await res.json()) as { daily: OpenMeteoDaily };
  const d = json.daily;
  return {
    base,
    days: d.time.map((date, i) => ({
      date,
      code: d.weather_code[i],
      tMin: Math.round(d.temperature_2m_min[i]),
      tMax: Math.round(d.temperature_2m_max[i]),
      rainMm: d.precipitation_sum[i],
      rainChance: d.precipitation_probability_max[i] ?? 0,
      sunset: (d.sunset[i] ?? '').slice(11, 16),
    })),
  };
}

function readCache(): CacheShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheShape) : null;
  } catch {
    return null;
  }
}

export interface WeatherResult {
  forecasts: BaseForecast[];
  /** ms since epoch when this data was actually fetched from the network. */
  fetchedAt: number;
  /** True when the network failed and this is the last-known cached copy. */
  stale: boolean;
}

/** Fetch all four bases. Falls back to the cached copy, clearly marked stale.
 *  Throws only when there is no network AND no cache — the caller then says
 *  so out loud rather than rendering an empty strip. */
export async function getWeather(): Promise<WeatherResult> {
  try {
    const forecasts = await Promise.all(BASE_COORDS.map(fetchOne));
    const payload: CacheShape = { fetchedAt: Date.now(), data: forecasts };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      /* storage full or blocked — the live data is still fine to use */
    }
    return { forecasts, fetchedAt: payload.fetchedAt, stale: false };
  } catch {
    const cached = readCache();
    if (!cached) throw new Error('no forecast available and nothing cached');
    return { forecasts: cached.data, fetchedAt: cached.fetchedAt, stale: true };
  }
}

/** "just now" / "2 h ago" / "yesterday" — so a stale forecast admits its age. */
export function ageLabel(fetchedAt: number): string {
  const mins = Math.floor((Date.now() - fetchedAt) / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

export function dayFor(f: BaseForecast, date: string): DayWeather | undefined {
  return f.days.find((d) => d.date === date);
}

/** The call the forecast implies — this is the point of the whole module.
 *  Kept deliberately blunt: one sentence, one destination. */
export function verdict(d: DayWeather): { headline: string; href: string; cta: string } {
  const w = describe(d.code);
  if (d.rainMm >= 5 || d.rainChance >= 70) {
    return {
      headline: `Wet day — ${d.rainMm.toFixed(0)} mm, ${d.rainChance}% chance`,
      href: 'plan.html?rain=1',
      cta: 'Show me what still works wet',
    };
  }
  if (w.wet) {
    return {
      headline: `Showers about — ${d.rainChance}% chance`,
      href: 'plan.html?rain=1',
      cta: 'Keep the wet-proof options in reach',
    };
  }
  if (d.code <= 2 && d.tMax >= 24) {
    return {
      headline: `Clear and warm, up to ${d.tMax}°C`,
      href: 'favorites.html',
      cta: 'This is a high-mountain or swimming day',
    };
  }
  if (d.code <= 2) {
    return {
      headline: `Clear, ${d.tMin}–${d.tMax}°C`,
      href: 'favorites.html',
      cta: 'Good visibility — take the viewpoint day',
    };
  }
  return {
    headline: `Cloudy, ${d.tMin}–${d.tMax}°C`,
    href: 'plan.html',
    cta: 'Fine for lakes and valleys, poor for summit views',
  };
}
