"use client"

import type React from "react"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useGame } from "@/contexts/game-context"
import { Zap, Target, Coins, Clock, Sparkles, MousePointer } from "lucide-react"

interface Upgrade {
  key: keyof typeof initialUpgrades
  name: string
  description: string
  icon: React.ReactNode
  baseCost: number
  multiplier: number
  color: string
}

const initialUpgrades = {
  ballSpeed: 0,
  ballPower: 0,
  clickPower: 0,
  coinMultiplier: 0,
  autoClicker: 0,
  offlineEarnings: 0,
}

const upgrades: Upgrade[] = [
  {
    key: "ballSpeed",
    name: "Ball Speed",
    description: "Increase ball movement speed",
    icon: <Zap className="w-5 h-5" />,
    baseCost: 25,
    multiplier: 1.5,
    color: "from-yellow-500 to-orange-500",
  },
  {
    key: "ballPower",
    name: "Ball Power",
    description: "Increase damage dealt to blocks",
    icon: <Target className="w-5 h-5" />,
    baseCost: 75,
    multiplier: 1.8,
    color: "from-red-500 to-pink-500",
  },
  {
    key: "clickPower",
    name: "Click Power",
    description: "Increase damage when clicking blocks manually",
    icon: <MousePointer className="w-5 h-5" />,
    baseCost: 40,
    multiplier: 1.6,
    color: "from-purple-500 to-violet-500",
  },
  {
    key: "coinMultiplier",
    name: "Coin Multiplier",
    description: "Multiply coins earned from blocks",
    icon: <Coins className="w-5 h-5" />,
    baseCost: 100,
    multiplier: 2.5,
    color: "from-green-500 to-emerald-500",
  },
  {
    key: "autoClicker",
    name: "Auto Clicker",
    description: "Automatically click for passive income",
    icon: <Clock className="w-5 h-5" />,
    baseCost: 200,
    multiplier: 3,
    color: "from-purple-500 to-indigo-500",
  },
  {
    key: "offlineEarnings",
    name: "Offline Earnings",
    description: "Earn coins while away from the game",
    icon: <Sparkles className="w-5 h-5" />,
    baseCost: 500,
    multiplier: 4,
    color: "from-pink-500 to-rose-500",
  },
]

export default function UpgradeShop() {
  const { state, dispatch } = useGame()

  const calculateCost = (upgrade: Upgrade) => {
    const level = state.upgrades[upgrade.key]
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, level))
  }

  const canAfford = (cost: number) => state.coins >= cost

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K"
    return Math.floor(num).toString()
  }

  const handleUpgrade = (upgrade: Upgrade) => {
    const cost = calculateCost(upgrade)
    if (canAfford(cost)) {
      dispatch({ type: "UPGRADE", upgrade: upgrade.key, cost })
    }
  }

  const handleBackClick = () => {
    dispatch({ type: "TOGGLE_UPGRADES" })
  }

  return (
    <div className="min-h-screen bg-black/60 backdrop-blur-md rounded-lg border border-cyan-400/30 p-4">
      <div className="mb-6 flex items-center space-x-4">
        <button onClick={handleBackClick} className="text-cyan-400 hover:text-cyan-300 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">Upgrades</h2>
          <div className="h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" />
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-cyan-400">
        {upgrades.map((upgrade, index) => {
          const cost = calculateCost(upgrade)
          const affordable = canAfford(cost)
          const level = state.upgrades[upgrade.key]

          return (
            <motion.div
              key={upgrade.key}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-lg border transition-all duration-300 ${
                affordable
                  ? "border-cyan-400/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:border-cyan-400 cursor-pointer"
                  : "border-gray-600/30 bg-gray-800/30 cursor-not-allowed opacity-60"
              }`}
              whileHover={affordable ? { scale: 1.02, y: -2 } : {}}
              whileTap={affordable ? { scale: 0.98 } : {}}
              onClick={() => handleUpgrade(upgrade)}
            >
              {/* Glow effect for affordable upgrades */}
              {affordable && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${upgrade.color} opacity-10 rounded-lg animate-pulse`}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${upgrade.color} text-white`}>{upgrade.icon}</div>
                    <div>
                      <h3 className="font-bold text-white">{upgrade.name}</h3>
                      <p className="text-sm text-gray-300">{upgrade.description}</p>
                    </div>
                  </div>

                  {level > 0 && (
                    <div className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded-full">Lv.{level}</div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-yellow-400 font-bold">{formatNumber(cost)} coins</div>

                  {affordable && (
                    <motion.div
                      className="text-green-400 text-sm"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      Click to buy!
                    </motion.div>
                  )}
                </div>

                {/* Progress indicator */}
                {level > 0 && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${upgrade.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(level * 10, 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Shop footer */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-center text-sm text-gray-400">
          <p>More upgrades unlock as you progress!</p>
        </div>
      </div>
    </div>
  )
}
