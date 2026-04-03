import { motion } from "framer-motion";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";

const notifications = [
  { icon: AlertTriangle, title: "Medication Reminder", body: "You haven't taken Metformin today.", time: "10 min ago", unread: true, type: "warning" as const },
  { icon: CheckCircle, title: "Health Score Updated", body: "Your risk score improved by 3 points this week.", time: "2 hours ago", unread: true, type: "success" as const },
  { icon: Info, title: "Upcoming Appointment", body: "Annual checkup with Dr. Smith on Feb 28.", time: "Yesterday", unread: false, type: "info" as const },
  { icon: Bell, title: "New Tip Available", body: "Check your personalized sleep improvement guide.", time: "2 days ago", unread: false, type: "info" as const },
];

const typeColor = { warning: "text-warning", success: "text-success", info: "text-secondary" };

const Notifications = () => (
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

export default Notifications;
