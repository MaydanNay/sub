import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const FormInput = ({ label, className, labelStyle, required = false, ...props }) => {
    return (
        <div className="form-field-wrapper">
            <motion.label className="form-label" style={labelStyle}>
                {label}
                {required && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
            </motion.label>
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
