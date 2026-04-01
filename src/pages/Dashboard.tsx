import { motion } from "framer-motion";
import { Activity, Heart, Droplets, Scale, TrendingUp, TrendingDown, Minus, Lightbulb, Pill, Clock, Check, Moon, Dumbbell, Apple, Brain, SmilePlus, MessageCircle } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

const chartData7d = [
  { day: "Mon", bp: 120, sugar: 95, hr: 72 },
  { day: "Tue", bp: 118, sugar: 102, hr: 75 },
  { day: "Wed", bp: 122, sugar: 98, hr: 70 },
  { day: "Thu", bp: 119, sugar: 90, hr: 73 },
  { day: "Fri", bp: 125, sugar: 105, hr: 78 },
  { day: "Sat", bp: 117, sugar: 92, hr: 71 },
  { day: "Sun", bp: 121, sugar: 97, hr: 74 },
];

const medications = [
  { name: "Vitamin D3", time: "8:00 AM", taken: true },
  { name: "Omega-3", time: "8:00 AM", taken: true },
  { name: "Metformin", time: "1:00 PM", taken: false },
  { name: "Multivitamin", time: "9:00 PM", taken: false },
];

const trendIcon = (tr: "up" | "down" | "stable") =>
  tr === "up" ? <TrendingUp className="h-4 w-4" /> : tr === "down" ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />;

const Dashboard = () => {
  const { language: lang } = useAppContext();
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  const [meds, setMeds] = useState(medications);
  const riskScore = 28;

  const vitals = [
    { icon: Activity, label: t(lang, "bloodPressure"), value: "121/78", unit: "mmHg", trend: "stable" as const, color: "text-secondary" },
    { icon: Droplets, label: t(lang, "bloodSugar"), value: "97", unit: "mg/dL", trend: "down" as const, color: "text-success" },
    { icon: Heart, label: t(lang, "heartRate"), value: "74", unit: "bpm", trend: "stable" as const, color: "text-destructive" },
    { icon: Scale, label: t(lang, "bmi"), value: "23.4", unit: "kg/m²", trend: "up" as const, color: "text-warning" },
  ];

  const toggleMed = (i: number) => {
    setMeds((prev) => prev.map((m, idx) => (idx === i ? { ...m, taken: !m.taken } : m)));
  };

  const riskLevel = riskScore < 30 ? t(lang, "lowRisk") : riskScore < 60 ? t(lang, "moderateRisk") : t(lang, "highRisk");
  const riskColor = riskScore < 30 ? "text-success" : riskScore < 60 ? "text-warning" : "text-destructive";
  const riskGlow = riskScore < 30 ? "shadow-[0_0_40px_hsl(152,55%,48%,0.25)]" : riskScore < 60 ? "shadow-[0_0_40px_hsl(38,90%,55%,0.25)]" : "shadow-[0_0_40px_hsl(0,65%,58%,0.25)]";

  const tips = [t(lang, "tip1"), t(lang, "tip2"), t(lang, "tip3")];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Row 1: Health Score + Vitals */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`glass-card rounded-2xl p-6 flex flex-col items-center justify-center ${riskGlow}`}>
          <h3 className="font-heading font-semibold text-foreground mb-4">{t(lang, "healthRiskScore")}</h3>
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
        </motion.div>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {vitals.map((v, i) => (
            <motion.div key={v.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="glass-card-hover rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-accent ${v.color}`}><v.icon className="h-5 w-5" /></div>
                <div className={`flex items-center gap-1 text-xs ${v.trend === "up" ? "text-warning" : v.trend === "down" ? "text-success" : "text-muted-foreground"}`}>
                  {trendIcon(v.trend)} {v.trend}
                </div>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">{v.value} <span className="text-sm font-normal text-muted-foreground">{v.unit}</span></p>
              <p className="text-xs text-muted-foreground mt-1">{v.label}</p>
            </motion.div>
          ))}
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
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData7d}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="bp" stroke="hsl(217, 100%, 61%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hr" stroke="hsl(0, 65%, 58%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sugar" stroke="hsl(152, 55%, 48%)" strokeWidth={2} dot={false} />
            </LineChart>
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
              <span className="text-sm font-bold font-heading text-foreground">78/100</span>
            </div>
            <Progress value={78} className="h-2 mb-4" />
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div><p className="text-xl font-bold font-heading text-success">5</p><p className="text-[10px] text-muted-foreground">{t(lang, "goodDays")}</p></div>
              <div><p className="text-xl font-bold font-heading text-warning">2</p><p className="text-[10px] text-muted-foreground">{t(lang, "moderate")}</p></div>
              <div><p className="text-xl font-bold font-heading text-secondary">12</p><p className="text-[10px] text-muted-foreground">{t(lang, "checkIns")}</p></div>
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

      {/* Row 3: Medications */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-semibold text-foreground">{t(lang, "todaysMedications")}</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {meds.map((med, i) => (
            <button key={i} onClick={() => toggleMed(i)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${med.taken ? "bg-success/5 border-success/20" : "bg-card border-border hover:border-primary/30"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${med.taken ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {med.taken ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <div>
                <p className={`text-sm font-medium ${med.taken ? "text-success line-through" : "text-foreground"}`}>{med.name}</p>
                <p className="text-xs text-muted-foreground">{med.time}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
