"use client"
import GameCanvas from "@/components/game-canvas"
import UpgradeShop from "@/components/upgrade-shop"
import HUD from "@/components/hud"
import AchievementModal from "@/components/achievement-modal"
import PrestigeModal from "@/components/prestige-modal"
import LevelRewardNotification from "@/components/level-reward-notification"
import SettingsModal from "@/components/settings-modal"
import MainMenu from "@/components/main-menu"
import { BallShop } from "@/components/ball-shop"
import PrestigeShop from "@/components/prestige-shop"
import { GameProvider, useGame } from "@/contexts/game-context"

function GameContent() {
  const { state } = useGame()

  if (state.showMainMenu) {
    return (
      <>
        <MainMenu />
        <SettingsModal />
      </>
    )
  }

  if (state.showUpgrades) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-900">
        <UpgradeShop />
      </div>
    )
  }

  if (state.showBallShop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-900">
        <BallShop />
      </div>
    )
  }

  if (state.showPrestigeShop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-900">
        <PrestigeShop />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-900 overflow-hidden relative">
      {/* Main Game Layout */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* HUD */}
        <HUD />

        <div className="flex-1 p-2 sm:p-4 flex items-center justify-center">
          <GameCanvas />
        </div>
      </div>

      {/* Modals */}
      <AchievementModal />
      <PrestigeModal />
      <SettingsModal />
      {state.showBallShop && <BallShop />}
      {state.showPrestigeShop && <PrestigeShop />}

      <LevelRewardNotification />
    </div>
  )
}

export default function IdleBreakoutGame() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}
