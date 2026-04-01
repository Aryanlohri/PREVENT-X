import { motion } from "framer-motion";
import { Activity, Heart, Droplets, Scale, TrendingUp, TrendingDown, Minus, Lightbulb, Pill, Clock, Check, Moon, Dumbbell, Apple, Brain, SmilePlus, MessageCircle, Download } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVitals, predictHealthRisk, fetchDailyLogs } from "@/lib/queries";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";

const trendIcon = (tr: "up" | "down" | "stable") =>
  tr === "up" ? <TrendingUp className="h-4 w-4" /> : tr === "down" ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />;

const Dashboard = () => {
  const { language: lang } = useAppContext();
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  const queryClient = useQueryClient();

  // WebSocket Connection for Real-Time UI Sync
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws");

    ws.onopen = () => console.log("Connected to WebSocket for real-time updates");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket event received:", data.type);

        // Invalidate specific queries to trigger a re-fetch and UI update
        if (data.type === "VITALS_UPDATED") {
          queryClient.invalidateQueries({ queryKey: ['vitals'] });
          queryClient.invalidateQueries({ queryKey: ['ml_risk'] }); // Risk score depends on vitals
        } else if (data.type === "MEDICATIONS_UPDATED") {
          queryClient.invalidateQueries({ queryKey: ['medications'] });
        } else if (data.type === "LOGS_UPDATED") {
          queryClient.invalidateQueries({ queryKey: ['daily_logs'] });
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");

    return () => {
      ws.close();
    };
  }, [queryClient]);

  // Fetch real data from backend
  const { data: realVitals = [], isLoading: loadingVitals } = useQuery({
    queryKey: ['vitals'],
    queryFn: fetchVitals
  });

  const { data: riskData } = useQuery({
    queryKey: ['ml_risk'],
    queryFn: predictHealthRisk,
  });

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ['daily_logs'],
    queryFn: fetchDailyLogs
  });

  // Find the most recent non-null value for each specific metric across all historical logs
  const latestBP = realVitals.find((v: any) => v.blood_pressure_sys != null);
  const latestSugar = realVitals.find((v: any) => v.blood_sugar != null);
  const latestHR = realVitals.find((v: any) => v.heart_rate != null);
  const latestBMI = realVitals.find((v: any) => v.bmi != null);

  const riskScore = riskData?.risk_score || 0;

  // Real data parsing for the Chart
  const daysLimit = timeRange === "7d" ? 7 : 30;
  
  // Sort realVitals by timestamp ascending
  const sortedVitals = [...realVitals].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  // Create the exact format for Recharts taking the last N records
  const dynamicChartData = sortedVitals.slice(-daysLimit).map((v: any) => ({
    day: dayjs(v.timestamp).format(timeRange === "7d" ? "ddd" : "DD MMM"),
    bp: v.blood_pressure_sys || null,
    sugar: v.blood_sugar || null,
    hr: v.heart_rate || null
  }));

  // Mental Wellness Real Stats parsing
  const recentLogs = dailyLogs.slice(0, 7); // Last 7 days
  const goodDays = recentLogs.filter((l: any) => l.mood === "Happy" || l.mood === "Energetic").length;
  const badDays = recentLogs.filter((l: any) => l.mood === "Stressed" || l.mood === "Tired" || l.mood === "Sick").length;
  const modDays = recentLogs.length - goodDays - badDays;
  
  // Map mood history to a dynamic score
  const mentalScoreLimit = recentLogs.length > 0 ? Math.round((goodDays / recentLogs.length) * 100) : 0;
  const mentalScore = Math.max(50, mentalScoreLimit); // Baseline 50 to avoid total zero when starting out

  const vitals = [
    { icon: Activity, label: t(lang, "bloodPressure"), value: latestBP ? `${latestBP.blood_pressure_sys}/${latestBP.blood_pressure_dia}` : "--/--", unit: "mmHg", trend: "stable" as const, color: "text-secondary" },
    { icon: Droplets, label: t(lang, "bloodSugar"), value: latestSugar?.blood_sugar || "--", unit: "mg/dL", trend: "down" as const, color: "text-success" },
    { icon: Heart, label: t(lang, "heartRate"), value: latestHR?.heart_rate || "--", unit: "bpm", trend: "stable" as const, color: "text-destructive" },
    { icon: Scale, label: t(lang, "bmi"), value: latestBMI?.bmi || "--", unit: "kg/m²", trend: "up" as const, color: "text-warning" },
  ];

  const riskLevel = riskScore < 30 ? t(lang, "lowRisk") : riskScore < 60 ? t(lang, "moderateRisk") : t(lang, "highRisk");
  const riskColor = riskScore < 30 ? "text-success" : riskScore < 60 ? "text-warning" : "text-destructive";
  const riskGlow = riskScore < 30 ? "shadow-[0_0_40px_hsl(152,55%,48%,0.25)]" : riskScore < 60 ? "shadow-[0_0_40px_hsl(38,90%,55%,0.25)]" : "shadow-[0_0_40px_hsl(0,65%,58%,0.25)]";

  // Dynamic Context-Aware Tips Generator
  const generateSmartTips = () => {
    const dynamicTips = [];

    // Check high blood pressure
    if (latestBP && latestBP.blood_pressure_sys >= 130) {
      dynamicTips.push("Your recent blood pressure reading was elevated. Consider reducing sodium intake and practicing mindfulness today.");
    }

    // Check high blood sugar
    if (latestSugar && latestSugar.blood_sugar > 140) {
      dynamicTips.push("Your blood glucose was slightly high. A short 15-minute walk after meals can significantly lower post-meal spikes.");
    }

    // Check low activity / logs
    if (dailyLogs.length === 0 || riskScore > 60) {
      dynamicTips.push("Logging your daily mood and vitals consistently helps our AI predict health risks more accurately.");
    }

    // Fallbacks if user is extremely healthy
    if (dynamicTips.length < 3) dynamicTips.push("Hydration is key! Aim to drink at least 8 glasses (64oz) of water today.");
    if (dynamicTips.length < 3) dynamicTips.push("Great job staying on top of your health metrics. Consistency is the foundation of longevity.");
    if (dynamicTips.length < 3) dynamicTips.push("Remember to check your personalized Diet & Exercise tab for your AI-generated daily schedule.");

    return dynamicTips.slice(0, 3);
  };

  const tips = generateSmartTips();

  const handleExportPDF = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/vitals/export-pdf", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error("Failed to export");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "PreventX_Health_Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
      alert("Error exporting PDF.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Row 1: Health Score + Vitals */}
      <div className="flex justify-between items-end mb-2">
         <h1 className="text-2xl font-bold font-heading">Your Health Overview</h1>
         <button onClick={handleExportPDF} className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <Download className="h-4 w-4" /> Export Report (PDF)
         </button>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`glass-card rounded-2xl p-6 flex flex-col items-center justify-center ${riskGlow}`}>
          <h3 className="font-heading font-semibold text-foreground mb-4">{t(lang, "healthRiskScore")}</h3>
          {loadingVitals ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Skeleton className="w-36 h-36 rounded-full" />
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-48 h-3" />
            </div>
          ) : (
            <>
              <div className="relative w-36 h-36 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray={`${(riskScore / 100) * 327} 327`} strokeLinecap="round" className={riskColor} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold font-heading ${riskColor}`}>{riskScore}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              <span className={`text-sm font-semibold ${riskColor}`}>{riskLevel}</span>
              <p className="text-xs text-muted-foreground mt-1 text-center">{t(lang, "healthManaged")}</p>
            </>
          )}
        </motion.div>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {loadingVitals ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <Skeleton className="w-12 h-4" />
                </div>
                <Skeleton className="w-24 h-8" />
                <Skeleton className="w-16 h-3" />
              </div>
            ))
          ) : (
            vitals.map((v, i) => (
              <motion.div key={v.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="glass-card-hover rounded-2xl p-5 group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-accent ${v.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}><v.icon className="h-5 w-5" /></div>
                  <div className={`flex items-center gap-1 text-xs ${v.trend === "up" ? "text-warning" : v.trend === "down" ? "text-success" : "text-muted-foreground"}`}>
                    {trendIcon(v.trend)} {v.trend}
                  </div>
                </div>
                <p className="text-2xl font-bold font-heading text-foreground">{v.value} <span className="text-sm font-normal text-muted-foreground">{v.unit}</span></p>
                <p className="text-xs text-muted-foreground mt-1">{v.label}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Row 2: Chart + Mental Wellness + Tips */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-foreground">{t(lang, "healthTrends")}</h3>
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {(["7d", "30d"] as const).map((r) => (
                <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeRange === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  {r === "7d" ? t(lang, "days7") : t(lang, "days30")}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            {dynamicChartData.length > 0 ? (
                <LineChart data={dynamicChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="bp" stroke="hsl(217, 100%, 61%)" strokeWidth={2} dot={true} connectNulls />
                  <Line type="monotone" dataKey="hr" stroke="hsl(0, 65%, 58%)" strokeWidth={2} dot={true} connectNulls />
                  <Line type="monotone" dataKey="sugar" stroke="hsl(152, 55%, 48%)" strokeWidth={2} dot={true} connectNulls />
                </LineChart>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
                    Log vitals to see your health trends
                </div>
            )}
          </ResponsiveContainer>
          <div className="flex gap-6 mt-3 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 rounded bg-secondary inline-block" />BP</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 rounded bg-destructive inline-block" />{t(lang, "heartRate")}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 rounded bg-success inline-block" />{t(lang, "bloodSugar")}</span>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Mental Wellness */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <SmilePlus className="h-5 w-5 text-secondary" />
              <h3 className="font-heading font-semibold text-foreground">{t(lang, "mentalWellness")}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{t(lang, "trackEmotional")}</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{t(lang, "weeklyWellnessScore")}</span>
              <span className="text-sm font-bold font-heading text-foreground">{mentalScore}/100</span>
            </div>
            <Progress value={mentalScore} className="h-2 mb-4" />
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div><p className="text-xl font-bold font-heading text-success">{goodDays}</p><p className="text-[10px] text-muted-foreground">{t(lang, "goodDays")}</p></div>
              <div><p className="text-xl font-bold font-heading text-warning">{modDays}</p><p className="text-[10px] text-muted-foreground">{t(lang, "moderate")}</p></div>
              <div><p className="text-xl font-bold font-heading text-secondary">{recentLogs.length}</p><p className="text-[10px] text-muted-foreground">{t(lang, "checkIns")}</p></div>
            </div>
            <div className="border-t border-border/50 pt-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t(lang, "needSupport")}</p>
              <p className="text-xs text-secondary flex items-center justify-center gap-1 cursor-pointer hover:underline">
                <MessageCircle className="h-3 w-3" /> {t(lang, "clickChat")}
              </p>
            </div>
          </motion.div>

          {/* Smart Tips */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-warning" />
              <h3 className="font-heading font-semibold text-foreground">{t(lang, "smartTips")}</h3>
            </div>
            <div className="space-y-4">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
