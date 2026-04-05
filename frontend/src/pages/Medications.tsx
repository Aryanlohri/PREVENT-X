import { motion } from "framer-motion";
import { Pill as PillIcon, Plus, Check, Clock, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";
import { fetchMedications, createMedication, toggleMedication, type MedicationRecord, isApiError } from "@/lib/api";

interface GroupedMed {
  name: string;
  dosage: string;
  items: MedicationRecord[];
}

const Medications = () => {
  const { language: lang } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [meds, setMeds] = useState<MedicationRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newTime, setNewTime] = useState("08:00");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMedications();
      setMeds(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load medications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggle = async (medId: number, currentTaken: boolean) => {
    // Optimistic UI update
    setMeds(prev => prev.map(m => m.id === medId ? { ...m, taken: !currentTaken } : m));
    
    try {
      await toggleMedication(medId, !currentTaken);
    } catch (err) {
      // Revert on error
      setMeds(prev => prev.map(m => m.id === medId ? { ...m, taken: currentTaken } : m));
      const msg = isApiError(err) ? err.detail : "Failed to update medication status";
      toast.error(msg);
    }
  };

  const addMed = async () => {
    if (!newName.trim()) return toast.error("Please enter medication name");
    
    setSaving(true);
    try {
      const timeStr = new Date(`2000-01-01T${newTime}`).toLocaleTimeString([], { 
        hour: "numeric", minute: "2-digit", hour12: true 
      }).toUpperCase();
      
      const payload = {
        name: newName,
        time: timeStr,
        taken: false
      };

      const saved = await createMedication(payload);
      setMeds(prev => [saved, ...prev]);
      setNewName(""); setNewDosage(""); setNewTime("08:00");
      setDialogOpen(false);
      toast.success("Medication added successfully");
    } catch (err) {
      const msg = isApiError(err) ? err.detail : "Failed to add medication";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Group medications by name for cleaner UI
  const groupedMeds: GroupedMed[] = meds.reduce((acc: GroupedMed[], curr) => {
    const existing = acc.find(m => m.name === curr.name);
    if (existing) {
      existing.items.push(curr);
    } else {
      acc.push({ name: curr.name, dosage: "1 pill", items: [curr] });
    }
    return acc;
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">{t(lang, "medicationsTitle")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{t(lang, "medicationsDesc")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90 w-full sm:w-auto h-11 sm:h-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t(lang, "addMedication")}
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading your medications...</p>
          </div>
        ) : groupedMeds.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <PillIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-foreground mb-1">No medications added</h3>
            <p className="text-sm text-muted-foreground mb-6">Keep track of your supplements and prescriptions here.</p>
            <Button onClick={() => setDialogOpen(true)} variant="outline">Add First Medication</Button>
          </div>
        ) : (
          groupedMeds.map((med, mIdx) => (
            <motion.div key={med.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mIdx * 0.05 }} className="glass-card rounded-2xl p-5 relative">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0 w-max">
                  <PillIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-base">{med.name}</p>
                  <p className="text-xs text-muted-foreground">{med.dosage}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {med.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id, item.taken)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all border ${
                      item.taken
                        ? "bg-success/10 border-success/20 text-success"
                        : "bg-card border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {item.taken ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                    {item.time}
                    {item.taken && <span className="text-[10px] sm:text-xs">({t(lang, "taken")})</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t(lang, "addNewMedication")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>{t(lang, "medicineName")}</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Aspirin 100mg" /></div>
            <div className="space-y-2"><Label>{t(lang, "dosage")}</Label><Input value={newDosage} onChange={e => setNewDosage(e.target.value)} placeholder="e.g. 1 tablet" /></div>
            <div className="space-y-2"><Label>{t(lang, "time")}</Label><Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={() => setDialogOpen(false)}>{t(lang, "cancel")}</Button>
            <Button onClick={addMed} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t(lang, "add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Medications;
