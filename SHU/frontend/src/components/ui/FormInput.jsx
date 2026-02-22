import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const FormInput = ({ label, className, labelStyle, ...props }) => {
    return (
        <div className="form-field-wrapper">
            <motion.label className="form-label" style={labelStyle}>{label}</motion.label>
            <motion.input
                className={cn(
                    "form-input",
                    className
                )}
                {...props}
            />
        </div>
    );
};
