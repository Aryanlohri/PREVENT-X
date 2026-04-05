import { motion } from "framer-motion";
import { Save, Loader2, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";
import { fetchUserProfile, updateUserProfile, type UserProfile, isApiError } from "@/lib/api";

const Profile = () => {
  const { language: lang } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    condition: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await fetchUserProfile();
      setForm({
        fullName: user.full_name || "",
        email: user.email || "",
        age: user.age?.toString() || "",
        gender: user.gender || "",
        height: user.height?.toString() || "",
        weight: user.weight?.toString() || "",
        condition: user.pre_existing_condition || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        full_name: form.fullName,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        pre_existing_condition: form.condition,
      });
      toast.success(t(lang, "profileSaved"));
    } catch (err) {
      const msg = isApiError(err) ? err.detail : "Failed to update profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const initials = form.fullName ? form.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading your profile...</p>
      </div>
    );
  }

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
            <h3 className="font-heading font-semibold text-foreground">{form.fullName || "Your Name"}</h3>
            <p className="text-sm text-muted-foreground">{form.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground text-sm">{t(lang, "personalInfo")}</h4>
            <div className="space-y-2"><Label>{t(lang, "fullName")}</Label><Input value={form.fullName} onChange={e => update("fullName", e.target.value)} /></div>
            <div className="space-y-2"><Label>{t(lang, "email")}</Label><Input value={form.email} disabled className="bg-muted/50" /></div>
            <div className="space-y-2"><Label>Age</Label><Input value={form.age} onChange={e => update("age", e.target.value)} type="number" /></div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <select 
                value={form.gender} 
                onChange={e => update("gender", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground text-sm">{t(lang, "healthInfo")}</h4>
            <div className="space-y-2"><Label>{t(lang, "heightCm")}</Label><Input value={form.height} onChange={e => update("height", e.target.value)} type="number" /></div>
            <div className="space-y-2"><Label>{t(lang, "weightKg")}</Label><Input value={form.weight} onChange={e => update("weight", e.target.value)} type="number" /></div>
            <div className="space-y-2"><Label>Pre-existing Condition</Label><Input value={form.condition} onChange={e => update("condition", e.target.value)} placeholder="e.g. Type 2 Diabetes" /></div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90 px-8">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {t(lang, "saveChanges")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
