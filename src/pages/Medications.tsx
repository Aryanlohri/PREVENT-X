import { motion } from "framer-motion";
import { Pill, Plus, Check, Clock, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

interface Med {
  name: string;
  dosage: string;
  times: string[];
  taken: boolean[];
}

const initialMeds: Med[] = [
  { name: "Vitamin D3 2000IU", dosage: "1 tablet", times: ["8:00 AM"], taken: [true] },
  { name: "Omega-3 Fish Oil", dosage: "1 softgel", times: ["8:00 AM"], taken: [true] },
  { name: "Metformin 500mg", dosage: "1 tablet", times: ["1:00 PM", "9:00 PM"], taken: [false, false] },
  { name: "Multivitamin Complex", dosage: "1 tablet", times: ["9:00 PM"], taken: [false] },
];

const Medications = () => {
  const { language: lang } = useAppContext();
  const [meds, setMeds] = useState<Med[]>(initialMeds);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newTime, setNewTime] = useState("08:00");

  const toggle = (mIdx: number, tIdx: number) => {
    setMeds(prev => prev.map((m, i) => i === mIdx ? { ...m, taken: m.taken.map((tk, j) => j === tIdx ? !tk : tk) } : m));
  };

  const removeMed = (idx: number) => {
    setMeds(prev => prev.filter((_, i) => i !== idx));
    toast.success("Medication removed");
  };

  const addMed = () => {
    if (!newName.trim()) return toast.error("Please enter medication name");
    const timeStr = new Date(`2000-01-01T${newTime}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
    setMeds(prev => [...prev, { name: newName, dosage: newDosage || "1 tablet", times: [timeStr], taken: [false] }]);
    setNewName(""); setNewDosage(""); setNewTime("08:00");
    setDialogOpen(false);
    toast.success("Medication added");
  };

  const updateTime = (mIdx: number, tIdx: number, newTimeVal: string) => {
    const timeStr = new Date(`2000-01-01T${newTimeVal}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
    setMeds(prev => prev.map((m, i) => i === mIdx ? { ...m, times: m.times.map((tm, j) => j === tIdx ? timeStr : tm) } : m));
    toast.success("Time updated");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t(lang, "medicationsTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t(lang, "medicationsDesc")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          {t(lang, "addMedication")}
        </Button>
      </div>

      <div className="grid gap-4">
        {meds.map((med, mIdx) => (
          <motion.div key={mIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mIdx * 0.05 }} className="glass-card rounded-2xl p-5 relative">
            <button onClick={() => removeMed(mIdx)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
              <X className="h-4 w-4 text-destructive" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{med.name}</p>
                <p className="text-xs text-muted-foreground">{med.dosage}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {med.times.map((time, tIdx) => (
                <div key={tIdx} className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(mIdx, tIdx)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all border ${
                      med.taken[tIdx]
                        ? "bg-success/10 border-success/20 text-success"
                        : "bg-card border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {med.taken[tIdx] ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {time}
                    {med.taken[tIdx] && <span className="text-xs">{t(lang, "taken")}</span>}
                  </button>
                  <input
                    type="time"
                    className="text-xs bg-muted rounded-lg px-2 py-1.5 border border-border text-foreground w-24"
                    onChange={e => e.target.value && updateTime(mIdx, tIdx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t(lang, "cancel")}</Button>
            <Button onClick={addMed}>{t(lang, "add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Medications;
