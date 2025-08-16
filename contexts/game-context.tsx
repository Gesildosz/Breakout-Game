"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { saveGameProgress, type GameProgress } from "@/lib/supabase/client"

interface Ball {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  power: number
  type: "normal" | "plasma" | "sniper" | "poison"
  trail: Array<{ x: number; y: number; opacity: number }>
  targetBlockId?: string // For sniper balls
  poisonDamage?: number // For poison balls
  explosionRadius?: number // For plasma balls
}

interface Block {
  id: string
  x: number
  y: number
  health: number
  maxHealth: number
  type: "common" | "reinforced" | "resistant" | "armored" | "crystal" | "neon" | "boss" | "mystery" | "gold"
  value: number
  color: string
  poisonStacks?: number
  poisonDamagePerSecond?: number
}

interface SpecialBallType {
  id: string
  name: string
  description: string
  cost: number
  stock: number
  maxStock: number
  upgradeLevel: number
  maxUpgradeLevel: number
  purchased: number
}

interface PrestigeUpgrade {
  id: string
  name: string
  description: string
  cost: number
  currentLevel: number
  maxLevel: number
  effect: (level: number) => number
}

interface GameState {
  coins: number
  level: number
  golds: number
  balls: Ball[]
  blocks: Block[]
  specialBalls: {
    plasma: SpecialBallType
    sniper: SpecialBallType
    poison: SpecialBallType
  }
  upgrades: {
    ballCount: number
    ballSpeed: number
    ballPower: number
    clickPower: number
    coinMultiplier: number
    autoClicker: number
    offlineEarnings: number
  }
  prestige: {
    level: number
    points: number
    multipliers: {
      damage: number
      coins: number
      speed: number
      clickPower: number
    }
  }
  prestigeUpgrades: PrestigeUpgrade[]
  achievements: string[]
  gameRunning: boolean
  showAchievement: string | null
  showPrestige: boolean
  showSettings: boolean
  showUpgrades: boolean
  volume: number
  levelReward: {
    show: boolean
    amount: number
  }
  showMainMenu: boolean
  showBallShop: boolean
  showPrestigeShop: boolean
}

type GameAction =
  | { type: "ADD_COINS"; amount: number }
  | { type: "ADD_GOLD" }
  | { type: "UPGRADE"; upgrade: keyof GameState["upgrades"]; cost: number }
  | { type: "ADD_BALL"; ballType?: Ball["type"] }
  | { type: "UPDATE_BALLS"; balls: Ball[] }
  | { type: "UPDATE_BLOCKS"; blocks: Block[] }
  | { type: "NEXT_LEVEL" }
  | { type: "PRESTIGE" }
  | { type: "UNLOCK_ACHIEVEMENT"; achievement: string }
  | { type: "SHOW_ACHIEVEMENT"; achievement: string | null }
  | { type: "SHOW_PRESTIGE"; show: boolean }
  | { type: "TOGGLE_GAME" }
  | { type: "SHOW_LEVEL_REWARD"; amount: number }
  | { type: "HIDE_LEVEL_REWARD" }
  | { type: "SHOW_SETTINGS"; show: boolean }
  | { type: "TOGGLE_UPGRADES" }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "START_GAME" }
  | { type: "EXIT_GAME" }
  | { type: "RESET_GAME" }
  | { type: "TOGGLE_BALL_SHOP" }
  | { type: "BUY_SPECIAL_BALL"; ballType: "plasma" | "sniper" | "poison"; cost: number }
  | { type: "UPGRADE_SPECIAL_BALL"; ballType: "plasma" | "sniper" | "poison"; cost: number }
  | { type: "USE_SPECIAL_BALL"; ballType: "plasma" | "sniper" | "poison" }
  | { type: "TOGGLE_PRESTIGE_SHOP" }
  | { type: "BUY_PRESTIGE_UPGRADE"; upgradeId: string }

