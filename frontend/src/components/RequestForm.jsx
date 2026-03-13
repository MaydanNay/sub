import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { FormInput } from "./ui/FormInput";
import { FormTextarea } from "./ui/FormTextarea";

const RequestForm = ({ inputBg, inputTextColor, labelColor, btnBg, isModal = false, onClose, onSuccess }) => {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [task, setTask] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [validationError, setValidationError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim() || !contact.trim()) {
            setValidationError("Пожалуйста, заполните Имя и Контактные данные для связи");
            return;
        }

        setValidationError("");
        setIsSubmitting(true);
        setSubmitStatus(null);
        try {
            const res = await fetch("/api/v1/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, contact, task }),
            });
            if (res.ok) {
                setSubmitStatus("success");
                setName("");
                setContact("");
                setTask("");
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setSubmitStatus("error");
            }
        } catch (error) {
            console.error(error);
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="footer-form" onSubmit={handleSubmit}>
            <div className="form-grid">
                <FormInput
                    label="Как к вам обращаться?"
                    type="text"
                    placeholder="ИМЯ"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (validationError) setValidationError("");
                    }}
                    style={{ backgroundColor: inputBg, color: inputTextColor }}
                    labelStyle={{ color: labelColor }}
                    required={true}
                />
                <FormInput
                    label="Email / Телефон / Telegram"
                    type="text"
                    placeholder="КОНТАКТ ДЛЯ СВЯЗИ"
                    value={contact}
                    onChange={(e) => {
                        setContact(e.target.value);
                        if (validationError) setValidationError("");
                    }}
                    style={{ backgroundColor: inputBg, color: inputTextColor }}
                    labelStyle={{ color: labelColor }}
                    required={true}
                />
            </div>
            <FormTextarea
                label="Задача (необязательно)"
                rows={3}
                placeholder="КРАТКО О ПРОЕКТЕ..."
                value={task}
                onChange={(e) => setTask(e.target.value)}
                style={{ backgroundColor: inputBg, color: inputTextColor }}
                labelStyle={{ color: labelColor }}
            />
            <div className="form-submit-wrapper">
                <motion.div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {validationError && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                color: "var(--primary-pink)",
                                marginBottom: "1rem",
                                textAlign: "center",
                                fontFamily: "var(--font-pixel)",
                                fontSize: "10px",
                                textTransform: "uppercase"
                            }}
                        >
                            {validationError}
                        </motion.p>
                    )}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="primary"
                        className="footer-submit-btn"
                        style={{ backgroundColor: btnBg }}
                    >
                        {isSubmitting ? "ОТПРАВКА..." : submitStatus === "success" ? "ОТПРАВЛЕНО!" : "ОСТАВИТЬ ЗАЯВКУ"}
                    </Button>
                    {submitStatus === "error" && (
                        <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
                            Произошла ошибка при отправке. Пожалуйста, попробуйте позже.
                        </p>
                    )}
                </motion.div>
            </div>
        </form>
    );
};

export default RequestForm;
