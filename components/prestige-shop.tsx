"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useGame } from "@/contexts/game-context"
import { X, Crown, Zap, DollarSign, Target, Gem } from "lucide-react"

export default function PrestigeShop() {
  const { state, dispatch } = useGame()

  if (!state.showPrestigeShop) return null

  const getUpgradeIcon = (upgradeId: string) => {
    switch (upgradeId) {
      case "money_per_level":
        return DollarSign
      case "laser_power":
        return Zap
      case "gold_multiplier":
        return Gem
      case "ball_damage":
        return Target
      default:
        return Crown
    }
  }

  const handleBuyUpgrade = (upgradeId: string) => {
    dispatch({ type: "BUY_PRESTIGE_UPGRADE", upgradeId })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => dispatch({ type: "TOGGLE_PRESTIGE_SHOP" })}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-yellow-500/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                PRESTÍGIO
              </h2>
            </div>
            <button
              onClick={() => dispatch({ type: "TOGGLE_PRESTIGE_SHOP" })}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Golds Display */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Gem className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{state.golds} Golds</span>
            </div>
          </div>

          {/* Upgrades Grid */}
          <div className="grid gap-4">
            {state.prestigeUpgrades.map((upgrade) => {
              const Icon = getUpgradeIcon(upgrade.id)
              const canAfford = state.golds >= upgrade.cost
              const isMaxLevel = upgrade.currentLevel >= upgrade.maxLevel

              return (
                <motion.div
                  key={upgrade.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    isMaxLevel
                      ? "bg-green-900/20 border-green-500/30"
                      : canAfford
                        ? "bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30 hover:border-yellow-400/50"
                        : "bg-gray-800/50 border-gray-600/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${isMaxLevel ? "bg-green-600" : "bg-yellow-600"}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{upgrade.name}</h3>
                        <p className="text-gray-300 text-sm mb-2">{upgrade.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-cyan-400">
                            Level: {upgrade.currentLevel}/{upgrade.maxLevel}
                          </span>
                          <span className="text-green-400">
                            Efeito: +{upgrade.effect(upgrade.currentLevel + 1) - upgrade.effect(upgrade.currentLevel)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {isMaxLevel ? (
                        <div className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">MAX</div>
                      ) : (
                        <button
                          onClick={() => handleBuyUpgrade(upgrade.id)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                            canAfford
                              ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white transform hover:scale-105"
                              : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {upgrade.cost} Golds
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm text-center">
              💡 Dica: Golds são obtidos quebrando blocos dourados especiais. Use-os sabiamente para melhorias
              permanentes!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
