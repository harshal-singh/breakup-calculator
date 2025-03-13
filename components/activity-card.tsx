"use client"

import { motion } from "framer-motion"

interface ActivityCardProps {
  label: string
  description: string
  selected: boolean
  onClick: () => void
}

export function ActivityCard({ label, selected, onClick }: ActivityCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden p-4 rounded-lg border cursor-pointer transition-all duration-300
        ${selected 
          ? 'bg-gradient-to-br from-purple-100 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-400 dark:border-purple-700 shadow-lg' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
        }
      `}
    >
      {/* Selection indicator */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500"
        />
      )}

      {/* Content */}
      <div className="space-y-2">
        <h3 className={`font-medium transition-colors duration-300 ${selected ? 'text-purple-700 dark:text-purple-300' : ''}`}>
          {label}
        </h3>
        {/* <p className={`text-sm transition-colors duration-300 ${
          selected 
            ? 'text-purple-600 dark:text-purple-400' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {description}
        </p> */}
      </div>

      {/* Selection overlay animation */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"
        />
      )}
    </motion.div>
  )
}
