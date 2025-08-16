"use client"

import { motion } from "framer-motion"
import { useGame } from "@/contexts/game-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { Coins, Zap, Trophy, Settings, Star } from "lucide-react"

export default function HUD() {
  const { state, dispatch } = useGame()
  const isMobile = useIsMobile()

  // O HUD agora aparece tanto em mobile quanto em desktop

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K"
    return Math.floor(num).toString()
  }

  return (
    <div className="min-h-12 bg-black/80 backdrop-blur-md border-b border-cyan-400/30 p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left side - Game stats */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Coins */}
          <motion.div
            className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-2 py-1 rounded-md border border-yellow-500/30 text-xs"
            whileHover={{ scale: 1.05 }}
          >
            <Coins className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 font-bold">{formatNumber(state.coins)}</span>
          </motion.div>

          {/* Level */}
          <motion.div
            className="flex items-center space-x-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-2 py-1 rounded-md border border-cyan-500/30 text-xs"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 font-bold">Level {state.level}</span>
          </motion.div>

          {state.prestige.level === 0 && (
            <motion.div
              className="flex items-center space-x-1 bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 px-2 py-1 rounded-md border border-yellow-400/30 text-xs"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow:
                  state.golds > 0
                    ? [
                        "0 0 10px rgba(255, 215, 0, 0.3)",
                        "0 0 20px rgba(255, 215, 0, 0.5)",
                        "0 0 10px rgba(255, 215, 0, 0.3)",
                      ]
                    : undefined,
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Star className="w-3 h-3 text-yellow-300" />
              <span className="text-yellow-300 font-bold">{state.golds}/5 Golds</span>
            </motion.div>
          )}

          {/* Balls */}
          <motion.div
            className="flex items-center space-x-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-2 py-1 rounded-md border border-pink-500/30 text-xs"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
            <span className="text-pink-400 font-bold">{state.balls.length} Balls</span>
          </motion.div>

          {/* Prestige Level */}
          {state.prestige.level > 0 && (
            <motion.div
              className="flex items-center space-x-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 px-2 py-1 rounded-md border border-purple-500/30 text-xs"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400 font-bold">P{state.prestige.level}</span>
            </motion.div>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-1">
          {state.golds >= 5 && (
            <motion.button
              onClick={() => dispatch({ type: "SHOW_PRESTIGE", show: true })}
              className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-md font-bold text-white shadow-lg shadow-purple-500/25 transition-all text-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                  "0 0 30px rgba(168, 85, 247, 0.6)",
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              PRESTIGE
            </motion.button>
          )}

          {/* Settings */}
          <motion.button
            onClick={() => dispatch({ type: "SHOW_SETTINGS", show: true })}
            className="p-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-md border border-gray-600/30 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-4 h-4 text-gray-300" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
