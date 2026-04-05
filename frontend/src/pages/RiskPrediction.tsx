import { motion } from "framer-motion";
import { TrendingUp, Info, Heart, Moon, Dumbbell, Apple, Brain, Loader2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";
import { useState, useEffect } from "react";
import {
  fetchRiskPrediction,
  fetchDailyLogs,
  fetchVitals,
  type RiskPrediction as RiskPredictionType,
  type DailyLogRecord,
  type VitalRecord,
  isAuthenticated,
} from "@/lib/api";

/** Derive a 0-100 score from a 0-10 daily log field (inverted for stress) */
function normalizeScore(vals: (number | null)[], invert = false): number {
  const valid = vals.filter((v): v is number => v != null);
  if (valid.length === 0) return 0;
  const avg = valid.reduce((s, v) => s + v, 0) / valid.length;
  return invert ? Math.round((10 - avg) * 10) : Math.round(avg * 10);
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SymptomChecker } from "@/components/health/SymptomChecker";

const RiskPrediction = () => {
  const { language: lang } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState<RiskPredictionType | null>(null);
  const [logs, setLogs] = useState<DailyLogRecord[]>([]);
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [riskRes, logsRes, vitalsRes] = await Promise.allSettled([
        fetchRiskPrediction(),
        fetchDailyLogs(),
        fetchVitals(),
      ]);
      if (riskRes.status === "fulfilled") setRisk(riskRes.value);
      if (logsRes.status === "fulfilled") setLogs(logsRes.value);
      if (vitalsRes.status === "fulfilled") setVitals(vitalsRes.value);
    } catch {
      // Graceful degradation
    } finally {
      setLoading(false);
    }
  };

  // ── Derive disease risk cards from ML prediction + vitals ──
  const latestVital = vitals[0] || null;
  const bmi = latestVital?.bmi || 0;
  const sysBP = latestVital?.blood_pressure_sys || 0;
  const sugar = latestVital?.blood_sugar || 0;

  const riskScoreVal = risk?.risk_score ?? 0;

  // Derive condition-specific risks from actual ML score + vitals
  const diabetesRisk = Math.min(100, Math.round(riskScoreVal * 0.9 + (sugar > 100 ? 15 : 0)));
  const hyperRisk = Math.min(100, Math.round((sysBP > 130 ? 60 : sysBP > 120 ? 35 : 15) + riskScoreVal * 0.2));
  const cardioRisk = Math.min(100, Math.round(riskScoreVal * 0.6 + (sysBP > 130 ? 20 : 0) + (bmi > 30 ? 15 : 0)));
  const obesityRisk = Math.min(100, Math.round(bmi > 30 ? 75 : bmi > 25 ? 50 : bmi > 22 ? 30 : 15));

  const diseaseRisks = [
    {
      name: t(lang, "type2Diabetes"),
      risk: diabetesRisk,
      factors: diabetesRisk > 50
        ? [t(lang, "highSugarIntake"), t(lang, "lowPhysicalActivity"), t(lang, "familyHistory")]
        : [t(lang, "dietImprovements"), t(lang, "increasedActivity")],
    },
    {
      name: t(lang, "hypertension"),
      risk: hyperRisk,
      factors: hyperRisk > 50
        ? [t(lang, "highStress"), t(lang, "irregularSleep"), t(lang, "sodiumIntake")]
        : [t(lang, "stressManagement"), t(lang, "dietImprovements")],
    },
    {
      name: t(lang, "cardiovascular"),
      risk: cardioRisk,
      factors: [t(lang, "sedentaryLifestyle"), t(lang, "sleepQuality"), t(lang, "stressManagement")],
    },
    {
      name: t(lang, "obesity"),
      risk: obesityRisk,
      factors: [t(lang, "dietImprovements"), t(lang, "increasedActivity"), t(lang, "metabolicRate")],
    },
  ];

  // ── Derive key factors from actual daily logs ──
  const recentLogs = logs.slice(0, 7);
  const sleepScore = normalizeScore(recentLogs.map((l) => l.sleep_quality));
  const activityScore = normalizeScore(recentLogs.map((l) => l.physical_activity != null ? Math.min(10, l.physical_activity / 6) : null));
  const dietScore = normalizeScore(recentLogs.map((l) => l.diet_quality));
  const stressScore = normalizeScore(recentLogs.map((l) => l.stress_level), true); // Inverted: low stress = high score

  function statusLabel(score: number): string {
    if (score >= 70) return "Good";
    if (score >= 50) return t(lang, "moderate");
    if (score >= 30) return t(lang, "fair");
    return t(lang, "poor");
  }

  const keyFactors = [
    { icon: Moon, label: t(lang, "sleepQualityLabel"), score: sleepScore, status: statusLabel(sleepScore), impact: sleepScore < 50 ? t(lang, "high") : t(lang, "medium"), isHigh: sleepScore < 50, color: "text-secondary" },
    { icon: Dumbbell, label: t(lang, "physicalActivity"), score: activityScore, status: statusLabel(activityScore), impact: activityScore < 50 ? t(lang, "high") : t(lang, "medium"), isHigh: activityScore < 50, color: "text-primary" },
    { icon: Apple, label: t(lang, "dietQuality"), score: dietScore, status: statusLabel(dietScore), impact: dietScore < 50 ? t(lang, "high") : t(lang, "medium"), isHigh: dietScore < 50, color: "text-success" },
    { icon: Brain, label: t(lang, "stressLevel"), score: stressScore, status: statusLabel(stressScore), impact: stressScore < 50 ? t(lang, "high") : t(lang, "medium"), isHigh: stressScore < 50, color: "text-warning" },
  ];

  // ── Generate recommendations dynamically based on actual scores ──
  const recommendations = [];

  if (sleepScore < 60) {
    recommendations.push({
      priority: t(lang, "high"), isHigh: true,
      title: t(lang, "improveSleep"),
      desc: t(lang, "improveSleepDesc"),
      impact: t(lang, "improveSleepImpact"),
    });
  }
  if (activityScore < 60) {
    recommendations.push({
      priority: activityScore < 40 ? t(lang, "high") : t(lang, "medium"),
      isHigh: activityScore < 40,
      title: t(lang, "increaseActivity"),
      desc: t(lang, "increaseActivityDesc"),
      impact: t(lang, "increaseActivityImpact"),
    });
  }
  if (dietScore < 60) {
    recommendations.push({
      priority: dietScore < 40 ? t(lang, "high") : t(lang, "medium"),
      isHigh: dietScore < 40,
      title: t(lang, "dietaryAdjustments"),
      desc: t(lang, "dietaryAdjustmentsDesc"),
      impact: t(lang, "dietaryAdjustmentsImpact"),
    });
  }
  if (stressScore < 60) {
    recommendations.push({
      priority: t(lang, "medium"), isHigh: false,
      title: t(lang, "stressManagementTitle"),
      desc: t(lang, "stressManagementDesc"),
      impact: t(lang, "stressManagementImpact"),
    });
  }

  // Always show at least 2 recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      { priority: t(lang, "medium"), isHigh: false, title: t(lang, "improveSleep"), desc: t(lang, "improveSleepDesc"), impact: t(lang, "improveSleepImpact") },
      { priority: t(lang, "medium"), isHigh: false, title: t(lang, "increaseActivity"), desc: t(lang, "increaseActivityDesc"), impact: t(lang, "increaseActivityImpact") },
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Analyzing your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t(lang, "riskPredictionTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t(lang, "riskPredictionDesc")}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs md:text-sm">
              {t(lang, "healthRiskDashboard")}
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs md:text-sm">
              {t(lang, "aiSymptomChecker")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs value={activeTab} className="mt-0 space-y-6">
        <TabsContent value="dashboard" className="m-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">

      {/* Condition-Specific Risk Analysis — derived from ML + vitals */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="font-heading font-semibold text-foreground mb-4">{t(lang, "conditionRiskAnalysis")}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {diseaseRisks.map((d, i) => (
            <div key={i} className="glass-card-hover rounded-2xl p-5">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-heading font-semibold text-foreground">{d.name}</h4>
                <TrendingUp className={`h-4 w-4 ${d.risk >= 60 ? "text-destructive" : d.risk >= 40 ? "text-warning" : "text-success"}`} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t(lang, "riskLevel")}: {d.risk}%</p>
              <div className="w-full h-2 rounded-full bg-muted mb-4 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${d.risk >= 60 ? "bg-destructive" : d.risk >= 40 ? "bg-warning" : "bg-success"}`} style={{ width: `${d.risk}%` }} />
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">{t(lang, "contributingFactors")}</span>
              </div>
              <ul className="space-y-1">
                {d.factors.map((f, j) => (
                  <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Key Contributing Factors — from daily logs */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">{t(lang, "keyContributing")}</h3>
        {recentLogs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyFactors.map((f, i) => (
              <div key={i} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${f.isHigh ? "border-destructive/30 text-destructive bg-destructive/5" : "border-warning/30 text-warning bg-warning/5"}`}>
                    {f.impact} {t(lang, "impact")}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-2">{f.label}</p>
                <div className="w-full h-1.5 rounded-full bg-muted mt-2 mb-1 overflow-hidden">
                  <div className="h-full rounded-full bg-secondary" style={{ width: `${f.score}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{t(lang, "score")}: {f.score}/100</span>
                  <span>{f.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Log your daily health entries to see personalized contributing factor analysis.</p>
        )}
      </motion.div>

      {/* AI-Powered Recommendations — generated from actual scores */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-semibold text-foreground">{t(lang, "aiRecommendations")}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t(lang, "aiRecommendationsDesc")}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {recommendations.map((r, i) => (
            <div key={i} className="glass-card rounded-xl p-4 border border-border">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.isHigh ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                {r.priority} {t(lang, "priority")}
              </span>
              <h4 className="font-heading font-semibold text-foreground mt-2 text-sm">{r.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
              <p className="text-xs text-success mt-2 font-medium">{r.impact}</p>
            </div>
          ))}
        </div>
      </motion.div>
        </TabsContent>

        <TabsContent value="symptoms" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <SymptomChecker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskPrediction;
