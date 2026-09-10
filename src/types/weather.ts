export interface RawHourData {
  datetime: string;
  datetimeEpoch?: number;
  temp: number;
  windspeed: number;
  precipprob?: number | null;
  precip?: number | null;
  preciptype?: string[] | null;
  conditions: string;
  icon?: string;
}

export interface RawDayData {
  datetime: string;
  tempmin: number;
  tempmax: number;
  windspeed: number;
  precipprob?: number | null;
  precip?: number | null;
  preciptype?: string[] | null;
  conditions: string;
  icon?: string;
  hours: RawHourData[];
}

export interface RawWeatherData {
  resolvedAddress: string;
  address?: string;
  days: RawDayData[];
}

export interface WeatherSummary {
  tempRange: string;
  wind: string;
  rainChance: string;
  condition: string;
}

export interface TimelineItem {
  rawDateTime: string;
  dateLabel: string;
  time: string;
  temp: string;
  wind: string;
  rainChance: string;
  condition: string;
  isCurrentHour: boolean;
  isPast: boolean;
}

export interface WeatherOutlookResult {
  location: string;
  date: string;
  summary: WeatherSummary;
  timeline: TimelineItem[];
}

export function translateCondition(condition: string): string {
  if (!condition) return 'Cerah';

  const map: Record<string, string> = {
    'partially cloudy': 'Cerah Berawan',
    'partly cloudy': 'Cerah Berawan',
    'clear': 'Cerah',
    'overcast': 'Mendung',
    'rain, overcast': 'Hujan & Mendung',
    'rain, partially cloudy': 'Hujan & Cerah Berawan',
    'rain, partly cloudy': 'Hujan & Cerah Berawan',
    'rain': 'Hujan',
    'rain shower': 'Hujan Lokal',
    'light rain': 'Hujan Ringan',
    'heavy rain': 'Hujan Lebat',
    'thunderstorm': 'Badai Petir',
    'snow': 'Salju',
    'fog': 'Kabut',
    'windy': 'Berangin',
    'sunny': 'Cerah'
  };

  const lower = condition.toLowerCase().trim();
  if (map[lower]) return map[lower];

  if (lower.includes(',')) {
    return lower
      .split(',')
      .map(part => translateCondition(part.trim()))
      .join(' & ');
  }

  if (lower.includes('rain')) return 'Hujan';
  if (lower.includes('thunder') || lower.includes('storm')) return 'Badai Petir';
  if (lower.includes('cloud')) return 'Berawan';
  if (lower.includes('clear') || lower.includes('sun')) return 'Cerah';

  return condition;
}

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function weatherOutlook(data: RawWeatherData): WeatherOutlookResult {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDate = String(now.getDate()).padStart(2, '0');
  const todayStr = `${currentYear}-${currentMonth}-${currentDate}`;
  const currentHour = now.getHours();

  const todayData = data.days.find(d => d.datetime === todayStr) || data.days[1] || data.days[0];

  interface ExtendedHour extends RawHourData {
    dayDate: string;
  }

  const allHours: ExtendedHour[] = [];
  data.days.forEach(day => {
    if (day.hours && Array.isArray(day.hours)) {
      day.hours.forEach(hour => {
        allHours.push({
          ...hour,
          dayDate: day.datetime
        });
      });
    }
  });

  const nowMs = now.getTime();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const minTimeMs = nowMs - twentyFourHoursMs;
  const maxTimeMs = nowMs + twentyFourHoursMs;

  const getHourRainChance = (h: RawHourData): number => {
    if (typeof h.precipprob === 'number' && h.precipprob !== null) {
      return Math.round(h.precipprob);
    }
    if (typeof h.precip === 'number' && h.precip !== null && h.precip > 0) {
      return 100;
    }
    return 0;
  };

  const timelineItems: TimelineItem[] = allHours
    .filter(h => {
      const hourStr = h.datetime.length === 5 ? `${h.datetime}:00` : h.datetime;
      const fullIsoStr = `${h.dayDate}T${hourStr}`;
      const itemDate = new Date(fullIsoStr);
      const itemTimeMs = itemDate.getTime();
      return !isNaN(itemTimeMs) && itemTimeMs >= minTimeMs && itemTimeMs <= maxTimeMs;
    })
    .map(h => {
      const hourStr = h.datetime.length === 5 ? `${h.datetime}:00` : h.datetime;
      const fullIsoStr = `${h.dayDate}T${hourStr}`;
      const itemDate = new Date(fullIsoStr);
      const itemTimeMs = itemDate.getTime();

      const isToday = h.dayDate === todayStr;
      const hourNum = parseInt(h.datetime.split(':')[0], 10);
      const isCurrentHour = isToday && hourNum === currentHour;

      const isPast = itemTimeMs < nowMs - 30 * 60 * 1000;

      let dateLabel: string;
      const dayDiff = Math.round((new Date(h.dayDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
      if (dayDiff === 0) dateLabel = 'Hari Ini';
      else if (dayDiff === -1) dateLabel = 'Kemarin';
      else if (dayDiff === 1) dateLabel = 'Besok';
      else {
        const d = new Date(h.dayDate);
        dateLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      }

      const timeFormatted = `${String(hourNum).padStart(2, '0')}:00`;

      return {
        rawDateTime: fullIsoStr,
        dateLabel,
        time: timeFormatted,
        temp: `${Math.round(h.temp)}°C`,
        wind: `${Math.round(h.windspeed)} km/h`,
        rainChance: `${getHourRainChance(h)}%`,
        condition: translateCondition(h.conditions || 'Cerah'),
        isCurrentHour,
        isPast
      };
    });

  const todayHours = todayData?.hours || [];
  const hourRainChances = todayHours.map(getHourRainChance);
  const dayPrecipprob = typeof todayData?.precipprob === 'number' && todayData.precipprob !== null ? todayData.precipprob : 0;

  const maxRainChance = Math.max(dayPrecipprob, ...hourRainChances, 0);

  return {
    location: data.resolvedAddress || data.address || 'Lokasi Tidak Diketahui',
    date: formatIndonesianDate(todayData?.datetime || todayStr),
    summary: {
      tempRange: `${Math.round(todayData?.tempmin ?? 0)}°C - ${Math.round(todayData?.tempmax ?? 0)}°C`,
      wind: `${Math.round(todayData?.windspeed ?? 0)} km/h`,
      rainChance: `${Math.round(maxRainChance)}%`,
      condition: translateCondition(todayData?.conditions || 'Cerah')
    },
    timeline: timelineItems
  };
}

export const VISUAL_CROSSING_API_KEY = "VWQ3MJU7HFH9A6EX5VWC29NNS";

export async function fetchWeatherData(location: string): Promise<WeatherOutlookResult> {
  const encodedLocation = encodeURIComponent(location);
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodedLocation}/yesterday/tomorrow?unitGroup=metric&key=${VISUAL_CROSSING_API_KEY}&include=hours`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(`Lokasi "${location}" tidak ditemukan. Silakan periksa kembali nama kota.`);
    }
    throw new Error(`Gagal mengambil data cuaca (HTTP ${response.status})`);
  }

  const data: RawWeatherData = await response.json();
  return weatherOutlook(data);
}

export const sampleWeatherData: RawWeatherData = {
  resolvedAddress: "Serang, Indonesia",
  days: [
    {
      datetime: "2026-09-06",
      tempmin: 24,
      tempmax: 32,
      windspeed: 14,
      precipprob: 10,
      conditions: "Partially cloudy",
      hours: Array.from({ length: 24 }, (_, i) => ({
        datetime: `${String(i).padStart(2, '0')}:00:00`,
        temp: 24 + (i % 6),
        windspeed: 10 + (i % 5),
        precipprob: i === 18 ? 40 : 0,
        conditions: i === 18 ? "Rain" : "Clear"
      }))
    },
    {
      datetime: new Date().toISOString().split('T')[0],
      tempmin: 25,
      tempmax: 34,
      windspeed: 19.1,
      precipprob: 0,
      precip: 0.1,
      conditions: "Partially cloudy",
      hours: Array.from({ length: 24 }, (_, i) => ({
        datetime: `${String(i).padStart(2, '0')}:00:00`,
        temp: 25 + Math.round(Math.sin((i / 24) * Math.PI) * 9),
        windspeed: 8 + (i % 8),
        precipprob: i === 7 ? 0 : (i >= 13 && i <= 16 ? 30 : 0),
        precip: i === 7 ? 0.1 : 0,
        conditions: i === 7 ? "Rain Shower" : (i >= 12 && i <= 15 ? "Partially cloudy" : "Clear")
      }))
    },
    {
      datetime: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      tempmin: 24,
      tempmax: 33,
      windspeed: 16,
      precipprob: 20,
      conditions: "Partially cloudy",
      hours: Array.from({ length: 24 }, (_, i) => ({
        datetime: `${String(i).padStart(2, '0')}:00:00`,
        temp: 24 + (i % 8),
        windspeed: 9 + (i % 6),
        precipprob: i === 14 ? 50 : 0,
        conditions: i === 14 ? "Thunderstorm" : "Partially cloudy"
      }))
    }
  ]
};
