export interface RawHourData {
  datetime: string;
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
  time: string;
  temp: string;
  wind: string;
  rainChance: string;
  condition: string;
}

export interface WeatherOutlookResult {
  location: string;
  date: string;
  summary: WeatherSummary;
  timeline: TimelineItem[];
}

export function weatherOutlook(data: RawWeatherData): WeatherOutlookResult {
  const today = data.days[0];
  const hours = today?.hours || [];

  // Helper to compute probability of rain for an hour
  const getHourRainChance = (h: RawHourData): number => {
    // If precipprob is specified and > 0
    if (typeof h.precipprob === 'number' && h.precipprob > 0) {
      return Math.round(h.precipprob);
    }
    // If actual precipitation occurred (e.g. 0.1 mm), rain probability was effectively 100%
    if (typeof h.precip === 'number' && h.precip > 0) {
      return 100;
    }
    return Math.round(h.precipprob || 0);
  };

  const hourRainChances = hours.map(getHourRainChance);
  const dayPrecipprob = typeof today?.precipprob === 'number' ? today.precipprob : 0;
  const dayPrecip = typeof today?.precip === 'number' ? today.precip : 0;
  
  let maxRainChance = Math.max(dayPrecipprob, ...hourRainChances, 0);
  if (dayPrecip > 0 && maxRainChance === 0) {
    maxRainChance = 100;
  }

  // Format time string "07:00:00" -> "07:00"
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  return {
    location: data.resolvedAddress || data.address || 'Unknown Location',
    date: today?.datetime || '',
    summary: {
      tempRange: `${Math.round(today?.tempmin ?? 0)}°C - ${Math.round(today?.tempmax ?? 0)}°C`,
      wind: `${Math.round(today?.windspeed ?? 0)} km/h`,
      rainChance: `${Math.round(maxRainChance)}%`,
      condition: today?.conditions || 'Unknown'
    },
    timeline: hours.map(h => ({
      time: formatTime(h.datetime),
      temp: `${Math.round(h.temp)}°C`,
      wind: `${Math.round(h.windspeed)} km/h`,
      rainChance: `${getHourRainChance(h)}%`,
      condition: h.conditions || 'Clear'
    }))
  };
}

export const VISUAL_CROSSING_API_KEY = "VWQ3MJU7HFH9A6EX5VWC29NNS";

export async function fetchWeatherData(location: string): Promise<WeatherOutlookResult> {
  const encodedLocation = encodeURIComponent(location);
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodedLocation}/today?unitGroup=metric&key=${VISUAL_CROSSING_API_KEY}&include=hours`;

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
      datetime: "2026-09-07",
      tempmin: 25,
      tempmax: 34,
      windspeed: 19.1,
      precipprob: 0,
      precip: 0.1,
      conditions: "Partially cloudy",
      hours: [
        { datetime: "00:00:00", temp: 27, windspeed: 5.4, precipprob: 0, conditions: "Partially cloudy" },
        { datetime: "03:00:00", temp: 26, windspeed: 11.2, precipprob: 0, conditions: "Partially cloudy" },
        { datetime: "06:00:00", temp: 25, windspeed: 9.4, precipprob: 0, conditions: "Partially cloudy" },
        { datetime: "07:00:00", temp: 26, windspeed: 7.6, precipprob: 0, precip: 0.1, preciptype: ["rain"], conditions: "Partially cloudy" },
        { datetime: "09:00:00", temp: 30, windspeed: 11.2, precipprob: 0, conditions: "Partially cloudy" },
        { datetime: "12:00:00", temp: 34, windspeed: 18.4, precipprob: 0, conditions: "Partially cloudy" },
        { datetime: "15:00:00", temp: 30.5, windspeed: 17.9, precipprob: 0, conditions: "Clear" },
        { datetime: "18:00:00", temp: 28.2, windspeed: 12.7, precipprob: 0, conditions: "Clear" },
        { datetime: "21:00:00", temp: 26.2, windspeed: 8.7, precipprob: 0, conditions: "Clear" }
      ]
    }
  ]
};
