import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VARIANTS = {
    success: {
        border: "#10b981",
        bg: "#ecfdf5",
        icon: "#10b981",
        title: "#065f46",
        message: "#047857"
    },
    warning: {
        border: "#f59e0b",
        bg: "#fffbeb",
        icon: "#f59e0b",
        title: "#92400e",
        message: "#b45309"
    },
    error: {
        border: "#ef4444",
        bg: "#fef2f2",
        icon: "#ef4444",
        title: "#7f1d1d",
        message: "#991b1b"
    },
    processing: {
        border: "#2563eb",
        bg: "#eff6ff",
        icon: "#2563eb",
        title: "#1e3a8a",
        message: "#1d4ed8"
    }
};

export function PopupNotification({
    show,
    onClose,
    title,
    message,
    icon = "info",
    variant = "success",
    duration = 3000
}) {
    useEffect(() => {
        if (!show) return;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [show, duration, onClose]);

    const styles = VARIANTS[variant] || VARIANTS.success;


    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{
                        position: "fixed",
                        bottom: "24px",
                        right: "24px",
                        maxWidth: "380px",
                        width: "100%",
                        background: styles.bg,
                        border: `2px solid ${styles.border}`,
                        borderRadius: "14px",
                        padding: "16px 18px",
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                        zIndex: 9999
                    }}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{
                            fontSize: 26,
                            color: styles.icon,
                            alignSelf: "center",
                        }}
                    >
                        {icon}
                    </span>

                    <div>
                        <div
                            style={{
                                fontWeight: 600,
                                fontSize: "16px",
                                color: styles.title,
                                marginBottom: "4px"
                            }}
                        >
                            {title}
                        </div>
                        <div
                            style={{
                                fontSize: "14px",
                                color: styles.message,
                                lineHeight: 1.4,
                                textShadow: "0 1px 0 rgba(255,255,255,0.6)"
                            }}
                        >
                            {message}
                        </div>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
