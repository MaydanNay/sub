import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Button = ({
    className,
    variant = "primary",
    children,
    ...props
}) => {
    const variants = {
        primary: cn(
            "btn-primary",
            "hover:translate-x-[2px] hover:translate-y-[2px]",
            "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            "active:translate-x-[4px] active:translate-y-[4px]",
            "active:shadow-none"
        ),
    };

    return (
        <button
            className={cn(
                "btn-base",
                variants[variant] || "",
                className
            )}
            {...props}
        >
            <span className="relative z-10">{children}</span>
        </button>
    );
};
