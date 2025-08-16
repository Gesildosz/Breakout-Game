"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useGame } from "@/contexts/game-context"
import { Crown, X, Zap, Coins, Target, Star } from "lucide-react"

export default function PrestigeModal() {
  const { state, dispatch } = useGame()

  if (!state.showPrestige) return null

  const prestigePoints = Math.floor(state.level / 10)
  const canPrestige = state.golds >= 5

  const handlePrestige = () => {
    if (canPrestige) {
      dispatch({ type: "PRESTIGE" })
      dispatch({ type: "SHOW_PRESTIGE", show: false })
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={() => dispatch({ type: "SHOW_PRESTIGE", show: false })}
      >
        <motion.div
          initial={{ scale: 0, y: 100 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: -100 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-8 rounded-2xl border-2 border-purple-400 shadow-2xl shadow-purple-400/30 max-w-lg mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Prestige
              </h2>
            </div>
            <button
              onClick={() => dispatch({ type: "SHOW_PRESTIGE", show: false })}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                Reset your progress to gain permanent bonuses and unlock new features!
              </p>

              <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-700/50 rounded-lg p-4 mb-4 border border-yellow-500/30">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-lg">Golds Required</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-yellow-300">{state.golds}/5</span>
                  <p className="text-sm text-yellow-200 mt-1">
                    Collect gold blocks every 20 levels to unlock prestige!
                  </p>
                </div>
              </div>

              <div className="bg-black/50 rounded-lg p-4 mb-6">
                <h3 className="text-xl font-bold text-purple-400 mb-3">You will gain:</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Prestige Points:</span>
                    <span className="text-yellow-400 font-bold">+{prestigePoints}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Damage Multiplier:</span>
                    <span className="text-green-400 font-bold">×1.5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Coin Multiplier:</span>
                    <span className="text-blue-400 font-bold">×1.3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Speed Multiplier:</span>
                    <span className="text-purple-400 font-bold">×1.2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Click Power Multiplier:</span>
                    <span className="text-pink-400 font-bold">×1.4</span>
                  </div>
                </div>
              </div>

              {/* Current Multipliers */}
              {state.prestige.level > 0 && (
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold text-purple-400 mb-3">Current Bonuses:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <Target className="w-6 h-6 text-red-400 mx-auto mb-1" />
                      <div className="text-red-400 font-bold">×{state.prestige.multipliers.damage.toFixed(1)}</div>
                      <div className="text-xs text-gray-400">Damage</div>
                    </div>
                    <div className="text-center">
                      <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                      <div className="text-yellow-400 font-bold">×{state.prestige.multipliers.coins.toFixed(1)}</div>
                      <div className="text-xs text-gray-400">Coins</div>
                    </div>
                    <div className="text-center">
                      <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                      <div className="text-cyan-400 font-bold">×{state.prestige.multipliers.speed.toFixed(1)}</div>
                      <div className="text-xs text-gray-400">Speed</div>
                    </div>
                    <div className="text-center">
                      <Star className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                      <div className="text-pink-400 font-bold">×{state.prestige.multipliers.clickPower.toFixed(1)}</div>
                      <div className="text-xs text-gray-400">Click Power</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <motion.button
                onClick={() => dispatch({ type: "SHOW_PRESTIGE", show: false })}
                className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>

              <motion.button
                onClick={handlePrestige}
                disabled={!canPrestige}
                className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
                  canPrestige
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
                whileHover={canPrestige ? { scale: 1.02 } : {}}
                whileTap={canPrestige ? { scale: 0.98 } : {}}
              >
                {canPrestige ? "PRESTIGE NOW!" : `Need 5 Golds (${state.golds}/5)`}
              </motion.button>
            </div>
          </div>

          {/* Animated background effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full"
                animate={{
                  x: [0, 100, 0],
                  y: [0, -50, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + i * 0.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
