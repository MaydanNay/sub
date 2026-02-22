import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export const ProcessStep = ({ id, title, desc, isEven }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className={cn(
                "process-step-item",
                isEven ? "is-even" : ""
            )}
        >
            {/* Content */}
            <div className={cn(
                "step-content-wrapper",
                isEven ? "text-right" : "text-left"
            )}>
                <div className="step-card">
                    <span className="step-badge">
                        ШАГ_0{id}
                    </span>
                    <h3 className="step-item-title">{title}</h3>
                    <p className="step-item-desc">{desc}</p>
                </div>
            </div>

            {/* Timeline Dot */}
            <div className="step-dot-wrapper">
                <div className="step-dot-inner" />
            </div>

            {/* Empty block for layout alignment on desktop */}
            <div className="step-empty-block" />
        </motion.div>
    );
};
