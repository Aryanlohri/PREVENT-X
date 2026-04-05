import { motion } from "framer-motion";
import { Bell, AlertTriangle, CheckCircle, Info, Loader2, Pill, Activity, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchVitals, fetchMedications, fetchRiskPrediction, isAuthenticated } from "@/lib/api";

interface Notification {
  icon: any;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  type: "warning" | "success" | "info";
}

const typeColor = { warning: "text-warning", success: "text-success", info: "text-secondary" };

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [vitals, meds, risk] = await Promise.allSettled([
        fetchVitals(),
        fetchMedications(),
        fetchRiskPrediction(),
      ]);

      const derived: Notification[] = [];

      // 1. Check Vitals
      if (vitals.status === "fulfilled" && vitals.value.length > 0) {
        const latest = vitals.value[0];
        if (latest.blood_pressure_sys && latest.blood_pressure_sys > 140) {
          derived.push({
            icon: Activity,
            title: "High Blood Pressure Alert",
            body: `Your latest systolic reading is ${latest.blood_pressure_sys} mmHg. Consider rest or consulting a doctor.`,
            time: "Latest reading",
            unread: true,
            type: "warning"
          });
        }
        if (latest.blood_sugar && latest.blood_sugar > 140) {
          derived.push({
            icon: Droplets,
            title: "High Blood Sugar Alert",
            body: `Your latest glucose reading is ${latest.blood_sugar} mg/dL. Monitor your intake.`,
            time: "Latest reading",
            unread: true,
            type: "warning"
          });
        }
      }

      // 2. Check Medications
      if (meds.status === "fulfilled") {
        const untaken = meds.value.filter(m => !m.taken);
        if (untaken.length > 0) {
          derived.push({
            icon: Pill,
            title: "Medication Reminder",
            body: `You have ${untaken.length} medication${untaken.length > 1 ? 's' : ''} still pending for today.`,
            time: "Today",
            unread: true,
            type: "warning"
          });
        }
      }

      // 3. Check Risk
      if (risk.status === "fulfilled" && risk.value.risk_score > 60) {
        derived.push({
          icon: ShieldAlert,
          title: "Elevated Health Risk",
          body: "Your AI risk analysis shows a high probability. Check your personalized action plan.",
          time: "AI Update",
          unread: true,
          type: "warning"
        });
      }

      // 4. Fallback/Welcome
      if (derived.length === 0) {
        derived.push({
          icon: CheckCircle,
          title: "All Caught Up!",
          body: "Your health vitals and medications are on track for today.",
          time: "Just now",
          unread: false,
          type: "success"
        });
      }

      setNotifications(derived);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) loadNotifications();
    else setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Checking for updates...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">Stay updated on your health</p>
      </div>

      <div className="space-y-2">
        {notifications.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card rounded-xl p-4 flex gap-3 items-start transition-all ${n.unread ? "border-l-2 border-l-primary" : ""}`}
          >
            <div className={`p-2 rounded-lg bg-accent flex-shrink-0 ${typeColor[n.type]}`}>
              <n.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                {n.unread && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
              <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Droplets = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
);

export default Notifications;
