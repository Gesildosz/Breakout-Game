"use client"

import { useEffect } from "react"
import { useGame } from "@/contexts/game-context"

export default function LevelRewardNotification() {
  const { state, dispatch } = useGame()

  useEffect(() => {
    if (state.levelReward.show) {
      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        dispatch({ type: "HIDE_LEVEL_REWARD" })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [state.levelReward.show, dispatch])

  if (!state.levelReward.show) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg shadow-2xl border-2 border-yellow-300">
        <div className="flex items-center gap-2">
          <div className="text-2xl">🎉</div>
          <div className="font-bold text-lg">Level Completed!</div>
        </div>
        <div className="text-center mt-1">
          <span className="text-xl font-bold">+{state.levelReward.amount} Coins</span>
        </div>
      </div>
    </div>
  )
}
