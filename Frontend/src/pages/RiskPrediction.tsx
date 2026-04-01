import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Stethoscope, ShieldCheck, UserPlus, AlertCircle, Apple, Pill } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { predictHealthRisk, predictDisease } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";

const commonSymptoms = [
  "itching", "skin_rash", "continuous_sneezing", "shivering", "chills",
  "joint_pain", "stomach_pain", "acidity", "vomiting", "fatigue",
  "weight_gain", "anxiety", "mood_swings", "weight_loss", "lethargy",
  "cough", "high_fever", "breathlessness", "sweating", "headache",
  "nausea", "loss_of_appetite", "chest_pain", "dizziness", "muscle_weakness"
];

const RiskPrediction = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  // Existing Overall Risk
  const { data: riskData, isLoading } = useQuery({
    queryKey: ['ml_risk'],
    queryFn: predictHealthRisk
  });

  // V2 Disease Predictor
  const symptomMutation = useMutation({
    mutationFn: predictDisease,
    onSuccess: () => {
      setActiveTab(0); // Reset to first prediction on new analysis
    }
  });

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(sym => sym !== s) : [...prev, s]
    );
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0) return;
    symptomMutation.mutate(selectedSymptoms);
  };

  const formatSymptom = (s: string) => {
    return s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const renderUrgencyBanner = (urgency: string) => {
    if (urgency === "Emergency") {
      return (
        <div className="w-full bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-xl mb-6 flex items-start gap-3">
          <AlertCircle className="text-destructive h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-destructive">Emergency Alert</h4>
            <p className="text-sm text-foreground mt-1">
              Your symptoms indicate a potentially severe condition. <strong className="font-semibold underline">Seek immediate emergency medical care.</strong>
            </p>
          </div>
        </div>
      );
    }
    if (urgency === "Urgent") {
      return (
        <div className="w-full bg-warning/10 border-l-4 border-warning p-4 rounded-r-xl mb-6 flex items-start gap-3">
          <AlertCircle className="text-warning h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-warning">Urgent Case</h4>
            <p className="text-sm text-foreground mt-1">
              Please schedule a doctor's appointment as soon as possible. Your symptoms require professional evaluation.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">AI Symptom Checker V2</h1>
        <p className="text-sm text-muted-foreground">Advanced triage model trained on Kaggle Clinical datasets.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column: Symptom Selector */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

            <h3 className="font-heading font-semibold text-foreground text-lg mb-2">What are you feeling?</h3>
            <p className="text-sm text-muted-foreground mb-6">Select all symptoms that apply to you for the most accurate prediction.</p>

            <div className="flex flex-wrap gap-2.5 mb-8">
              {commonSymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-accent"
                      }`}
                  >
                    {formatSymptom(symptom)}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={selectedSymptoms.length === 0 || symptomMutation.isPending}
              className={`w-full py-4 rounded-xl font-heading font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${selectedSymptoms.length === 0
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                }`}
            >
              <Activity className={`h-5 w-5 ${symptomMutation.isPending ? "animate-spin" : ""}`} />
              {symptomMutation.isPending ? "Searching Medical Database..." : "Analyze Symptoms"}
            </button>
          </motion.div>

          {/* V2 Diagnosis Results */}
          {symptomMutation.data && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-3xl p-6 md:p-8 border-2 border-primary/20 relative overflow-hidden shadow-xl shadow-primary/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-2xl pointer-events-none" />

              {renderUrgencyBanner(symptomMutation.data.urgency_level)}

              <div className="mb-6">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Top Probable Matches</p>
                {/* Tabs for Top 3 */}
                <div className="flex flex-wrap gap-3">
                  {symptomMutation.data.predictions.map((pred: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`flex-1 min-w-[140px] p-3 rounded-xl border text-left transition-all ${activeTab === idx
                        ? "bg-background border-primary shadow-sm ring-1 ring-primary/20"
                        : "bg-muted/30 border-transparent hover:bg-muted/60"
                        }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-muted-foreground capitalize">Match #{idx + 1}</span>
                        <span className={`text-xs font-black ${idx === 0 ? 'text-success' : 'text-primary'}`}>{pred.confidence}%</span>
                      </div>
                      <h4 className={`font-heading font-semibold truncate ${activeTab === idx ? "text-foreground" : "text-muted-foreground"}`}>
                        {formatSymptom(pred.probable_disease)}
                      </h4>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Prediction Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-foreground">
                        {formatSymptom(symptomMutation.data.predictions[activeTab].probable_disease)}
                      </h2>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Prevention Box */}
                    <div className="glass-card-hover rounded-2xl p-5 border border-success/20 bg-success/5 col-span-1">
                      <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck className="h-5 w-5 text-success" />
                        <h4 className="font-heading font-semibold text-foreground">Prevention</h4>
                      </div>
                      <ul className="space-y-2.5">
                        {symptomMutation.data.predictions[activeTab].prevention_steps.map((step: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Diet Box */}
                    <div className="glass-card-hover rounded-2xl p-5 border border-sky-500/20 bg-sky-500/5 col-span-1">
                      <div className="flex items-center gap-2 mb-4">
                        <Apple className="h-5 w-5 text-sky-500" />
                        <h4 className="font-heading font-semibold text-foreground">Clinical Diet</h4>
                      </div>
                      <ul className="space-y-2.5">
                        {symptomMutation.data.predictions[activeTab].diet_advice?.slice(0, 4).map((step: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                        {(!symptomMutation.data.predictions[activeTab].diet_advice || symptomMutation.data.predictions[activeTab].diet_advice.length === 0) && (
                          <li className="text-sm text-muted-foreground italic">No specific diet listed.</li>
                        )}
                      </ul>
                    </div>

                    {/* Medications Box */}
                    <div className="glass-card-hover rounded-2xl p-5 border border-purple-500/20 bg-purple-500/5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Pill className="h-5 w-5 text-purple-500" />
                          <h4 className="font-heading font-semibold text-foreground">Common Medications</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {symptomMutation.data.predictions[activeTab].medication_advice?.slice(0, 5).map((med: string, i: number) => (
                            <span key={i} className="text-xs bg-background border px-2.5 py-1 rounded-md text-muted-foreground">
                              {med}
                            </span>
                          ))}
                          {(!symptomMutation.data.predictions[activeTab].medication_advice || symptomMutation.data.predictions[activeTab].medication_advice.length === 0) && (
                            <span className="text-sm text-muted-foreground italic">Consult physician.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Specialists Box */}
                    <div className="glass-card-hover rounded-2xl p-5 border border-primary/20 bg-primary/5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <UserPlus className="h-5 w-5 text-primary" />
                          <h4 className="font-heading font-semibold text-foreground">Specialists</h4>
                        </div>
                        <div className="flex flex-col gap-2">
                          {symptomMutation.data.predictions[activeTab].recommended_doctors.map((doc: string, i: number) => (
                            <div key={i} className="text-sm text-foreground font-medium flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-background border shadow-sm shrink-0">
                                <Stethoscope className="h-3 w-3 text-primary" />
                              </div>
                              <span className="truncate">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <h3 className="font-heading font-semibold text-foreground mb-6 w-full text-left">Baseline Risk Score</h3>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4 w-full">
                <Skeleton className="w-40 h-40 rounded-full" />
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-full h-8" />
              </div>
            ) : (
              <>
                <div className="relative w-40 h-40 mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8"
                      strokeDasharray={`${(riskData?.risk_score || 0) / 100 * 327} 327`} strokeLinecap="round"
                      className={riskData?.risk_score >= 60 ? "text-destructive" : riskData?.risk_score >= 30 ? "text-warning" : "text-success"}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-black font-heading ${riskData?.risk_score >= 60 ? "text-destructive" : riskData?.risk_score >= 30 ? "text-warning" : "text-success"}`}>
                      {riskData?.risk_score || 0}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">/100</span>
                  </div>
                </div>
                <h4 className={`text-lg font-bold ${riskData?.risk_score >= 60 ? "text-destructive" : riskData?.risk_score >= 30 ? "text-warning" : "text-success"}`}>
                  {riskData?.risk_level || "Unknown Risk"}
                </h4>
                <p className="text-xs text-muted-foreground mt-2 px-4 leading-relaxed">
                  Calculated using your most recent bodily vitals. High scores indicate a need for lifestyle adjustments.
                </p>
              </>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5 border border-warning/20 bg-warning/5 flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-foreground leading-relaxed">
              <strong className="block text-warning mb-1">Medical Disclaimer</strong>
              This AI Symptom Checker uses clinical dataset inference. It is for informational purposes only and does not constitute professional medical advice, diagnosis, or treatment.
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default RiskPrediction;
