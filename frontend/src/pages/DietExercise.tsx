import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Apple, Dumbbell, Flame, Target, Clock, Check, Calendar, TrendingUp, Utensils, Coffee, Salad, Cookie, Play, Loader2, UserCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchLifestylePlan, isApiError, type LifestylePlanResponse } from "@/lib/api";

type Tab = "diet" | "exercise";
type ViewMode = "today" | "week";

const DietExercise = () => {
  const [tab, setTab] = useState<Tab>("diet");
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<LifestylePlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [incompleteProfile, setIncompleteProfile] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setIncompleteProfile(false);
    try {
      const data = await fetchLifestylePlan();
      setPlan(data);
    } catch (err) {
      if (isApiError(err) && err.detail === "MISSING_PREREQUISITES") {
        setIncompleteProfile(true);
      } else {
        setError("Failed to load your AI lifestyle plan. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const intensityColor = (i: string) => {
    const low = ["Low", "Easy", "Light"];
    const high = ["High", "Vigorous", "Intense"];
    if (high.some(h => i.includes(h))) return "bg-destructive text-destructive-foreground";
    if (low.some(l => i.includes(l))) return "bg-success text-success-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Generating your personalized AI health plan...</p>
      </div>
    );
  }

  if (incompleteProfile) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserCircle className="h-10 w-10 text-primary" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Complete Your Profile</h2>
        <p className="text-muted-foreground mb-8">
          To generate an accurate AI diet and exercise plan, we need a few details: age, gender, height, weight, and your pre-existing health conditions.
        </p>
        <Link to="/profile">
          <Button className="gradient-primary px-8">Update Profile Now</Button>
        </Link>
      </div>
    );
  }

  if (!plan) return <div className="text-center py-20 text-muted-foreground">{error || "Something went wrong."}</div>;

  const currentMeals = viewMode === "today" ? plan.daily_meals : plan.weekly_meals;
  const currentWorkouts = viewMode === "today" ? plan.daily_workouts : plan.weekly_workouts;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">AI Health Plan</h1>
        <p className="text-sm text-muted-foreground">Personalized recommendations for your health profile</p>
      </div>

      {/* Daily Goals */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plan.daily_goals.map((g, i) => {
          const pct = Math.round((g.current / g.target) * 100);
          const Icon = g.label.toLowerCase().includes("step") ? TrendingUp : g.label.toLowerCase().includes("calorie") ? Target : g.label.toLowerCase().includes("water") ? Apple : Dumbbell;
          return (
            <div key={i} className="glass-card-hover rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`h-5 w-5 text-primary`} />
                <div>
                  <span className="text-2xl font-bold font-heading text-foreground">{g.current.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/{g.target}{g.unit || ""}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{g.label}</p>
              <Progress value={pct} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">{pct}% of daily goal</p>
            </div>
          );
        })}
      </motion.div>

      {/* Overview Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap gap-8 items-center">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Targets</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-heading text-primary">{plan.calories}</span>
              <span className="text-sm text-muted-foreground">kcal / day</span>
            </div>
          </div>
          <div className="h-10 w-px bg-border/50 hidden md:block" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Macro Split</p>
            <p className="text-lg font-semibold text-foreground">{plan.macros}</p>
          </div>
          <div className="h-10 w-px bg-border/50 hidden md:block" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Focus</p>
            <p className="text-lg font-semibold text-foreground capitalize">{plan.workout_type} ({plan.intensity})</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit mb-6">
          {(["diet", "exercise"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setViewMode("today"); }} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {t === "diet" ? "Diet Plan" : "Exercise Plan"}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-semibold text-foreground capitalize">{viewMode === "today" ? `Today's ${tab} Plan` : `Weekly ${tab} Overview`}</h2>
            <p className="text-xs text-muted-foreground">AI-generated for your specific health needs</p>
          </div>
          <button onClick={() => setViewMode(viewMode === "today" ? "week" : "today")} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-foreground hover:bg-accent transition-colors">
            <Calendar className="h-4 w-4" />
            {viewMode === "today" ? "View Week" : "View Today"}
          </button>
        </div>

        {tab === "diet" ? (
          viewMode === "today" ? (
            <div className="grid md:grid-cols-2 gap-4">
              {plan.daily_meals.map((meal, i) => {
                const Icon = meal.type.toLowerCase().includes("breakfast") ? Coffee : meal.type.toLowerCase().includes("lunch") ? Salad : Utensils;
                return (
                  <div key={i} className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-accent"><Icon className="h-5 w-5 text-secondary" /></div>
                      <div>
                        <h4 className="font-heading font-semibold text-foreground">{meal.type}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{meal.time}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {meal.items.map((item: any, j: number) => (
                        <div key={j} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="text-foreground font-medium">{item.cal} cal</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="grid grid-cols-4 gap-0 px-5 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground">
                <span>Day</span><span className="text-center">Meals</span><span className="text-center">Calories</span><span className="text-center">Protein</span>
              </div>
              {plan.weekly_meals.map((d, i) => (
                <div key={i} className="grid grid-cols-4 gap-0 px-5 py-3 border-t border-border/50 hover:bg-accent/40 transition-colors">
                  <span className="text-sm font-medium text-foreground">{d.day}</span>
                  <span className="text-sm text-muted-foreground text-center">{d.meals}</span>
                  <span className="text-sm text-muted-foreground text-center">{d.calories.toLocaleString()} cal</span>
                  <span className="text-sm text-muted-foreground text-center">{d.protein}g</span>
                </div>
              ))}
            </div>
          )
        ) : (
          viewMode === "today" ? (
            <div className="space-y-3">
              {plan.daily_workouts.map((w, i) => (
                 <div key={i} className={`glass-card rounded-2xl p-5 border border-border`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-accent text-muted-foreground flex items-center justify-center flex-shrink-0`}>
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-heading font-semibold text-foreground">{w.name}</h4>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">{w.type}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${intensityColor(w.intensity)}`}>{w.intensity}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{w.time}</span>
                          <span>{w.duration}</span>
                          <span className="flex items-center gap-1"><Flame className="h-3 w-3" />{w.calories} cal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="grid grid-cols-4 gap-0 px-5 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground">
                <span>Day</span><span className="text-center">Workouts</span><span className="text-center">Calories</span><span className="text-center">Duration</span>
              </div>
              {plan.weekly_workouts.map((d, i) => (
                <div key={i} className="grid grid-cols-4 gap-0 px-5 py-3 border-t border-border/50 hover:bg-accent/40 transition-colors">
                  <span className="text-sm font-medium text-foreground">{d.day}</span>
                  <span className="text-sm text-muted-foreground text-center">{d.workouts}</span>
                  <span className="text-sm text-muted-foreground text-center">{d.calories} cal</span>
                  <span className="text-sm text-muted-foreground text-center">{d.duration}</span>
                </div>
              ))}
            </div>
          )
        )}
      </motion.div>
    </div>
  );
};

export default DietExercise;
