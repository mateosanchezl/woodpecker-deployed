"use client";

import type { PropsWithChildren } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type MotionDivProps = PropsWithChildren<HTMLMotionProps<"div">>;
type MotionListItemProps = PropsWithChildren<HTMLMotionProps<"li">>;

export function MotionDiv({
  children,
  className,
  ...props
}: MotionDivProps) {
  return (
    <motion.div className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function MotionListItem({
  children,
  className,
  ...props
}: MotionListItemProps) {
  return (
    <motion.li className={className} {...props}>
      {children}
    </motion.li>
  );
}
