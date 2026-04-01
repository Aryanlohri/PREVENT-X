import { motion } from "framer-motion";
import { TrendingUp, Info, Heart, Moon, Dumbbell, Apple, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

const RiskPrediction = () => {
  const { language: lang } = useAppContext();

  const diseaseRisks = [
    { name: t(lang, "type2Diabetes"), risk: 65, factors: [t(lang, "highSugarIntake"), t(lang, "lowPhysicalActivity"), t(lang, "familyHistory")] },
    { name: t(lang, "hypertension"), risk: 72, factors: [t(lang, "highStress"), t(lang, "irregularSleep"), t(lang, "sodiumIntake")] },
    { name: t(lang, "cardiovascular"), risk: 58, factors: [t(lang, "sedentaryLifestyle"), t(lang, "sleepQuality"), t(lang, "stressManagement")] },
    { name: t(lang, "obesity"), risk: 42, factors: [t(lang, "dietImprovements"), t(lang, "increasedActivity"), t(lang, "metabolicRate")] },
  ];

  const keyFactors = [
    { icon: Moon, label: t(lang, "sleepQualityLabel"), score: 45, status: t(lang, "poor"), impact: t(lang, "high"), isHigh: true, color: "text-secondary" },
    { icon: Dumbbell, label: t(lang, "physicalActivity"), score: 65, status: t(lang, "moderate"), impact: t(lang, "medium"), isHigh: false, color: "text-primary" },
    { icon: Apple, label: t(lang, "dietQuality"), score: 50, status: t(lang, "fair"), impact: t(lang, "high"), isHigh: true, color: "text-success" },
    { icon: Brain, label: t(lang, "stressLevel"), score: 58, status: t(lang, "elevated"), impact: t(lang, "medium"), isHigh: false, color: "text-warning" },
  ];

  const recommendations = [
    { priority: t(lang, "high"), isHigh: true, title: t(lang, "improveSleep"), desc: t(lang, "improveSleepDesc"), impact: t(lang, "improveSleepImpact") },
    { priority: t(lang, "high"), isHigh: true, title: t(lang, "increaseActivity"), desc: t(lang, "increaseActivityDesc"), impact: t(lang, "increaseActivityImpact") },
    { priority: t(lang, "medium"), isHigh: false, title: t(lang, "dietaryAdjustments"), desc: t(lang, "dietaryAdjustmentsDesc"), impact: t(lang, "dietaryAdjustmentsImpact") },
    { priority: t(lang, "medium"), isHigh: false, title: t(lang, "stressManagementTitle"), desc: t(lang, "stressManagementDesc"), impact: t(lang, "stressManagementImpact") },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t(lang, "riskPredictionTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t(lang, "riskPredictionDesc")}</p>
      </div>

      {/* Condition-Specific Risk Analysis */}
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

      {/* Key Contributing Factors */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">{t(lang, "keyContributing")}</h3>
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
      </motion.div>

      {/* AI-Powered Recommendations */}
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
    </div>
  );
};

export default RiskPrediction;
