import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const FormTextarea = ({ label, className, labelStyle, ...props }) => {
    return (
        <div className="form-field-wrapper">
            <motion.label className="form-label" style={labelStyle}>{label}</motion.label>
            <motion.textarea
                className={cn(
                    "form-input form-textarea",
                    className
                )}
                {...props}
            />
        </div>
    );
};