const initialState: GameState = {
  coins: 100, // Restored normal starting coins from 999999 to 100
  level: 1,
  golds: 0,
  balls: [],
  blocks: [],
  specialBalls: {
    plasma: {
      id: "plasma",
      name: "Bola de Plasma",
      description: "Explode em uma pequena área causando dano ao redor",
      cost: 500,
      stock: 0,
      maxStock: 10,
      upgradeLevel: 1,
      maxUpgradeLevel: 5,
      purchased: 0,
    },
    sniper: {
      id: "sniper",
      name: "Bola Sniper",
      description: "Segue o tijolo e volta diretamente para ele após bater na parede",
      cost: 750,
      stock: 0,
      maxStock: 8,
      upgradeLevel: 1,
      maxUpgradeLevel: 5,
      purchased: 0,
    },
    poison: {
      id: "poison",
      name: "Bola de Veneno",
      description: "Atravessa tijolos causando dano de veneno contínuo",
      cost: 1000,
      stock: 0,
      maxStock: 6,
      upgradeLevel: 1,
      maxUpgradeLevel: 5,
      purchased: 0,
    },
  },
  upgrades: {
    ballCount: 0,
    ballSpeed: 1,
    ballPower: 1,
    clickPower: 1,
    coinMultiplier: 1,
    autoClicker: 0,
    offlineEarnings: 0,
  },
  prestige: {
    level: 0,
    points: 0,
    multipliers: {
      damage: 1,
      coins: 1,
      speed: 1,
      clickPower: 1,
    },
  },
  prestigeUpgrades: [
    {
      id: "money_per_level",
      name: "Dinheiro por Level",
      description: "Aumenta o dinheiro ganho ao completar cada level",
      cost: 5,
      currentLevel: 0,
      maxLevel: 10,
      effect: (level) => 100 + level * 50, // +50 coins per level per upgrade level
    },
    {
      id: "laser_power",
      name: "Poder do Laser",
      description: "Adiciona um laser que destrói blocos automaticamente",
      cost: 10,
      currentLevel: 0,
      maxLevel: 5,
      effect: (level) => level * 2, // Laser damage multiplier
    },
    {
      id: "gold_multiplier",
      name: "Multiplicador de Golds",
      description: "Aumenta a chance de ganhar golds dos blocos dourados",
      cost: 15,
      currentLevel: 0,
      maxLevel: 8,
      effect: (level) => 1 + level * 0.5, // 1.5x, 2x, 2.5x, etc.
    },
    {
      id: "ball_damage",
      name: "Dano das Bolas",
      description: "Aumenta permanentemente o dano de todas as bolas",
      cost: 8,
      currentLevel: 0,
      maxLevel: 15,
      effect: (level) => 1 + level * 0.3, // 1.3x, 1.6x, 1.9x, etc.
    },
  ],
  achievements: [],
  gameRunning: true,
  showAchievement: null,
  showPrestige: false,
  showSettings: false,
  showUpgrades: false,
  volume: 50,
  levelReward: {
    show: false,
    amount: 0,
  },
  showMainMenu: true,
  showBallShop: false,
  showPrestigeShop: false,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ADD_COINS":
      return {
        ...state,
        coins: state.coins + action.amount * state.upgrades.coinMultiplier * state.prestige.multipliers.coins,
      }

    case "ADD_GOLD":
      return {
        ...state,
        golds: state.golds + 1,
      }

    case "UPGRADE":
      return {
        ...state,
        coins: state.coins - action.cost, // Uncommented coin deduction for upgrades
        upgrades: {
          ...state.upgrades,
          [action.upgrade]: state.upgrades[action.upgrade] + 1,
        },
      }

    case "ADD_BALL":
      console.log("[v0] Adding new ball to game, type:", action.ballType || "normal")
      const ballType = action.ballType || "normal"

      const newBall: Ball = {
        id: Math.random().toString(36),
        x: 400,
        y: 500,
        vx: (Math.random() - 0.5) * 4,
        vy: -3,
        power: state.upgrades.ballPower * state.prestige.multipliers.damage,
        type: ballType,
        trail: [],
      }

      // Add special properties based on ball type
      if (ballType === "plasma") {
        newBall.explosionRadius = 50 + state.specialBalls.plasma.upgradeLevel * 10
      } else if (ballType === "poison") {
        newBall.poisonDamage = 2 + state.specialBalls.poison.upgradeLevel * 1
      }

      return {
        ...state,
        balls: [...state.balls, newBall],
      }

    case "BUY_SPECIAL_BALL":
      return {
        ...state,
        coins: state.coins - action.cost, // Uncommented coin deduction for special ball purchases
        specialBalls: {
          ...state.specialBalls,
          [action.ballType]: {
            ...state.specialBalls[action.ballType],
            stock: state.specialBalls[action.ballType].stock + 1,
            purchased: state.specialBalls[action.ballType].purchased + 1,
          },
        },
      }

    case "USE_SPECIAL_BALL":
      if (state.specialBalls[action.ballType].stock > 0) {
        const newBall: Ball = {
          id: Math.random().toString(36),
          x: 400,
          y: 500,
          vx: (Math.random() - 0.5) * 4,
          vy: -3,
          power: state.upgrades.ballPower * state.prestige.multipliers.damage,
          type: action.ballType,
          trail: [],
        }

        // Add special properties based on ball type
        if (action.ballType === "plasma") {
          newBall.explosionRadius = 50 + state.specialBalls.plasma.upgradeLevel * 10
        } else if (action.ballType === "poison") {
          newBall.poisonDamage = 2 + state.specialBalls.poison.upgradeLevel * 1
        }

        console.log("[v0] Using special ball from stock, type:", action.ballType)

        return {
          ...state,
          balls: [...state.balls, newBall],
          specialBalls: {
            ...state.specialBalls,
            [action.ballType]: {
              ...state.specialBalls[action.ballType],
              stock: state.specialBalls[action.ballType].stock - 1,
            },
          },
        }
      }
      return state

    case "UPDATE_BALLS":
      return { ...state, balls: action.balls }

    case "UPDATE_BLOCKS":
      return { ...state, blocks: action.blocks }

    case "NEXT_LEVEL":
      const baseReward = 100
      const levelMultiplier = Math.pow(1.05, state.level - 1)
      const rewardAmount = Math.floor(baseReward * levelMultiplier)

      console.log("[v0] Level completed! Reward:", rewardAmount, "coins")

      return {
        ...state,
        level: state.level + 1,
        coins: state.coins + rewardAmount,
        levelReward: {
          show: true,
          amount: rewardAmount,
        },
      }

    case "PRESTIGE":
      console.log("[v0] Prestiging - resetting to level 1")
      return {
        ...state,
        coins: 100,
        level: 1,
        balls: [],
        blocks: [],
        upgrades: initialState.upgrades,
        prestige: {
          ...state.prestige,
          level: state.prestige.level + 1,
          points: state.prestige.points + Math.floor(state.level / 10),
          multipliers: {
            damage: state.prestige.multipliers.damage * 1.5,
            coins: state.prestige.multipliers.coins * 1.3,
            speed: state.prestige.multipliers.speed * 1.2,
            clickPower: state.prestige.multipliers.clickPower * 1.4,
          },
        },
        levelReward: {
          show: false,
          amount: 0,
        },
      }

    case "UNLOCK_ACHIEVEMENT":
      if (!state.achievements.includes(action.achievement)) {
        return {
          ...state,
          achievements: [...state.achievements, action.achievement],
          showAchievement: action.achievement,
        }
      }
      return state

    case "SHOW_ACHIEVEMENT":
      return { ...state, showAchievement: action.achievement }

    case "SHOW_PRESTIGE":
      return { ...state, showPrestige: action.show }

    case "TOGGLE_GAME":
      return { ...state, gameRunning: !state.gameRunning }

    case "SHOW_LEVEL_REWARD":
      return {
        ...state,
        levelReward: {
          show: true,
          amount: action.amount,
        },
      }

    case "HIDE_LEVEL_REWARD":
      return {
        ...state,
        levelReward: {
          show: false,
          amount: 0,
        },
      }

    case "SHOW_SETTINGS":
      return { ...state, showSettings: action.show }

    case "TOGGLE_UPGRADES":
      return { ...state, showUpgrades: !state.showUpgrades }

    case "SET_VOLUME":
      return { ...state, volume: Math.max(0, Math.min(100, action.volume)) }

    case "START_GAME":
      return { ...state, showMainMenu: false, gameRunning: true }

    case "EXIT_GAME":
      return { ...state, showMainMenu: true, gameRunning: false }

    case "RESET_GAME":
      console.log("[v0] Resetting game to initial state")
      return {
        ...initialState,
        volume: state.volume,
        showMainMenu: true,
      }

    case "TOGGLE_BALL_SHOP":
      return { ...state, showBallShop: !state.showBallShop }

    case "TOGGLE_PRESTIGE_SHOP":
      return { ...state, showPrestigeShop: !state.showPrestigeShop }

    case "BUY_PRESTIGE_UPGRADE":
      const upgrade = state.prestigeUpgrades.find((u) => u.id === action.upgradeId)
      if (!upgrade || upgrade.currentLevel >= upgrade.maxLevel) {
        return state
      }

      const updatedUpgrades = state.prestigeUpgrades.map((u) =>
        u.id === action.upgradeId ? { ...u, currentLevel: u.currentLevel + 1, cost: Math.floor(u.cost * 1.5) } : u,
      )

      console.log("[v0] Bought prestige upgrade:", action.upgradeId, "New level:", upgrade.currentLevel + 1)

      return {
        ...state,
        golds: state.golds - upgrade.cost,
        prestigeUpgrades: updatedUpgrades,
      }

    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
} | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  useEffect(() => {
    const saveGame = async () => {
      const saveData: GameProgress = {
        level: state.level,
        coins: state.coins,
        balls: state.balls.length,
        upgrades: {
          ballSpeed: state.upgrades.ballSpeed,
          ballPower: state.upgrades.ballPower,
          coinMultiplier: state.upgrades.coinMultiplier,
        },
        prestige: state.prestige,
        settings: {
          volume: state.volume,
        },
      }

      await saveGameProgress(saveData)
      console.log("[v0] Game saved to Supabase - Level:", state.level, "Coins:", state.coins)
    }

    const interval = setInterval(saveGame, 10000)
    return () => clearInterval(interval)
  }, [state])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within GameProvider")
  }
  return context
}
