import React, { useEffect, useRef, useState } from "react";
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
  Clock,
  RefreshCw,
  History,
  Sparkles
} from "lucide-react";

interface WeatherOutlookProps {
  outlook: WeatherOutlookResult;
  onBack?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function getWeatherIcon(condition: string, className: string = "w-6 h-6") {
  const lower = condition.toLowerCase();
  if (lower.includes("rain") || lower.includes("shower") || lower.includes("drizzle")) {
    return <CloudRain className={`${className} text-blue-500`} />;
  }
  if (lower.includes("thunder") || lower.includes("lightning") || lower.includes("storm")) {
    return <CloudLightning className={`${className} text-amber-500`} />;
  }
  if (lower.includes("partly") || lower.includes("partial") || lower.includes("scattered")) {
    return <CloudSun className={`${className} text-amber-400`} />;
  }
  if (lower.includes("cloud") || lower.includes("overcast")) {
    return <Cloud className={`${className} text-slate-400`} />;
  }
  return <Sun className={`${className} text-amber-500`} />;
}

export const WeatherOutlookView: React.FC<WeatherOutlookProps> = ({
  outlook,
  onBack,
  onRefresh,
  isRefreshing = false
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "past" | "future">("all");
  const currentCardRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll current hour card into center of horizontal scroll view
  useEffect(() => {
    if (currentCardRef.current) {
      currentCardRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  }, [outlook, filterMode]);

  // Filter timeline items based on selected tab
  const filteredTimeline = outlook.timeline.filter(item => {
    if (filterMode === "past") return item.isPast || item.isCurrentHour;
    if (filterMode === "future") return !item.isPast || item.isCurrentHour;
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="rounded-full shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <span>{outlook.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{outlook.date}</span>
            </div>
          </div>
        </div>
        
        {/* Actions: Refresh & Condition Badge */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2 rounded-full font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              <span>{isRefreshing ? "Memperbarui..." : "Perbarui"}</span>
            </Button>
          )}

          <div className="flex items-center gap-2 bg-secondary/80 px-3.5 py-1.5 rounded-full border border-border">
            {getWeatherIcon(outlook.summary.condition, "w-4 h-4")}
            <span className="text-xs font-semibold">{outlook.summary.condition}</span>
          </div>
        </div>
      </div>

      {/* Main Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Temperature Range */}
        <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-500" />
              Rentang Suhu Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-foreground">{outlook.summary.tempRange}</p>
            <p className="text-xs text-muted-foreground mt-1">Min - Max hari ini</p>
          </CardContent>
        </Card>

        {/* Rain Chance */}
        <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              Peluang Hujan Maksimal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-foreground">{outlook.summary.rainChance}</p>
            <p className="text-xs text-muted-foreground mt-1">Estimasi presipitasi</p>
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
            <p className="text-xs text-muted-foreground mt-1">Rata-rata hembusan</p>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Timeline Section */}
      <Card className="border-border/50 bg-card/60 backdrop-blur overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Laporan Cuaca 48 Jam (24 Jam Lalu & Depan)
          </CardTitle>

          {/* Timeline Filter Pills */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg text-xs font-medium self-stretch md:self-auto">
            <button
              onClick={() => setFilterMode("all")}
              className={`flex-1 md:flex-initial px-3 py-1 rounded-md transition-colors ${
                filterMode === "all" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua (48h)
            </button>
            <button
              onClick={() => setFilterMode("past")}
              className={`flex-1 md:flex-initial px-3 py-1 rounded-md transition-colors flex items-center justify-center gap-1 ${
                filterMode === "past" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="w-3 h-3" />
              24 Jam Lalu
            </button>
            <button
              onClick={() => setFilterMode("future")}
              className={`flex-1 md:flex-initial px-3 py-1 rounded-md transition-colors flex items-center justify-center gap-1 ${
                filterMode === "future" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              24 Jam Depan
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-4 px-3 sm:px-6">
          <div className="flex gap-3 overflow-x-auto p-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {filteredTimeline.map((item, idx) => {
              const isCurrent = item.isCurrentHour;
              return (
                <div
                  key={idx}
                  ref={isCurrent ? currentCardRef : null}
                  className={`flex-shrink-0 min-w-[125px] p-3.5 rounded-2xl flex flex-col items-center gap-2 text-center transition-all ${
                    isCurrent
                      ? "border-2 border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.02] z-10"
                      : item.isPast
                      ? "bg-muted/40 border border-border/40 opacity-75 hover:opacity-100"
                      : "bg-background/80 border border-border/60 hover:border-primary/50"
                  }`}
                >
                  {/* Current Hour Badge */}
                  {isCurrent ? (
                    <span className="bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                      Saat Ini
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {item.dateLabel}
                    </span>
                  )}

                  <span className="text-xs font-bold text-foreground">{item.time}</span>
                  <div className="my-1">{getWeatherIcon(item.condition, "w-8 h-8")}</div>
                  <span className="text-lg font-extrabold text-foreground">{item.temp}</span>

                  <div className="flex flex-col gap-1 text-[11px] text-muted-foreground mt-1 w-full pt-1 border-t border-border/30">
                    <span className="flex items-center justify-center gap-1 font-medium">
                      <Droplets className="w-3 h-3 text-blue-500 shrink-0" />
                      {item.rainChance}
                    </span>
                    <span className="flex items-center justify-center gap-1 font-medium">
                      <Wind className="w-3 h-3 text-teal-500 shrink-0" />
                      {item.wind}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
