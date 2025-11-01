import { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export const Card = ({ children, hover = true, className = '', ...props }: CardProps) => {
  const divProps = {
    ...props,
    className: `bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-200 ${className}`,
  };

  return (
    <motion.div
      {...(divProps as any)}
      whileHover={hover ? { y: -5 } : {}}
    >
      {children}
    </motion.div>
  );
};
