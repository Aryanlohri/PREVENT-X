import { motion } from "framer-motion";
import { useState } from "react";
import { Apple, Dumbbell, Flame, Droplets, Target, Clock, Check, Calendar, TrendingUp, Utensils, Coffee, Salad, Cookie, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

type Tab = "diet" | "exercise";
type ViewMode = "today" | "week";

const dailyGoals = [
  { label: "Calorie Goal", current: 2025, target: 2200, icon: Target, color: "text-secondary" },
  { label: "Calories Burned", current: 2340, target: 2400, icon: Flame, color: "text-warning" },
  { label: "Protein Intake", current: 127, target: 150, unit: "g", icon: Dumbbell, color: "text-success" },
  { label: "Active Minutes", current: 45, target: 60, icon: TrendingUp, color: "text-primary" },
];

const weeklyCalories = [
  { day: "Mon", consumed: 2100, burned: 2300 },
  { day: "Tue", consumed: 2200, burned: 2400 },
  { day: "Wed", consumed: 1900, burned: 2500 },
  { day: "Thu", consumed: 2300, burned: 2200 },
  { day: "Fri", consumed: 2150, burned: 2100 },
  { day: "Sat", consumed: 2050, burned: 2550 },
  { day: "Sun", consumed: 2100, burned: 2300 },
];

const meals = [
  {
    type: "Breakfast", icon: Coffee, time: "7:00 AM",
    items: [{ name: "Oatmeal with berries", cal: 320 }, { name: "Green tea", cal: 0 }, { name: "Banana", cal: 105 }],
    macros: { calories: 425, protein: 13, carbs: 85, fat: 8 },
  },
  {
    type: "Lunch", icon: Salad, time: "1:00 PM",
    items: [{ name: "Grilled chicken salad", cal: 380 }, { name: "Quinoa (1 cup)", cal: 220 }, { name: "Mixed vegetables", cal: 80 }],
    macros: { calories: 680, protein: 46, carbs: 65, fat: 18 },
  },
  {
    type: "Dinner", icon: Utensils, time: "7:30 PM",
    items: [{ name: "Baked salmon", cal: 280 }, { name: "Sweet potato", cal: 180 }, { name: "Steamed broccoli", cal: 55 }],
    macros: { calories: 515, protein: 47, carbs: 48, fat: 15 },
  },
  {
    type: "Snacks", icon: Cookie, time: "Throughout day",
    items: [{ name: "Greek yogurt", cal: 150 }, { name: "Almonds (1 oz)", cal: 160 }, { name: "Apple", cal: 95 }],
    macros: { calories: 405, protein: 21, carbs: 38, fat: 20 },
  },
];

const weekMeals = [
  { day: "Monday", meals: 4, calories: 2025, protein: 127 },
  { day: "Tuesday", meals: 4, calories: 2180, protein: 135 },
  { day: "Wednesday", meals: 3, calories: 1850, protein: 110 },
  { day: "Thursday", meals: 4, calories: 2300, protein: 142 },
  { day: "Friday", meals: 4, calories: 2100, protein: 130 },
  { day: "Saturday", meals: 3, calories: 1950, protein: 118 },
  { day: "Sunday", meals: 4, calories: 2050, protein: 125 },
];

const workouts = [
  { name: "Morning Run", type: "Cardio", intensity: "Moderate" as const, time: "6:00 AM", duration: "30 min", calories: 320, done: true },
  { name: "Upper Body", type: "Strength", intensity: "High" as const, time: "5:00 PM", duration: "45 min", calories: 280, done: false },
  { name: "Yoga Session", type: "Flexibility", intensity: "Low" as const, time: "8:00 PM", duration: "20 min", calories: 80, done: false },
];

const weekWorkouts = [
  { day: "Monday", workouts: 3, calories: 680, duration: "95 min" },
  { day: "Tuesday", workouts: 2, calories: 520, duration: "60 min" },
  { day: "Wednesday", workouts: 3, calories: 710, duration: "100 min" },
  { day: "Thursday", workouts: 2, calories: 450, duration: "55 min" },
  { day: "Friday", workouts: 3, calories: 600, duration: "80 min" },
  { day: "Saturday", workouts: 1, calories: 320, duration: "30 min" },
  { day: "Sunday", workouts: 2, calories: 400, duration: "50 min" },
];

const exerciseStats = [
  { label: "This Week", value: "5/7", sub: "Workouts Completed", icon: TrendingUp },
  { label: "Weekly Burn", value: "2,340", sub: "Calories Burned", icon: Flame },
  { label: "Monthly Goal", value: "18/20", sub: "Days Active", icon: Target },
];

const totalMacros = {
  calories: { value: 2025, goal: 2200, unit: "", color: "text-secondary" },
  protein: { value: 127, goal: 150, unit: "g", color: "text-primary" },
  carbs: { value: 236, goal: 250, unit: "g", color: "text-warning" },
  fat: { value: 61, goal: 65, unit: "g", color: "text-destructive" },
};

const intensityColor = (i: string) => i === "High" ? "bg-destructive text-destructive-foreground" : i === "Moderate" ? "bg-secondary text-secondary-foreground" : "bg-success text-success-foreground";

const DietExercise = () => {
  const [tab, setTab] = useState<Tab>("diet");
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [workoutsDone, setWorkoutsDone] = useState(workouts.map(w => w.done));

  const startWorkout = (i: number) => {
    setWorkoutsDone(p => p.map((v, idx) => idx === i ? true : v));
    toast.success(`${workouts[i].name} started! Keep it up! 💪`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Diet & Exercise Plan</h1>
        <p className="text-sm text-muted-foreground">Personalized nutrition and fitness recommendations</p>
      </div>

      {/* Daily Goals */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dailyGoals.map((g, i) => {
          const pct = Math.round((g.current / g.target) * 100);
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
                  {meals.map((meal, i) => (
                    <div key={i} className="glass-card rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-accent"><meal.icon className="h-5 w-5 text-secondary" /></div>
                        <div>
                          <h4 className="font-heading font-semibold text-foreground">{meal.type}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{meal.time}</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        {meal.items.map((item, j) => (
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
                            <p className="text-sm font-bold font-heading text-foreground">{val}{key !== "calories" ? "g" : ""}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Macros Summary */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    {Object.entries(totalMacros).map(([key, m]) => (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground capitalize">{key === "calories" ? "Total Calories" : key}</p>
                        <p className={`text-2xl font-bold font-heading ${m.color}`}>{m.value.toLocaleString()}{m.unit || ""}</p>
                        <p className="text-[10px] text-muted-foreground">of {m.goal.toLocaleString()}{m.unit || ""} goal</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="grid grid-cols-4 gap-0 px-5 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground">
                  <span>Day</span><span className="text-center">Meals</span><span className="text-center">Calories</span><span className="text-center">Protein</span>
                </div>
                {weekMeals.map((d, i) => (
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
                  {workouts.map((w, i) => (
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
                          <button onClick={() => startWorkout(i)} className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5">
                            <Play className="h-3.5 w-3.5" /> Start Workout
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exercise Stats */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {exerciseStats.map((s, i) => {
                    const pct = s.label === "This Week" ? 71 : s.label === "Weekly Burn" ? 78 : 90;
                    return (
                      <div key={i} className="glass-card rounded-2xl p-5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <s.icon className="h-4 w-4" /> {s.label}
                        </div>
                        <p className="text-2xl font-bold font-heading text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground mb-2">{s.sub}</p>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="grid grid-cols-4 gap-0 px-5 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground">
                  <span>Day</span><span className="text-center">Workouts</span><span className="text-center">Calories</span><span className="text-center">Duration</span>
                </div>
                {weekWorkouts.map((d, i) => (
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
