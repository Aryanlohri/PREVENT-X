import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserProfile, updateUserProfile } from "@/lib/queries";
import { useEffect } from "react";

const Profile = () => {
  const { language: lang } = useAppContext();

  const queryClient = useQueryClient();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  // Saved state (what's displayed)
  const [saved, setSaved] = useState({
    fullName: "",
    email: "",
    phone: "+1 (555) 123-4567",
    dob: "1990-06-15",
    bloodType: "O+",
    height: "",
    weight: "",
    allergies: "None",
    age: "",
    gender: "",
    preExistingCondition: "",
  });

  // Form state (editing)
  const [form, setForm] = useState({ ...saved });

  useEffect(() => {
    if (userProfile) {
      const newProfile = {
        fullName: userProfile.full_name || "",
        email: userProfile.email || "",
        phone: "+1 (555) 123-4567", // Mock remaining parts
        dob: "1990-06-15",
        bloodType: "O+",
        height: userProfile.height ? userProfile.height.toString() : "",
        weight: userProfile.weight ? userProfile.weight.toString() : "",
        allergies: "None",
        age: userProfile.age ? userProfile.age.toString() : "",
        gender: userProfile.gender || "",
        preExistingCondition: userProfile.pre_existing_condition || "",
      };
      setSaved(newProfile);
      setForm(newProfile);
    }
  }, [userProfile]);

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      setSaved({ ...form });
      toast.success(t(lang, "profileSaved"));
      queryClient.invalidateQueries({ queryKey: ['ml_risk'] }); // Risk score changes
    },
    onError: () => {
      toast.error("Failed to update profile.");
    }
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    mutation.mutate({
      full_name: form.fullName,
      email: form.email,
      height: parseInt(form.height) || null,
      weight: parseInt(form.weight) || null,
      age: parseInt(form.age) || null,
      gender: form.gender || null,
      pre_existing_condition: form.preExistingCondition || null,
    });
  };

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="glass-card rounded-2xl p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  const initials = saved.fullName ? saved.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t(lang, "profileTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t(lang, "profileDesc")}</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary/10 text-primary font-heading text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-heading font-semibold text-foreground">{saved.fullName}</h3>
            <p className="text-sm text-muted-foreground">{saved.email}</p>
            <Button variant="outline" size="sm" className="mt-2">{t(lang, "changePhoto")}</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground text-sm">{t(lang, "personalInfo")}</h4>
            <div className="space-y-2"><Label>{t(lang, "fullName")}</Label><Input value={form.fullName} onChange={e => update("fullName", e.target.value)} /></div>
            <div className="space-y-2"><Label>{t(lang, "email")}</Label><Input value={form.email} onChange={e => update("email", e.target.value)} type="email" readOnly className="bg-muted cursor-not-allowed" /></div>
            <div className="space-y-2"><Label>Age</Label><Input value={form.age} onChange={e => update("age", e.target.value)} type="number" /></div>
            <div className="space-y-2"><Label>Gender</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.gender} onChange={e => update("gender", e.target.value)}>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground text-sm">{t(lang, "healthInfo")}</h4>
            <div className="space-y-2"><Label>{t(lang, "bloodType")}</Label><Input value={form.bloodType} onChange={e => update("bloodType", e.target.value)} /></div>
            <div className="space-y-2"><Label>{t(lang, "heightCm")}</Label><Input value={form.height} onChange={e => update("height", e.target.value)} type="number" /></div>
            <div className="space-y-2"><Label>{t(lang, "weightKg")}</Label><Input value={form.weight} onChange={e => update("weight", e.target.value)} type="number" /></div>
            <div className="space-y-2"><Label>Pre-existing Condition (for AI Diet & Workout Plan)</Label><Input value={form.preExistingCondition} onChange={e => update("preExistingCondition", e.target.value)} placeholder="e.g. Diabetes, Hypertension, None" /></div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={mutation.isPending} className="gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90 px-8">
            <Save className="h-4 w-4 mr-2" />
            {mutation.isPending ? "Saving..." : t(lang, "saveChanges")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
