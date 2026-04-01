import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

const Profile = () => {
  const { language: lang } = useAppContext();

  // Saved state (what's displayed)
  const [saved, setSaved] = useState({
    fullName: "Alex Kumar",
    email: "alex.kumar@email.com",
    phone: "+1 (555) 123-4567",
    dob: "1990-06-15",
    bloodType: "O+",
    height: "175",
    weight: "72",
    allergies: "Penicillin",
  });

  // Form state (editing)
  const [form, setForm] = useState({ ...saved });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSaved({ ...form });
    toast.success(t(lang, "profileSaved"));
  };

  const initials = saved.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

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
            <div className="space-y-2"><Label>{t(lang, "email")}</Label><Input value={form.email} onChange={e => update("email", e.target.value)} type="email" /></div>
            <div className="space-y-2"><Label>{t(lang, "phone")}</Label><Input value={form.phone} onChange={e => update("phone", e.target.value)} /></div>
            <div className="space-y-2"><Label>{t(lang, "dateOfBirth")}</Label><Input value={form.dob} onChange={e => update("dob", e.target.value)} type="date" /></div>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground text-sm">{t(lang, "healthInfo")}</h4>
            <div className="space-y-2"><Label>{t(lang, "bloodType")}</Label><Input value={form.bloodType} onChange={e => update("bloodType", e.target.value)} /></div>
            <div className="space-y-2"><Label>{t(lang, "heightCm")}</Label><Input value={form.height} onChange={e => update("height", e.target.value)} type="number" /></div>
            <div className="space-y-2"><Label>{t(lang, "weightKg")}</Label><Input value={form.weight} onChange={e => update("weight", e.target.value)} type="number" /></div>
            <div className="space-y-2"><Label>{t(lang, "allergies")}</Label><Input value={form.allergies} onChange={e => update("allergies", e.target.value)} /></div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} className="gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90 px-8">
            <Save className="h-4 w-4 mr-2" />
            {t(lang, "saveChanges")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
