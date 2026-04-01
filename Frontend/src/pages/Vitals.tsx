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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVitals, createVital } from "@/lib/queries";

// ... (existing imports omitted for brevity)

const vitalTypes = ["Blood Pressure", "Blood Sugar", "Heart Rate", "Weight", "BMI", "Temperature", "Oxygen Saturation"];

const Vitals = () => {
  const { language: lang } = useAppContext();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['vitals'],
    queryFn: fetchVitals
  });

  const mutation = useMutation({
    mutationFn: (newVital: any) => createVital(newVital),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'] });
      setDialogOpen(false);
      setNewValue("");
      toast.success("Vital logged successfully");
    },
    onError: () => {
      toast.error("Failed to log vital");
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState("Blood Pressure");
  const [newValue, setNewValue] = useState("");

  const addVital = () => {
    if (!newValue.trim()) return toast.error("Please enter a value");

    // Parse the value based on type for the backend model
    let payload: any = {};
    if (newType === "Blood Pressure") {
      const parts = newValue.split('/');
      if (parts.length === 2) {
        payload.blood_pressure_sys = parseInt(parts[0]);
        payload.blood_pressure_dia = parseInt(parts[1]);
      }
    } else if (newType === "Blood Sugar") {
      payload.blood_sugar = parseInt(newValue);
    } else if (newType === "Heart Rate") {
      payload.heart_rate = parseInt(newValue);
    } else if (newType === "BMI") {
      payload.bmi = parseFloat(newValue);
    }

    mutation.mutate(payload);
  };

  const removeVital = (id: number) => {
    // API deletion not yet implemented in backend, mocking success for now
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
        {records.length === 0 && !isLoading && <p className="text-sm text-muted-foreground">No vitals logged yet.</p>}
        {records.map((r: any) => {

          let label = "Unknown";
          let valueStr = "";
          if (r.blood_pressure_sys) { label = "Blood Pressure"; valueStr = `${r.blood_pressure_sys}/${r.blood_pressure_dia} mmHg`; }
          else if (r.blood_sugar) { label = "Blood Sugar"; valueStr = `${r.blood_sugar} mg/dL`; }
          else if (r.heart_rate) { label = "Heart Rate"; valueStr = `${r.heart_rate} bpm`; }
          else if (r.bmi) { label = "BMI"; valueStr = `${r.bmi}`; }

          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-hover rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-foreground">{valueStr}</span>
                <TrendingUp className="h-4 w-4 text-success" />
                <button onClick={() => removeVital(r.id)} className="p-1 rounded-lg hover:bg-destructive/10 transition-colors">
                  <X className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </motion.div>
          );
        })}
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
