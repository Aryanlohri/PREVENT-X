import { motion } from "framer-motion";
import { Activity, Plus, TrendingUp, X, Loader2, Thermometer, Droplets, Heart as HeartIcon, Weight as WeightIcon, Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";
import { fetchVitals, createVital, type VitalRecord, isApiError, type VitalCreatePayload } from "@/lib/api";

const vitalTypes = [
  "Blood Pressure", 
  "Blood Sugar", 
  "Heart Rate", 
  "Weight", 
  "BMI"
];

const Vitals = () => {
  const { language: lang } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<VitalRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [newType, setNewType] = useState("Blood Pressure");
  const [newValue, setNewValue] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchVitals();
      setRecords(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load vitals history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addVital = async () => {
    if (!newValue.trim()) return toast.error("Please enter a value");
    
    setSaving(true);
    try {
      const payload: VitalCreatePayload = {};
      const val = parseFloat(newValue);

      if (newType === "Blood Pressure") {
        // Special logic for BP: "120/80"
        const parts = newValue.split("/");
        if (parts.length === 2) {
          payload.blood_pressure_sys = parseInt(parts[0]);
          payload.blood_pressure_dia = parseInt(parts[1]);
        } else {
          toast.error("BP must be in systolic/diastolic format (e.g. 120/80)");
          setSaving(false);
          return;
        }
      } else if (newType === "Blood Sugar") payload.blood_sugar = val;
      else if (newType === "Heart Rate") payload.heart_rate = val;
      else if (newType === "Weight" || newType === "BMI") payload.bmi = val; // Using BMI field for now or weight
      else if (newType === "BMI") payload.bmi = val;

      const saved = await createVital(payload);
      setRecords(prev => [saved, ...prev]);
      setNewValue("");
      setDialogOpen(false);
      toast.success("Vital logged successfully");
    } catch (err) {
      const msg = isApiError(err) ? err.detail : "Failed to save vital";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const getDisplayItems = () => {
    const items: { id: number, label: string, value: string, date: string, type: string }[] = [];
    
    records.forEach(r => {
      const date = new Date(r.timestamp).toLocaleString([], { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });

      if (r.blood_pressure_sys) {
        items.push({ id: r.id, label: "Blood Pressure", value: `${r.blood_pressure_sys}/${r.blood_pressure_dia} mmHg`, date, type: 'bp' });
      }
      if (r.blood_sugar) {
        items.push({ id: r.id, label: "Blood Sugar", value: `${r.blood_sugar} mg/dL`, date, type: 'sugar' });
      }
      if (r.heart_rate) {
        items.push({ id: r.id, label: "Heart Rate", value: `${r.heart_rate} bpm`, date, type: 'heart' });
      }
      if (r.bmi) {
        items.push({ id: r.id, label: "BMI / Weight", value: `${r.bmi}`, date, type: 'bmi' });
      }
    });

    return items;
  };

  const displayItems = getDisplayItems();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">{t(lang, "vitalsTitle")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{t(lang, "vitalsDesc")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90 w-full sm:w-auto h-11 sm:h-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t(lang, "logVital")}
        </Button>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading your health history...</p>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-foreground mb-1">No vitals logged yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Start tracking your health by logging your first vital sign.</p>
            <Button onClick={() => setDialogOpen(true)} variant="outline">Log First Vital</Button>
          </div>
        ) : (
          displayItems.map((r, i) => (
            <motion.div
              key={`${r.id}-${r.type}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="glass-card-hover rounded-xl p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{r.date}</p>
                  </div>
                </div>
                <div className="flex items-baseline sm:items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-2 sm:pt-0 border-border/50">
                  <span className="text-base sm:text-lg font-semibold text-foreground">{r.value}</span>
                  <TrendingUp className="h-4 w-4 text-success shrink-0" />
                </div>
              </div>
            </motion.div>
          ))
        )}
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
              <Input 
                value={newValue} 
                onChange={e => setNewValue(e.target.value)} 
                placeholder={newType === "Blood Pressure" ? "e.g. 120/80" : "Enter value"} 
              />
              {newType === "Blood Pressure" && <p className="text-[10px] text-muted-foreground">Format: Systolic/Diastolic</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={() => setDialogOpen(false)}>{t(lang, "cancel")}</Button>
            <Button onClick={addVital} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t(lang, "add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vitals;
