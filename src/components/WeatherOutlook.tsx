import React from "react";
import type { WeatherOutlookResult } from "../types/weather";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  MapPin,
  Calendar,
  Thermometer,
  Wind,
  Droplets,
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  CloudLightning,
  ArrowLeft,
  Clock
} from "lucide-react";

interface WeatherOutlookProps {
  outlook: WeatherOutlookResult;
  onBack?: () => void;
}

function getWeatherIcon(condition: string, className: string = "w-6 h-6") {
  const lower = condition.toLowerCase();
  if (lower.includes("rain") || lower.includes("shower")) {
    return <CloudRain className={`${className} text-blue-500`} />;
  }
  if (lower.includes("thunder") || lower.includes("lightning")) {
    return <CloudLightning className={`${className} text-amber-500`} />;
  }
  if (lower.includes("partly") || lower.includes("scattered")) {
    return <CloudSun className={`${className} text-amber-400`} />;
  }
  if (lower.includes("cloud") || lower.includes("overcast")) {
    return <Cloud className={`${className} text-slate-400`} />;
  }
  return <Sun className={`${className} text-amber-500`} />;
}

export const WeatherOutlookView: React.FC<WeatherOutlookProps> = ({ outlook, onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{outlook.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{outlook.date}</span>
            </div>
          </div>
        </div>
        
        {/* Main Condition Badge */}
        <div className="flex items-center gap-2 bg-secondary/80 px-4 py-2 rounded-full border border-border">
          {getWeatherIcon(outlook.summary.condition, "w-5 h-5")}
          <span className="text-sm font-medium">{outlook.summary.condition}</span>
        </div>
      </div>

      {/* Main Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Temperature Range */}
        <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-500" />
              Rentang Suhu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-foreground">{outlook.summary.tempRange}</p>
            <p className="text-xs text-muted-foreground mt-1">Suhu Min - Max Hari Ini</p>
          </CardContent>
        </Card>

        {/* Rain Chance */}
        <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              Peluang Hujan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-foreground">{outlook.summary.rainChance}</p>
            <p className="text-xs text-muted-foreground mt-1">Probabilitas Presipitasi</p>
          </CardContent>
        </Card>

        {/* Wind Speed */}
        <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-500" />
              Kecepatan Angin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-foreground">{outlook.summary.wind}</p>
            <p className="text-xs text-muted-foreground mt-1">Rata-rata kecepatan angin</p>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Timeline */}
      <Card className="border-border/50 bg-card/60 backdrop-blur">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Prakiraan Per Jam (Timeline)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-border">
            {outlook.timeline.map((item, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 min-w-[110px] p-3 rounded-xl bg-background/80 border border-border/60 flex flex-col items-center gap-2 text-center hover:border-primary/50 transition-colors"
              >
                <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
                <div className="my-1">{getWeatherIcon(item.condition, "w-8 h-8")}</div>
                <span className="text-lg font-bold text-foreground">{item.temp}</span>
                <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground mt-1">
                  <span className="flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    {item.rainChance}
                  </span>
                  <span className="flex items-center justify-center gap-1">
                    <Wind className="w-3 h-3 text-teal-500" />
                    {item.wind}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
