import { motion } from "framer-motion";
import { useState } from "react";
import { Apple, Dumbbell, Flame, Target, Clock, Check, Calendar, TrendingUp, Utensils, Coffee, Salad, Cookie, Play, UserCog, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchDailyLogs, fetchLifestylePlan } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = "diet" | "exercise";
type ViewMode = "today" | "week";

const getIconForMeal = (type: string) => {
    if (type.includes("Breakfast")) return Coffee;
    if (type.includes("Lunch")) return Salad;
    if (type.includes("Dinner")) return Utensils;
    return Cookie;
};

const intensityColor = (i: string) => 
    i === "High" ? "bg-destructive text-destructive-foreground" : 
    i === "Moderate" ? "bg-secondary text-secondary-foreground" : 
    "bg-success text-success-foreground";

const DietExercise = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("diet");
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [workoutsDone, setWorkoutsDone] = useState<Record<number, boolean>>({});

  const { data: logs = [] } = useQuery({
    queryKey: ['daily-logs'],
    queryFn: fetchDailyLogs
  });

  const { data: mlPlan, isLoading: loadingPlan, error: planError } = useQuery({
    queryKey: ['lifestyle_plan'],
    queryFn: fetchLifestylePlan,
    retry: false,
  });

  const isMissingPrereqs = planError && (planError as any).response?.status === 400;

  if (isMissingPrereqs) {
    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-primary/10 p-6 rounded-full">
                <UserCog className="h-16 w-16 text-primary" />
            </motion.div>
            <div>
                <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Complete Your Profile First</h2>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    To generate your highly personalized Diet & Workout plan using our AI model, we need your Age, Gender, Height, Weight, and Pre-existing Conditions.
                </p>
            </div>
            <Button onClick={() => navigate('/profile')} className="gradient-primary text-primary-foreground border-0 shadow-lg text-lg px-8 py-6 rounded-2xl">
                Complete Profile <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
    );
  }

  const latestLog = logs.length > 0 ? logs[0] : null;

  if (loadingPlan && !isMissingPrereqs) {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid grid-cols-4 gap-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  // Bind Dynamic ML Data
  const dailyGoals = mlPlan?.daily_goals ? [
    { label: "Calorie Goal", current: latestLog?.diet_quality ? latestLog.diet_quality * 200 : 0, target: mlPlan.daily_goals.target_calories, icon: Target, color: "text-secondary" },
    { label: "Calories Burned", current: latestLog?.physical_activity ? latestLog.physical_activity * 50 : 0, target: mlPlan.daily_workouts.reduce((acc: any, w: any) => acc + w.calories, 0), icon: Flame, color: "text-warning" },
    { label: "Protein Intake", current: 0, target: mlPlan.daily_goals.target_protein, unit: "g", icon: Dumbbell, color: "text-success" },
    { label: "Active Minutes", current: latestLog?.physical_activity ? latestLog.physical_activity * 10 : 0, target: 60, icon: TrendingUp, color: "text-primary" },
  ] : [];

  const weeklyCalories = mlPlan?.weekly_meals?.map((m: any, i: number) => ({
      day: m.day,
      consumed: m.calories,
      burned: mlPlan.weekly_workouts[i].calories
  })) || [];

  const startWorkout = (i: number, name: string) => {
    setWorkoutsDone(p => ({ ...p, [i]: true }));
    toast.success(`${name} started! Keep it up! 💪`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Diet & Exercise Plan</h1>
        <p className="text-sm text-muted-foreground">Personalized nutrition and fitness recommendations</p>
      </div>

      {/* Daily Goals */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dailyGoals.map((g: any, i: number) => {
          const pct = g.target === 0 ? 0 : Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <div key={i} className="glass-card-hover rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <g.icon className={`h-5 w-5 ${g.color}`} />
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

      {/* Weekly Calorie Balance Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-1">Weekly Calorie Balance</h3>
        <p className="text-xs text-muted-foreground mb-4">Track your calorie consumption vs. burn rate</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyCalories} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
            <Bar dataKey="consumed" fill="hsl(217, 100%, 61%)" radius={[4, 4, 0, 0]} name="Consumed" />
            <Bar dataKey="burned" fill="hsl(152, 55%, 48%)" radius={[4, 4, 0, 0]} name="Burned" />
          </BarChart>
        </ResponsiveContainer>
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

        {tab === "diet" ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-foreground">{viewMode === "today" ? "Today's Meal Plan" : "Weekly Meal Plan"}</h2>
                <p className="text-xs text-muted-foreground">Personalized for diabetes prevention</p>
              </div>
              <button onClick={() => setViewMode(viewMode === "today" ? "week" : "today")} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-foreground hover:bg-accent transition-colors">
                <Calendar className="h-4 w-4" />
                {viewMode === "today" ? "View Week" : "View Today"}
              </button>
            </div>

            {viewMode === "today" ? (
              <>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {mlPlan?.daily_meals?.map((meal: any, i: number) => {
                    const Icon = getIconForMeal(meal.type);
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
                      <div className="border-t border-border/50 pt-3 grid grid-cols-4 gap-2 text-center">
                        {Object.entries(meal.macros).map(([key, val]) => (
                          <div key={key}>
                            <p className="text-[10px] text-muted-foreground capitalize">{key}</p>
                            <p className="text-sm font-bold font-heading text-foreground">{val as React.ReactNode}{key !== "calories" ? "g" : ""}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )})}
                </div>

                {/* Total Macros Summary */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    {mlPlan?.daily_goals && Object.entries(mlPlan.daily_goals).map(([key, val]: [string, any]) => {
                      const label = key.replace("target_", "");
                      return (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground capitalize">{label === "calories" ? "Total Calories" : label}</p>
                        <p className={`text-2xl font-bold font-heading ${label === "calories" ? "text-secondary" : "text-primary"}`}>{val.toLocaleString()}{label !== "calories" ? "g" : ""}</p>
                        <p className="text-[10px] text-muted-foreground">AI Daily Target</p>
                      </div>
                    )})}
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="grid grid-cols-4 gap-0 px-5 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground">
                  <span>Day</span><span className="text-center">Meals</span><span className="text-center">Calories</span><span className="text-center">Protein</span>
                </div>
                {mlPlan?.weekly_meals?.map((d: any, i: number) => (
                  <div key={i} className="grid grid-cols-4 gap-0 px-5 py-3 border-t border-border/50 hover:bg-accent/40 transition-colors">
                    <span className="text-sm font-medium text-foreground">{d.day}</span>
                    <span className="text-sm text-muted-foreground text-center">{d.meals}</span>
                    <span className="text-sm text-muted-foreground text-center">{d.calories.toLocaleString()} cal</span>
                    <span className="text-sm text-muted-foreground text-center">{d.protein}g</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-foreground">{viewMode === "today" ? "Today's Workout Plan" : "Weekly Workout Plan"}</h2>
                <p className="text-xs text-muted-foreground">Designed for cardiovascular health</p>
              </div>
              <button onClick={() => setViewMode(viewMode === "today" ? "week" : "today")} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-foreground hover:bg-accent transition-colors">
                <Calendar className="h-4 w-4" />
                {viewMode === "today" ? "View Week" : "View Today"}
              </button>
            </div>

            {viewMode === "today" ? (
              <>
                <div className="space-y-3 mb-6">
                  {mlPlan?.daily_workouts?.map((w: any, i: number) => (
                    <div key={i} className={`glass-card rounded-2xl p-5 border transition-all ${workoutsDone[i] ? "border-success/30 bg-success/5" : "border-border"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${workoutsDone[i] ? "bg-success/10 text-success" : "bg-accent text-muted-foreground"}`}>
                            {workoutsDone[i] ? <Check className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}
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
                        {!workoutsDone[i] && (
                          <button onClick={() => startWorkout(i, w.name)} className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5">
                            <Play className="h-3.5 w-3.5" /> Start Workout
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exercise Stats */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                       <Flame className="h-4 w-4" /> Weekly Burn Target
                    </div>
                    <p className="text-2xl font-bold font-heading text-foreground">{mlPlan?.weekly_workouts?.reduce((a:any, b:any) => a+b.calories, 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mb-2">Calories Burned</p>
                  </div>
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                       <Target className="h-4 w-4" /> Recommended Weekly Active Days
                    </div>
                    <p className="text-2xl font-bold font-heading text-foreground">{mlPlan?.weekly_workouts?.filter((w:any) => w.workouts > 0).length || 0}/7</p>
                    <p className="text-xs text-muted-foreground mb-2">Days Active</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="grid grid-cols-4 gap-0 px-5 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground">
                  <span>Day</span><span className="text-center">Workouts</span><span className="text-center">Calories</span><span className="text-center">Duration</span>
                </div>
                {mlPlan?.weekly_workouts?.map((d: any, i: number) => (
                  <div key={i} className="grid grid-cols-4 gap-0 px-5 py-3 border-t border-border/50 hover:bg-accent/40 transition-colors">
                    <span className="text-sm font-medium text-foreground">{d.day}</span>
                    <span className="text-sm text-muted-foreground text-center">{d.workouts}</span>
                    <span className="text-sm text-muted-foreground text-center">{d.calories} cal</span>
                    <span className="text-sm text-muted-foreground text-center">{d.duration}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DietExercise;
