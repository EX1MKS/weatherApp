import { useState } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Card } from './components/ui/card'
import { fetchWeatherData } from './types/weather'
import type { WeatherOutlookResult } from './types/weather'
import { WeatherOutlookView } from './components/WeatherOutlook'
import { CloudSun, Search, Loader2, AlertCircle, MapPin } from 'lucide-react'

function App() {
  const [cityName, setCityName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outlookData, setOutlookData] = useState<WeatherOutlookResult | null>(null)

  const handleSearch = async (targetCity?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const queryLocation = targetCity ?? cityName.trim()
    const locationToFetch = queryLocation ? queryLocation : 'Pandeglang'

    setLoading(true)
    setError(null)

    try {
      const data = await fetchWeatherData(locationToFetch)
      setOutlookData(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Terjadi kesalahan saat mengambil data cuaca.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4">
      {outlookData ? (
        <WeatherOutlookView
          outlook={outlookData}
          onBack={() => {
            setOutlookData(null)
            setError(null)
          }}
        />
      ) : (
        <Card className="w-full max-w-md p-6 space-y-6 shadow-xl border-border/80 bg-card/80 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <CloudSun className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Weather Outlook</h1>
              <p className="text-xs text-muted-foreground">Visual Crossing Weather API</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleSearch(undefined, e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs font-semibold">Nama Kota / Lokasi</Label>
              <div className="relative">
                <Input
                  id="city"
                  placeholder="Input your city name... (cth: Pandeglang)"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full font-semibold">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengambil Data...
                </>
              ) : (
                'Get Weather'
              )}
            </Button>
          </form>

          {/* Quick preset locations */}
          <div className="pt-2 border-t border-border/30">
            <p className="text-[11px] text-muted-foreground mb-2 font-medium">Kota Populer:</p>
            <div className="flex flex-wrap gap-1.5">
              {['Pandeglang', 'Jakarta', 'Bandung', 'Surabaya', 'Bali'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setCityName(city)
                    handleSearch(city)
                  }}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/20 hover:text-primary transition-colors border border-border/50 disabled:opacity-50"
                >
                  <MapPin className="w-3 h-3" />
                  {city}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default App
