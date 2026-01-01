import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import './loading.css'

export const LoadingPopup = ({ show, message = "Loading...", Loader, color = "#ffffff" }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="loading-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="loading-content">
                        {Loader && <Loader color={color} size={100} />}
                        <p style={{
                            color: '#ffffff',
                            background: 'linear-gradient(90deg, #0055ff, #00ff99)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold',
                        }}>
                            {message}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
