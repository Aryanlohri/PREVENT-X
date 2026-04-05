import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, X, Activity, AlertCircle, Info, Stethoscope, Utensils, Pill, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { predictDisease, type SymptomCheckResponse } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// List from backend symptom_list.json
const SYMPTOMS = [
  "abdominal_pain", "abnormal_menstruation", "acidity", "acute_liver_failure", "altered_sensorium", "anxiety", "back_pain", "belly_pain", "blackheads", "bladder_discomfort", "blister", "blood_in_sputum", "bloody_stool", "blurred_and_distorted_vision", "breathlessness", "brittle_nails", "bruising", "burning_micturition", "chest_pain", "chills", "cold_hands_and_feets", "coma", "congestion", "constipation", "continuous_feel_of_urine", "continuous_sneezing", "cough", "cramps", "dark_urine", "dehydration", "depression", "diarrhoea", "dischromic_patches", "distention_of_abdomen", "dizziness", "drying_and_tingling_lips", "enlarged_thyroid", "excessive_hunger", "extra_marital_contacts", "family_history", "fast_heart_rate", "fatigue", "fluid_overload", "foul_smell_of_urine", "headache", "high_fever", "hip_joint_pain", "history_of_alcohol_consumption", "increased_appetite", "indigestion", "inflammatory_nails", "internal_itching", "irregular_sugar_level", "irritability", "irritation_in_anus", "itching", "joint_pain", "knee_pain", "lack_of_concentration", "lethargy", "loss_of_appetite", "loss_of_balance", "loss_of_smell", "malaise", "mild_fever", "mood_swings", "movement_stiffness", "mucoid_sputum", "muscle_pain", "muscle_wasting", "muscle_weakness", "nausea", "neck_pain", "nodal_skin_eruptions", "obesity", "pain_behind_the_eyes", "pain_during_bowel_movements", "pain_in_anal_region", "painful_walking", "palpitations", "passage_of_gases", "patches_in_throat", "phlegm", "polyuria", "prominent_veins_on_calf", "puffy_face_and_eyes", "pus_filled_pimples", "receiving_blood_transfusion", "receiving_unsterile_injections", "red_sore_around_nose", "red_spots_over_body", "redness_of_eyes", "restlessness", "runny_nose", "rusty_sputum", "scurring", "shivering", "silver_like_dusting", "sinus_pressure", "skin_peeling", "skin_rash", "slurred_speech", "small_dents_in_nails", "spinning_movements", "spotting_urination", "stiff_neck", "stomach_bleeding", "stomach_pain", "sunken_eyes", "sweating", "swelled_lymph_nodes", "swelling_joints", "swelling_of_stomach", "swollen_blood_vessels", "swollen_extremeties", "swollen_legs", "throat_irritation", "toxic_look_(typhos)", "ulcers_on_tongue", "unsteadiness", "visual_disturbances", "vomiting", "watering_from_eyes", "weakness_in_limbs", "weakness_of_one_body_side", "weight_gain", "weight_loss", "yellow_crust_ooze", "yellow_urine", "yellowing_of_eyes", "yellowish_skin"
].sort();

export const SymptomChecker = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomCheckResponse | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelected(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const removeSymptom = (symptom: string) => {
    setSelected(prev => prev.filter(s => s !== symptom));
  };

  const handlePredict = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one symptom.");
      return;
    }
    setLoading(true);
    try {
      const data = await predictDisease(selected);
      setResult(data);
      toast.success("AI Analysis Complete");
    } catch (err) {
      toast.error("Failed to run symptom analysis.");
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = (level: string) => {
    if (level === "Emergency") return "text-destructive border-destructive/20 bg-destructive/5";
    if (level === "Urgent") return "text-warning border-warning/20 bg-warning/5";
    return "text-success border-success/20 bg-success/5";
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-semibold text-foreground">Interactive Symptom Checker</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Select all symptoms you are currently experiencing. Our AI model will analyze patterns to identify probable conditions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start">
          <div className="w-full sm:w-80">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between rounded-xl h-11"
                >
                  <span className="truncate">
                    {selected.length > 0 
                      ? `${selected.length} symptoms selected` 
                      : "Search symptoms..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] sm:w-[300px] p-0 rounded-xl overflow-hidden" align="start">
                <Command>
                  <CommandInput placeholder="Search symptom..." />
                  <CommandEmpty>No symptom found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <ScrollArea className="h-64 sm:h-72">
                        {SYMPTOMS.map((s) => (
                          <CommandItem
                            key={s}
                            value={s}
                            onSelect={() => {
                              toggleSymptom(s);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selected.includes(s) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {s.replace(/_/g, ' ')}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            onClick={handlePredict} 
            disabled={loading || selected.length === 0}
            className="gradient-primary px-8 rounded-xl shadow-lg shadow-primary/20 h-11 flex-1 sm:flex-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
            Analyze Symptoms
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <AnimatePresence>
            {selected.map((s) => (
              <motion.div
                key={s}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-lg flex items-center gap-1 bg-accent text-foreground border-transparent text-[11px] sm:text-xs">
                  {s.replace(/_/g, ' ')}
                  <button onClick={() => removeSymptom(s)} className="p-0.5 hover:bg-muted rounded-full transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
          {selected.length > 0 && (
            <button 
              onClick={() => setSelected([])}
              className="text-[10px] sm:text-xs text-muted-foreground hover:text-destructive underline underline-offset-4 ml-2"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-12"
          >
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${urgencyColor(result.urgency_level)}`}>
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider">Urgency Level: {result.urgency_level}</p>
                <p className="text-[10px] sm:text-xs opacity-80">
                  {result.urgency_level === "Emergency" 
                    ? "Immediate medical attention is advised." 
                    : result.urgency_level === "Urgent" 
                    ? "Consider consulting a doctor soon." 
                    : "Monitor your symptoms and maintain your routine."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.predictions.map((p, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden h-full"
                >
                  <div className="absolute top-0 right-0 p-3">
                    <span className="text-xl sm:text-2xl font-bold text-primary/10 font-heading">#{i+1}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold font-heading text-foreground mb-1 pr-8">{p.probable_disease}</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${p.confidence}%` }} />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-primary">{p.confidence}%</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Recommended Action</p>
                      <ul className="space-y-1.5 sm:space-y-1">
                        {p.prevention_steps.slice(0, 2).map((s, j) => (
                          <li key={j} className="text-[11px] sm:text-xs text-foreground flex items-start gap-1.5 leading-relaxed">
                            <Check className="h-3 w-3 text-success mt-0.5 shrink-0" /> <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                       <div className="p-2 sm:p-3 rounded-xl bg-accent/40 border border-border/50">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Utensils className="h-3 w-3 text-success" />
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Diet</span>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight line-clamp-2">{p.diet_advice[0] || "Standard"}</p>
                       </div>
                       <div className="p-2 sm:p-3 rounded-xl bg-accent/40 border border-border/50">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Pill className="h-3 w-3 text-secondary" />
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Meds</span>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight line-clamp-2">{p.medication_advice[0] || "None"}</p>
                       </div>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                       <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate mr-2">Doc: <span className="text-foreground font-medium">{p.recommended_doctors[0]}</span></span>
                       <Info className="h-3 w-3 text-muted-foreground cursor-help shrink-0" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
