"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useGame } from "@/contexts/game-context"
import { Trophy, X } from "lucide-react"

const achievements = {
  "first-break": {
    name: "First Break",
    description: "Break your first block",
    icon: "🎯",
    rarity: "common",
  },
  "speed-demon": {
    name: "Speed Demon",
    description: "Reach maximum ball speed",
    icon: "⚡",
    rarity: "rare",
  },
  millionaire: {
    name: "Millionaire",
    description: "Accumulate 1,000,000 coins",
    icon: "💰",
    rarity: "epic",
  },
  "prestige-master": {
    name: "Prestige Master",
    description: "Complete 10 prestiges",
    icon: "👑",
    rarity: "legendary",
  },
}

export default function AchievementModal() {
  const { state, dispatch } = useGame()

  if (!state.showAchievement) return null

  const achievement = achievements[state.showAchievement as keyof typeof achievements]
  if (!achievement) return null

  const rarityColors = {
    common: "from-gray-500 to-gray-600",
    rare: "from-blue-500 to-blue-600",
    epic: "from-purple-500 to-purple-600",
    legendary: "from-yellow-500 to-orange-500",
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={() => dispatch({ type: "SHOW_ACHIEVEMENT", achievement: null })}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border-2 border-yellow-400 shadow-2xl shadow-yellow-400/20 max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold text-yellow-400">Achievement!</h2>
            </div>
            <button
              onClick={() => dispatch({ type: "SHOW_ACHIEVEMENT", achievement: null })}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Achievement Content */}
          <div className="text-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-6xl mb-4"
            >
              {achievement.icon}
            </motion.div>

            <h3 className="text-2xl font-bold text-white mb-2">{achievement.name}</h3>

            <p className="text-gray-300 mb-4">{achievement.description}</p>

            <div
              className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white font-bold text-sm uppercase tracking-wider`}
            >
              {achievement.rarity}
            </div>
          </div>

          {/* Celebration Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 200}%`,
                  y: `${50 + (Math.random() - 0.5) * 200}%`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
