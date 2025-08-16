"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { useGame } from "@/contexts/game-context"
import { X, Volume2, ShoppingCart, Zap, Crown, Lock } from "lucide-react"

export default function SettingsModal() {
  const { state, dispatch } = useGame()

  if (!state.showSettings) return null

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = Number.parseInt(e.target.value)
    dispatch({ type: "SET_VOLUME", volume })
  }

  const handleUpgradesClick = () => {
    dispatch({ type: "SHOW_SETTINGS", show: false })
    dispatch({ type: "TOGGLE_UPGRADES" })
  }

  const handleBallShopClick = () => {
    dispatch({ type: "SHOW_SETTINGS", show: false })
    dispatch({ type: "TOGGLE_BALL_SHOP" })
  }

  const handlePrestigeShopClick = () => {
    dispatch({ type: "SHOW_SETTINGS", show: false })
    dispatch({ type: "TOGGLE_PRESTIGE_SHOP" })
  }

  const isInGame = !state.showMainMenu
  const hasFirstPrestige = state.prestige.level > 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => dispatch({ type: "SHOW_SETTINGS", show: false })}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <button
              onClick={() => dispatch({ type: "SHOW_SETTINGS", show: false })}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {isInGame && (
            <div className="space-y-4 mb-6">
              <button
                onClick={handleUpgradesClick}
                className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Upgrades</span>
              </button>

              <button
                onClick={handleBallShopClick}
                className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <Zap className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Bolas Especiais</span>
              </button>

              <button
                onClick={hasFirstPrestige ? handlePrestigeShopClick : undefined}
                className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-all duration-200 ${
                  hasFirstPrestige
                    ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 transform hover:scale-105 cursor-pointer"
                    : "bg-gray-700 cursor-not-allowed opacity-60"
                }`}
              >
                {hasFirstPrestige ? (
                  <Crown className="w-5 h-5 text-white" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <span className={`font-medium ${hasFirstPrestige ? "text-white" : "text-gray-400"}`}>PRESTÍGIO</span>
                {!hasFirstPrestige && <Lock className="w-4 h-4 text-gray-400 ml-auto" />}
              </button>

              {!hasFirstPrestige && (
                <div className="text-center p-3 bg-gray-800 rounded-lg border border-gray-600">
                  <p className="text-sm text-gray-300">🔒 Faça seu primeiro prestígio para desbloquear o PRESTÍGIO</p>
                </div>
              )}
            </div>
          )}

          {/* Volume Control */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium">Volume</span>
              <span className="text-cyan-400 font-bold ml-auto">{state.volume}%</span>
            </div>

            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={state.volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${state.volume}%, #374151 ${state.volume}%, #374151 100%)`,
                }}
              />
              <style jsx>{`
                .slider::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #06b6d4;
                  cursor: pointer;
                  border: 2px solid #0891b2;
                  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
                }
                .slider::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #06b6d4;
                  cursor: pointer;
                  border: 2px solid #0891b2;
                  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
                }
              `}</style>
            </div>

            <div className="flex justify-between text-sm text-gray-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
