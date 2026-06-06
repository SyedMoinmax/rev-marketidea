import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle, Circle, Zap, Send, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STAGES = [
  { key: "open",        label: "Open",              desc: "Your request is live",          icon: Circle },
  { key: "ai_review",  label: "In Review by AI",   desc: "Offers are being validated",    icon: Zap },
  { key: "offers",     label: "Offers Received",   desc: "Professionals have responded",  icon: Send },
  { key: "accepted",   label: "Offer Accepted",    desc: "You selected a professional",   icon: CheckCircle },
];

function getStageIndex(request) {
  if (request.status === "completed" || request.accepted_offer_id) return 3;
  if ((request.offer_count || 0) > 0) return 2;
  // check if any offer is in AI validation
  return 0;
}

export default function RequestStatusTracker({ request }) {
  const stageIndex = getStageIndex(request);

  const statusColors = {
    active: "bg-green-100 text-green-700 border-green-200",
    in_progress: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-purple-100 text-purple-700 border-purple-200",
    expired: "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-secondary text-muted-foreground border-border",
  };

  return (
    <Link to={`/requests/${request.id}`}>
      <div className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all hover:border-primary/30 group">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{request.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{request.category_name || "General"} · {request.city}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={`text-xs border ${statusColors[request.status] || "bg-secondary"}`}>
              {request.status}
            </Badge>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center gap-0">
          {STAGES.map((stage, i) => {
            const done = i < stageIndex;
            const active = i === stageIndex;
            const pending = i > stageIndex;

            return (
              <React.Fragment key={stage.key}>
                {/* Node */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: active ? [1, 1.15, 1] : 1,
                    }}
                    transition={{ duration: 0.6, repeat: active ? Infinity : 0, repeatDelay: 2 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? "bg-primary border-primary" :
                      active ? "bg-primary/10 border-primary" :
                      "bg-secondary border-border"
                    }`}
                  >
                    {done ? (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <stage.icon className={`w-3.5 h-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    )}
                  </motion.div>
                  <p className={`text-[10px] mt-1 font-medium text-center leading-tight max-w-[60px] ${
                    active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
                  }`}>{stage.label}</p>
                </div>

                {/* Connector */}
                {i < STAGES.length - 1 && (
                  <div className="flex-1 h-0.5 mb-5 mx-0.5 relative overflow-hidden rounded-full bg-border">
                    {done && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="absolute inset-0 bg-primary rounded-full"
                      />
                    )}
                    {active && (
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Active stage description */}
        {stageIndex < STAGES.length && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {STAGES[stageIndex].desc}
            {(request.offer_count || 0) > 0 && ` · ${request.offer_count} offer${request.offer_count > 1 ? "s" : ""}`}
          </p>
        )}
      </div>
    </Link>
  );
}