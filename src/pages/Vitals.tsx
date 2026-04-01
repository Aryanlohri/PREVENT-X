import { motion } from "framer-motion";
import { Activity, Plus, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

const initialRecords = [
  { label: "Blood Pressure", value: "121/78 mmHg", date: "Today, 9:00 AM" },
  { label: "Blood Sugar", value: "97 mg/dL", date: "Today, 8:30 AM" },
  { label: "Heart Rate", value: "74 bpm", date: "Today, 9:00 AM" },
  { label: "Weight", value: "72 kg", date: "Yesterday" },
  { label: "Blood Pressure", value: "118/76 mmHg", date: "2 days ago" },
  { label: "Blood Sugar", value: "102 mg/dL", date: "2 days ago" },
];

const vitalTypes = ["Blood Pressure", "Blood Sugar", "Heart Rate", "Weight", "BMI", "Temperature", "Oxygen Saturation"];

const Vitals = () => {
  const { language: lang } = useAppContext();
  const [records, setRecords] = useState(initialRecords);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState("Blood Pressure");
  const [newValue, setNewValue] = useState("");

  const addVital = () => {
    if (!newValue.trim()) return toast.error("Please enter a value");
    setRecords(prev => [{ label: newType, value: newValue, date: t(lang, "today") + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...prev]);
    setNewValue("");
    setDialogOpen(false);
    toast.success("Vital logged successfully");
  };

  const removeVital = (index: number) => {
    setRecords(prev => prev.filter((_, i) => i !== index));
    toast.success("Vital removed");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t(lang, "vitalsTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t(lang, "vitalsDesc")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          {t(lang, "logVital")}
        </Button>
      </div>

      <div className="grid gap-3">
        {records.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card-hover rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-foreground">{r.value}</span>
              <TrendingUp className="h-4 w-4 text-success" />
              <button onClick={() => removeVital(i)} className="p-1 rounded-lg hover:bg-destructive/10 transition-colors">
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t(lang, "addNewVital")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t(lang, "vitalType")}</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vitalTypes.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t(lang, "value")}</Label>
              <Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="e.g. 120/80 mmHg" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t(lang, "cancel")}</Button>
            <Button onClick={addVital}>{t(lang, "add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vitals;
