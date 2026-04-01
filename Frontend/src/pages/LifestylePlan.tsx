import { motion, AnimatePresence } from "framer-motion";
import { Apple, Dumbbell, Flame, Activity, ArrowRight, UserCog } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchLifestylePlan } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

const LifestylePlan = () => {
    const { language: lang } = useAppContext();
    const navigate = useNavigate();

    const { data: plan, isLoading, error } = useQuery({
        queryKey: ['lifestyle_plan'],
        queryFn: fetchLifestylePlan,
        retry: false, // Don't retry if it's a 400 MISSING_PREREQUISITES error
    });

    const isMissingPrereqs = error && (error as any).response?.status === 400 && (error as any).response?.data?.detail === "MISSING_PREREQUISITES";

    if (isMissingPrereqs) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-primary/10 p-6 rounded-full">
                    <UserCog className="h-16 w-16 text-primary" />
                </motion.div>
                <div>
                    <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Your AI Coach needs to know you better.</h2>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                        To generate a highly personalized Diet & Workout AI plan, we need your Age, Gender, Height, Weight, and Pre-existing Conditions.
                    </p>
                </div>
                <Button onClick={() => navigate('/profile')} className="gradient-primary text-primary-foreground border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg px-8 py-6 rounded-2xl">
                    Complete Profile <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        );
    }

    if (error && !isMissingPrereqs) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center test-destructive">
                <p>Failed to load AI Plan. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Personalized AI Lifestyle Plan</h1>
                <p className="text-muted-foreground">Generated dynamically by our Multi-Output Random Forest model based on your unique bodily profile.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Calories Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-6 border-t-4 border-orange-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500"><Flame className="h-6 w-6" /></div>
                        <h3 className="font-heading font-semibold text-lg">Daily Caloric Goal</h3>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : (
                        <>
                            <p className="text-4xl font-black font-heading text-foreground mb-2">{plan?.calories} <span className="text-lg text-muted-foreground font-normal">kcal</span></p>
                            <p className="text-sm text-muted-foreground">Optimized for your BMI, Age, and metabolic requirements.</p>
                        </>
                    )}
                </motion.div>

                {/* Diet/Macros Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-3xl p-6 border-t-4 border-success relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-success/10 rounded-xl text-success"><Apple className="h-6 w-6" /></div>
                        <h3 className="font-heading font-semibold text-lg">Recommended Diet</h3>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ) : (
                        <>
                            <p className="text-2xl font-bold font-heading text-foreground mb-3">{plan?.macros}</p>
                            <p className="text-sm text-muted-foreground">A nutrient mix carefully tailored to support your health condition and goals.</p>
                        </>
                    )}
                </motion.div>

                {/* Workout Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-3xl p-6 border-t-4 border-primary relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary"><Dumbbell className="h-6 w-6" /></div>
                        <h3 className="font-heading font-semibold text-lg">Fitness Plan</h3>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <div className="flex items-center gap-2"><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-4 w-1/2" /></div>
                        </div>
                    ) : (
                        <>
                            <p className="text-xl font-bold font-heading text-foreground mb-3 leading-tight">{plan?.workout_type}</p>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${plan?.intensity === 'High' ? 'bg-destructive/10 text-destructive' : plan?.intensity === 'Moderate' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                                    {plan?.intensity} Intensity
                                </span>
                                <span className="text-xs text-muted-foreground">Recommended effort level</span>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6 flex items-start gap-4 border border-primary/20 bg-primary/5">
                <Activity className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                    <strong className="block mb-1">AI Recommendation Details</strong>
                    This plan is dynamically generated and specifically avoids aggravating pre-existing conditions (like suggesting low-impact training for arthritis). Consult your physician before starting any highly restrictive diet or intense fitness regimen.
                </p>
            </motion.div>
        </div>
    );
};

export default LifestylePlan;
