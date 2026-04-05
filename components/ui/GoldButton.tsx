"use client";

import { motion } from "framer-motion";

interface GoldButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function GoldButton({
  children,
  ...props
}: GoldButtonProps) {
  return (
    <motion.button
      type={props.type || "button"}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-4 py-3 text-white font-semibold shadow-md"
      {...props}
    >
      {children}
    </motion.button>
  );
}