"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useGame } from "@/contexts/game-context"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface PositionHistory {
  x: number
  y: number
  timestamp: number
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const levelCompletionRef = useRef<boolean>(false)
  const ballPositionHistoryRef = useRef<Map<string, PositionHistory[]>>(new Map())
  const ballDirectionCooldownRef = useRef<Map<string, number>>(new Map())
  const audioContextRef = useRef<AudioContext | null>(null)
  const { state, dispatch } = useGame()

  const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 500 })

  const stateRef = useRef(state)
  stateRef.current = state

  const updateCanvasDimensions = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const containerWidth = container.clientWidth - 32
      const containerHeight = container.clientHeight - 32

      const isDesktop = window.innerWidth >= 1024
      const aspectRatio = isDesktop ? 4 / 5 : 7 / 8

      let width, height

      if (isDesktop) {
        // Para desktop (1920x1080), usar dimensões maiores
        width = Math.min(containerWidth, 600)
        height = Math.min(containerHeight, 750)

        // Manter proporção
        if (width / height > aspectRatio) {
          width = height * aspectRatio
        } else {
          height = width / aspectRatio
        }
      } else {
        // Para mobile, manter dimensões menores
        width = Math.min(containerWidth, 400)
        height = width / aspectRatio

        if (height > containerHeight) {
          height = Math.min(containerHeight, 500)
          width = height * aspectRatio
        }
      }

      width = Math.max(width, isDesktop ? 400 : 280)
      height = Math.max(height, isDesktop ? 500 : 350)

      setCanvasDimensions({ width: Math.floor(width), height: Math.floor(height) })
    }
  }, [])

  useEffect(() => {
    updateCanvasDimensions()

    const handleResize = () => {
      updateCanvasDimensions()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [updateCanvasDimensions])

  const getClickDamage = useCallback(() => {
    return Math.max(
      1,
      Math.floor(stateRef.current.upgrades.clickPower * stateRef.current.prestige.multipliers.clickPower),
    )
  }, [])

  const detectBallLoop = useCallback((ballId: string, x: number, y: number, vx: number, vy: number) => {
    const history = ballPositionHistoryRef.current.get(ballId) || []
    const currentTime = Date.now()

    const lastDirectionChange = ballDirectionCooldownRef.current.get(ballId) || 0
    if (currentTime - lastDirectionChange < 1500) {
      return false
    }

    history.push({ x, y, timestamp: currentTime })
    const filteredHistory = history.filter((pos) => currentTime - pos.timestamp < 3000)

    const canvas = canvasRef.current
    if (canvas) {
      const isNearCorner = (x < 50 || x > canvas.width - 50) && (y < 50 || y > canvas.height - 50)
      const isNearEdge = x < 30 || x > canvas.width - 30 || y < 30 || y > canvas.height - 30

      if (isNearCorner || isNearEdge) {
        if (filteredHistory.length >= 5) {
          let similarPositions = 0
          const tolerance = isNearCorner ? 25 : 15

          for (let i = filteredHistory.length - 1; i >= Math.max(0, filteredHistory.length - 8); i--) {
            const pos = filteredHistory[i]
            const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)

            if (distance < tolerance) {
              similarPositions++
            }
          }

          if (similarPositions >= 4) {
            console.log(
              "[v0] Ball loop detected in corner/edge for ball",
              ballId,
              "at position",
              x,
              y,
              "similar positions:",
              similarPositions,
            )
            ballPositionHistoryRef.current.set(ballId, [])
            ballDirectionCooldownRef.current.set(ballId, currentTime)
            return true
          }
        }
      }
    }

    if (filteredHistory.length >= 6) {
      let similarPositions = 0
      const tolerance = 12

      for (let i = filteredHistory.length - 1; i >= Math.max(0, filteredHistory.length - 10); i--) {
        const pos = filteredHistory[i]
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)

        if (distance < tolerance) {
          similarPositions++
        }
      }

      if (similarPositions >= 5) {
        console.log(
          "[v0] Ball loop detected for ball",
          ballId,
          "at position",
          x,
          y,
          "similar positions:",
          similarPositions,
        )
        ballPositionHistoryRef.current.set(ballId, [])
        ballDirectionCooldownRef.current.set(ballId, currentTime)
        return true
      }
    }

    ballPositionHistoryRef.current.set(ballId, filteredHistory.slice(-15))
    return false
  }, [])

  const randomizeBallDirection = useCallback((ball: any) => {
    const currentAngle = Math.atan2(ball.vy, ball.vx)
    let newAngle

    do {
      newAngle = Math.random() * Math.PI * 2
    } while (Math.abs(newAngle - currentAngle) < Math.PI / 3)

    const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2)

    ball.vx = Math.cos(newAngle) * speed
    ball.vy = Math.sin(newAngle) * speed

    console.log("[v0] Randomized ball direction:", ball.vx, ball.vy)

    addParticles(ball.x, ball.y, "#FF00FF", 8)
  }, [])

  const completeLevel = useCallback(() => {
    if (levelCompletionRef.current) {
      console.log("[v0] Level completion already in progress, skipping")
      return
    }

    levelCompletionRef.current = true
    console.log("[v0] Level completed, advancing from level", stateRef.current.level, "to", stateRef.current.level + 1)

    dispatch({ type: "NEXT_LEVEL" })

    setTimeout(() => {
      levelCompletionRef.current = false
    }, 100)
  }, [dispatch])

  const handleCanvasInteraction = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const clickX = clientX - rect.left
      const clickY = clientY - rect.top

      const currentState = stateRef.current
      const updatedBlocks = [...currentState.blocks]
      let coinsEarned = 0
      let goldCollected = false
      let blockHit = false

      const blockWidth = Math.max(30, Math.min(45, canvas.width / 10))
      const blockHeight = Math.max(10, Math.min(15, canvas.height / 35))

      const hitboxMargin = 8

      updatedBlocks.forEach((block, index) => {
        const currentBlockWidth = block.isSpecialGold ? block.width : blockWidth
        const currentBlockHeight = block.isSpecialGold ? block.height : blockHeight

        if (
          clickX >= block.x - currentBlockWidth / 2 - hitboxMargin &&
          clickX <= block.x + currentBlockWidth / 2 + hitboxMargin &&
          clickY >= block.y - currentBlockHeight / 2 - hitboxMargin &&
          clickY <= block.y + currentBlockHeight / 2 + hitboxMargin
        ) {
          blockHit = true
          const clickDamage = getClickDamage()

          block.health -= clickDamage

          addParticles(clickX, clickY, "#FFD700", 12)
          addParticles(clickX, clickY, "#FFFFFF", 8)

          if (block.health <= 0) {
            coinsEarned += block.value
            if (block.type === "gold" || block.isSpecialGold) {
              goldCollected = true
              addParticles(block.x, block.y, "#FFD700", block.isSpecialGold ? 50 : 30)
            } else {
              addParticles(block.x, block.y, "#FFD700", 15)
            }

            addParticles(block.x, block.y, block.color, block.isSpecialGold ? 25 : 15)
            updatedBlocks.splice(index, 1)
          }
        }
      })

      if (blockHit) {
        dispatch({ type: "UPDATE_BLOCKS", blocks: updatedBlocks })

        if (coinsEarned > 0) {
          dispatch({ type: "ADD_COINS", amount: coinsEarned })
        }

        if (goldCollected) {
          dispatch({ type: "ADD_GOLD" })
        }

        if (updatedBlocks.length === 0) {
          completeLevel()
        }
      }
    },
    [getClickDamage, dispatch, completeLevel],
  )

  const handleCanvasClick = useCallback(
    (event: MouseEvent) => {
      handleCanvasInteraction(event.clientX, event.clientY)
    },
    [handleCanvasInteraction],
  )

  const handleCanvasTouch = useCallback(
    (event: TouchEvent) => {
      event.preventDefault()
      if (event.touches.length > 0) {
        const touch = event.touches[0]
        handleCanvasInteraction(touch.clientX, touch.clientY)
      }
    },
    [handleCanvasInteraction],
  )

  const createBlock = useCallback((x: number, y: number, type: string, isSpecialGold = false) => {
    const blockTypes = {
      // Básicos (1-10)
      common: { health: 1, value: 1, color: "#0080FF" },
      reinforced: { health: 3, value: 3, color: "#00FF00" },
      resistant: { health: 5, value: 8, color: "#FF0000" },
      armored: { health: 10, value: 20, color: "#808080" },
      crystal: { health: 7, value: 15, color: "#FF00FF" },
      neon: { health: 4, value: 12, color: "#00FFFF" },
      gold: { health: 15, value: 50, color: "#FFD700" },
      specialGold: { health: 50, value: 100, color: "#FFD700" },
      diamond: { health: 25, value: 75, color: "#B9F2FF" },
      ruby: { health: 20, value: 60, color: "#E0115F" },

      // Metálicos (11-20)
      copper: { health: 8, value: 18, color: "#B87333" },
      bronze: { health: 12, value: 25, color: "#CD7F32" },
      silver: { health: 18, value: 45, color: "#C0C0C0" },
      platinum: { health: 30, value: 90, color: "#E5E4E2" },
      titanium: { health: 35, value: 105, color: "#878681" },
      steel: { health: 22, value: 55, color: "#71797E" },
      iron: { health: 15, value: 35, color: "#A19D94" },
      aluminum: { health: 6, value: 14, color: "#A8A8A8" },
      zinc: { health: 9, value: 20, color: "#7A7A7A" },
      lead: { health: 13, value: 28, color: "#2F4F4F" },

      // Elementais (21-30)
      fire: { health: 16, value: 40, color: "#FF4500" },
      ice: { health: 14, value: 35, color: "#87CEEB" },
      earth: { health: 24, value: 65, color: "#8B4513" },
      wind: { health: 11, value: 30, color: "#E6E6FA" },
      lightning: { health: 19, value: 50, color: "#FFFF00" },
      water: { health: 13, value: 32, color: "#0077BE" },
      shadow: { health: 21, value: 58, color: "#2F2F2F" },
      light: { health: 17, value: 42, color: "#FFFACD" },
      poison: { health: 15, value: 38, color: "#32CD32" },
      plasma: { health: 28, value: 80, color: "#FF69B4" },

      // Cores Vibrantes (31-40)
      crimson: { health: 18, value: 45, color: "#DC143C" },
      azure: { health: 16, value: 40, color: "#007FFF" },
      emerald: { health: 22, value: 60, color: "#50C878" },
      violet: { health: 20, value: 52, color: "#8A2BE2" },
      orange: { health: 14, value: 36, color: "#FF8C00" },
      turquoise: { health: 17, value: 43, color: "#40E0D0" },
      coral: { health: 15, value: 38, color: "#FF7F50" },
      lime: { health: 12, value: 30, color: "#32CD32" },
      indigo: { health: 19, value: 48, color: "#4B0082" },
      magenta: { health: 16, value: 41, color: "#FF00FF" },

      // Pastéis (41-50)
      pastelPink: { health: 10, value: 25, color: "#FFB6C1" },
      pastelBlue: { health: 11, value: 28, color: "#B0E0E6" },
      pastelGreen: { health: 12, value: 30, color: "#98FB98" },
      pastelYellow: { health: 9, value: 22, color: "#FFFFE0" },
      pastelPurple: { health: 13, value: 32, color: "#DDA0DD" },
      pastelOrange: { health: 10, value: 26, color: "#FFDAB9" },
      pastelRed: { health: 14, value: 35, color: "#FFA07A" },
      pastelCyan: { health: 11, value: 27, color: "#E0FFFF" },
      pastelLavender: { health: 12, value: 29, color: "#E6E6FA" },
      pastelMint: { health: 10, value: 24, color: "#F0FFFF" },

      // Neon (51-60)
      neonPink: { health: 15, value: 38, color: "#FF1493" },
      neonGreen: { health: 16, value: 40, color: "#39FF14" },
      neonBlue: { health: 17, value: 42, color: "#1B03A3" },
      neonYellow: { health: 14, value: 36, color: "#FFFF33" },
      neonOrange: { health: 15, value: 38, color: "#FF6600" },
      neonPurple: { health: 18, value: 45, color: "#BF00FF" },
      neonRed: { health: 16, value: 40, color: "#FF073A" },
      neonCyan: { health: 17, value: 43, color: "#00FFFF" },
      neonLime: { health: 15, value: 37, color: "#CCFF00" },
      neonMagenta: { health: 16, value: 41, color: "#FF00CC" },

      // Escuros (61-70)
      darkRed: { health: 25, value: 70, color: "#8B0000" },
      darkBlue: { health: 26, value: 72, color: "#00008B" },
      darkGreen: { health: 24, value: 68, color: "#006400" },
      darkPurple: { health: 27, value: 75, color: "#301934" },
      darkOrange: { health: 23, value: 65, color: "#FF8C00" },
      darkCyan: { health: 25, value: 70, color: "#008B8B" },
      darkYellow: { health: 22, value: 62, color: "#B8860B" },
      darkPink: { health: 24, value: 67, color: "#C71585" },
      darkGray: { health: 28, value: 78, color: "#2F2F2F" },
      darkBrown: { health: 26, value: 73, color: "#654321" },

      // Cristais (71-80)
      quartzCrystal: { health: 30, value: 85, color: "#E6E6FA" },
      amethystCrystal: { health: 32, value: 90, color: "#9966CC" },
      topazCrystal: { health: 28, value: 80, color: "#FFC87C" },
      sapphireCrystal: { health: 35, value: 100, color: "#0F52BA" },
      emeraldCrystal: { health: 33, value: 95, color: "#50C878" },
      rubyCrystal: { health: 34, value: 98, color: "#E0115F" },
      diamondCrystal: { health: 40, value: 120, color: "#B9F2FF" },
      opalCrystal: { health: 29, value: 82, color: "#A8C3BC" },
      peridotCrystal: { health: 27, value: 78, color: "#E6E200" },
      garnetCrystal: { health: 31, value: 88, color: "#733635" },

      // Especiais (81-90)
      rainbow: { health: 45, value: 150, color: "#FF69B4" },
      holographic: { health: 38, value: 125, color: "#C0C0C0" },
      cosmic: { health: 50, value: 180, color: "#483D8B" },
      ethereal: { health: 42, value: 140, color: "#F0F8FF" },
      mystic: { health: 46, value: 160, color: "#8A2BE2" },
      ancient: { health: 55, value: 200, color: "#8B4513" },
      divine: { health: 60, value: 220, color: "#FFD700" },
      infernal: { health: 48, value: 170, color: "#DC143C" },
      celestial: { health: 52, value: 190, color: "#87CEEB" },
      void: { health: 65, value: 250, color: "#000000" },

      // Lendários (91-100)
      legendary1: { health: 70, value: 300, color: "#FF6347" },
      legendary2: { health: 72, value: 310, color: "#4169E1" },
      legendary3: { health: 75, value: 320, color: "#32CD32" },
      legendary4: { health: 78, value: 330, color: "#FF1493" },
      legendary5: { health: 80, value: 340, color: "#FF8C00" },
      legendary6: { health: 82, value: 350, color: "#9370DB" },
      legendary7: { health: 85, value: 360, color: "#00CED1" },
      legendary8: { health: 88, value: 370, color: "#FFD700" },
      legendary9: { health: 90, value: 380, color: "#DC143C" },
      legendary10: { health: 95, value: 400, color: "#8A2BE2" },

      // Míticos (101+)
      mythic1: { health: 100, value: 450, color: "#FF0000" },
      mythic2: { health: 105, value: 475, color: "#0000FF" },
      mythic3: { health: 110, value: 500, color: "#00FF00" },
      mythic4: { health: 115, value: 525, color: "#FFFF00" },
      mythic5: { health: 120, value: 550, color: "#FF00FF" },
      mythic6: { health: 125, value: 575, color: "#00FFFF" },
      mythic7: { health: 130, value: 600, color: "#FFA500" },
      mythic8: { health: 135, value: 625, color: "#800080" },
      mythic9: { health: 140, value: 650, color: "#008000" },
      mythic10: { health: 150, value: 700, color: "#000000" },
    }

    const blockData = blockTypes[type as keyof typeof blockTypes] || blockTypes.common

    let health = blockData.health
    if (type === "gold" && stateRef.current.level === 20) {
      health = blockData.health * 2
    }

    const blockWidth = Math.max(30, Math.min(45, canvasRef.current?.width / 10))
    const blockHeight = Math.max(10, Math.min(15, canvasRef.current?.height / 35))

    return {
      id: Math.random().toString(36),
      x,
      y,
      health,
      maxHealth: health,
      type: type as any,
      value: blockData.value,
      color: blockData.color,
      isSpecialGold: isSpecialGold,
      width: blockData.width || blockWidth,
      height: blockData.height || blockHeight,
    }
  }, [])

  const generateLevel = useCallback(() => {
    const blocks = []
    const currentLevel = stateRef.current.level
    const canvas = canvasRef.current

    console.log("[v0] Generating level:", currentLevel)

    if (!canvas) return

    const isDesktop = canvas.width >= 400
    const blockWidth = isDesktop
      ? Math.max(40, Math.min(60, canvas.width / 12))
      : Math.max(30, Math.min(45, canvas.width / 10))
    const blockHeight = isDesktop
      ? Math.max(15, Math.min(20, canvas.height / 30))
      : Math.max(10, Math.min(15, canvas.height / 35))

    const marginX = blockWidth / 2 + (isDesktop ? 12 : 8)
    const marginY = blockHeight / 2 + (isDesktop ? 20 : 15)

    const usableWidth = canvas.width - marginX * 2
    const usableHeight = canvas.height - marginY - (isDesktop ? 60 : 40)

    const baseRows = Math.max(isDesktop ? 8 : 6, Math.floor(usableHeight / (blockHeight + (isDesktop ? 8 : 6))))
    const additionalRows = Math.floor((currentLevel - 1) / 3)
    const rows = Math.min(baseRows + additionalRows, Math.floor(usableHeight / (blockHeight + (isDesktop ? 6 : 4))))
    const cols = Math.max(isDesktop ? 8 : 6, Math.floor(usableWidth / (blockWidth + (isDesktop ? 8 : 6))))

    const isLevel20 = currentLevel === 20
    const isSpecialGoldLevel = currentLevel % 20 === 0 && currentLevel >= 20

    const blockSpacingX = usableWidth / cols
    const blockSpacingY = Math.min(blockHeight + 6, usableHeight / rows)

    const getRandomBlockType = (level: number) => {
      const allTypes = [
        // Básicos (levels 1-10)
        "common",
        "reinforced",
        "resistant",
        "armored",
        "crystal",
        "neon",
        "diamond",
        "ruby",
        // Metálicos (levels 11-20)
        "copper",
        "bronze",
        "silver",
        "platinum",
        "titanium",
        "steel",
        "iron",
        "aluminum",
        "zinc",
        "lead",
        // Elementais (levels 21-30)
        "fire",
        "ice",
        "earth",
        "wind",
        "lightning",
        "water",
        "shadow",
        "light",
        "poison",
        "plasma",
        // Cores Vibrantes (levels 31-40)
        "crimson",
        "azure",
        "emerald",
        "violet",
        "orange",
        "turquoise",
        "coral",
        "lime",
        "indigo",
        "magenta",
        // Pastéis (levels 41-50)
        "pastelPink",
        "pastelBlue",
        "pastelGreen",
        "pastelYellow",
        "pastelPurple",
        "pastelOrange",
        "pastelRed",
        "pastelCyan",
        "pastelLavender",
        "pastelMint",
        // Neon (levels 51-60)
        "neonPink",
        "neonGreen",
        "neonBlue",
        "neonYellow",
        "neonOrange",
        "neonPurple",
        "neonRed",
        "neonCyan",
        "neonLime",
        "neonMagenta",
        // Escuros (levels 61-70)
        "darkRed",
        "darkBlue",
        "darkGreen",
        "darkPurple",
        "darkOrange",
        "darkCyan",
        "darkYellow",
        "darkPink",
        "darkGray",
        "darkBrown",
        // Cristais (levels 71-80)
        "quartzCrystal",
        "amethystCrystal",
        "topazCrystal",
        "sapphireCrystal",
        "emeraldCrystal",
        "rubyCrystal",
        "diamondCrystal",
        "opalCrystal",
        "peridotCrystal",
        "garnetCrystal",
        // Especiais (levels 81-90)
        "rainbow",
        "holographic",
        "cosmic",
        "ethereal",
        "mystic",
        "ancient",
        "divine",
        "infernal",
        "celestial",
        "void",
        // Lendários (levels 91-100)
        "legendary1",
        "legendary2",
        "legendary3",
        "legendary4",
        "legendary5",
        "legendary6",
        "legendary7",
        "legendary8",
        "legendary9",
        "legendary10",
        // Míticos (levels 101+)
        "mythic1",
        "mythic2",
        "mythic3",
        "mythic4",
        "mythic5",
        "mythic6",
        "mythic7",
        "mythic8",
        "mythic9",
        "mythic10",
      ]

      // Determinar quais tipos estão disponíveis baseado no level
      const availableTypes = ["common"]

      if (level >= 5) availableTypes.push("reinforced", "resistant")
      if (level >= 10) availableTypes.push("armored", "crystal", "neon", "diamond", "ruby")
      if (level >= 15) availableTypes.push(...allTypes.slice(8, 18)) // Metálicos
      if (level >= 25) availableTypes.push(...allTypes.slice(18, 28)) // Elementais
      if (level >= 35) availableTypes.push(...allTypes.slice(28, 38)) // Cores Vibrantes
      if (level >= 45) availableTypes.push(...allTypes.slice(38, 48)) // Pastéis
      if (level >= 55) availableTypes.push(...allTypes.slice(48, 58)) // Neon
      if (level >= 65) availableTypes.push(...allTypes.slice(58, 68)) // Escuros
      if (level >= 75) availableTypes.push(...allTypes.slice(68, 78)) // Cristais
      if (level >= 85) availableTypes.push(...allTypes.slice(78, 88)) // Especiais
      if (level >= 95) availableTypes.push(...allTypes.slice(88, 98)) // Lendários
      if (level >= 105) availableTypes.push(...allTypes.slice(98, 108)) // Míticos

      return availableTypes[Math.floor(Math.random() * availableTypes.length)]
    }

    if (isSpecialGoldLevel) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Criar um retângulo maior (3x2 blocos)
      const specialWidth = blockWidth * 3
      const specialHeight = blockHeight * 2

      blocks.push({
        id: Math.random().toString(36),
        x: centerX,
        y: centerY,
        health: 100 + (currentLevel / 20) * 50, // Vida aumenta com o level
        maxHealth: 100 + (currentLevel / 20) * 50,
        type: "specialGold",
        value: 100,
        color: "#FFD700",
        isSpecialGold: true,
        width: specialWidth,
        height: specialHeight,
      })

      console.log("[v0] Added special gold rectangle for level", currentLevel)
    } else {
      // Geração normal de blocos para outros levels
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (Math.random() < 0.9) {
            const x = marginX + col * blockSpacingX + blockSpacingX / 2
            const y = marginY + row * blockSpacingY + blockSpacingY / 2

            let type = "common"

            if (isLevel20) {
              type = "gold"
            } else {
              type = getRandomBlockType(currentLevel)
            }

            blocks.push(createBlock(x, y, type))
          }
        }
      }
    }

    console.log(
      "[v0] Generated",
      blocks.length,
      "blocks for level",
      currentLevel,
      "with dimensions",
      blockWidth,
      "x",
      blockHeight,
    )
    dispatch({ type: "UPDATE_BLOCKS", blocks })
  }, [createBlock, dispatch])

  const addParticles = useCallback((x: number, y: number, color: string, count = 5) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        maxLife: 30,
        color,
        size: Math.random() * 3 + 1,
      })
    }
  }, [])

  const checkCollision = useCallback((ball: any, block: any) => {
    const canvas = canvasRef.current
    if (!canvas) return false

    const ballRadius = 6 // Reduzindo raio da bola de 8 para 6
    const blockWidth = Math.max(30, Math.min(45, canvas.width / 10))
    const blockHeight = Math.max(10, Math.min(15, canvas.height / 35))

    return (
      ball.x + ballRadius > block.x - block.width / 2 &&
      ball.x - ballRadius < block.x + block.width / 2 &&
      ball.y + ballRadius > block.y - block.height / 2 &&
      ball.y - ballRadius < block.y + block.height / 2
    )
  }, [])

  const playHitSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1)

      const volume = (stateRef.current.volume / 100) * 0.3
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.type = "square"
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log("[v0] Audio not supported or blocked")
    }
  }, [])

  const applyBallSpecialEffect = useCallback(
    (ball: any, block: any, updatedBlocks: any[], ballIndex: number, blockIndex: number) => {
      const canvas = canvasRef.current
      if (!canvas) return { coinsEarned: 0, goldCollected: false, blocksDestroyed: false }

      let coinsEarned = 0
      let goldCollected = false
      let blocksDestroyed = false

      switch (ball.type) {
        case "plasma":
          // Bola de Plasma: explode em área pequena
          const explosionRadius = 80
          addParticles(block.x, block.y, "#FF6B35", 25)

          updatedBlocks.forEach((nearBlock, nearIndex) => {
            if (nearIndex !== blockIndex) {
              const distance = Math.sqrt((block.x - nearBlock.x) ** 2 + (block.y - nearBlock.y) ** 2)
              if (distance <= explosionRadius) {
                nearBlock.health -= ball.power * 0.7 // Dano reduzido para área
                addParticles(nearBlock.x, nearBlock.y, "#FF6B35", 8)

                if (nearBlock.health <= 0) {
                  coinsEarned += nearBlock.value
                  blocksDestroyed = true
                  if (nearBlock.type === "gold" || nearBlock.isSpecialGold) {
                    goldCollected = true
                    addParticles(nearBlock.x, nearBlock.y, "#FFD700", 20)
                  }
                  addParticles(nearBlock.x, nearBlock.y, nearBlock.color, 12)
                  updatedBlocks.splice(nearIndex, 1)
                }
              }
            }
          })
          break

        case "sniper":
          // Estados: "tracking" (rastreando tijolo), "to_wall" (indo para parede), "to_target" (voltando para tijolo)
          if (!ball.sniperState) {
            ball.sniperState = "tracking"
          }

          if (ball.sniperState === "tracking") {
            // Encontrar novo alvo se não tiver ou se o alvo foi destruído
            if (!ball.target || !updatedBlocks.find((b) => b.id === ball.target)) {
              let closestBlock = null
              let closestDistance = Number.POSITIVE_INFINITY

              updatedBlocks.forEach((targetBlock) => {
                const distance = Math.sqrt((ball.x - targetBlock.x) ** 2 + (ball.y - targetBlock.y) ** 2)
                if (distance < closestDistance) {
                  closestDistance = distance
                  closestBlock = targetBlock
                }
              })

              if (closestBlock) {
                ball.target = closestBlock.id
                ball.targetX = closestBlock.x
                ball.targetY = closestBlock.y
              }
            }

            // Após colidir com o tijolo alvo, ir para a parede
            if (ball.target === block.id) {
              ball.sniperState = "to_wall"

              // Determinar parede mais próxima
              const distToTop = ball.y
              const distToBottom = canvas.height - ball.y
              const distToLeft = ball.x
              const distToRight = canvas.width - ball.x

              const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight)

              if (minDist === distToTop) {
                ball.wallTarget = { x: ball.x, y: 20 }
              } else if (minDist === distToBottom) {
                ball.wallTarget = { x: ball.x, y: canvas.height - 20 }
              } else if (minDist === distToLeft) {
                ball.wallTarget = { x: 20, y: ball.y }
              } else {
                ball.wallTarget = { x: canvas.width - 20, y: ball.y }
              }

              addParticles(ball.x, ball.y, "#4A90E2", 20)
            }
          }
          break

        case "poison":
          // Bola de Veneno: atravessa blocos e aplica veneno fraco
          if (!block.poisoned) {
            block.poisoned = true
            // Dano muito baixo: apenas 1-2 pontos por tick
            block.poisonDamage = Math.max(1, Math.min(2, Math.floor(ball.power * 0.05)))
            // Mais ticks mas com dano muito baixo
            block.poisonTicks = 20 // 20 ticks de veneno fraco
            addParticles(block.x, block.y, "#7ED321", 15)
          }

          // Não alterar direção da bola
          break
      }

      return { coinsEarned, goldCollected, blocksDestroyed }
    },
    [addParticles],
  )

  const applyPoisonDamage = useCallback(
    (updatedBlocks: any[]) => {
      let coinsEarned = 0
      let goldCollected = false
      let blocksDestroyed = false

      updatedBlocks.forEach((block, index) => {
        if (block.poisoned && block.poisonTicks > 0) {
          // Aplicar dano apenas a cada 3 frames para tornar mais lento
          if (block.poisonTicks % 3 === 0) {
            block.health -= block.poisonDamage
          }
          block.poisonTicks--

          // Efeito visual do veneno mais sutil
          if (block.poisonTicks % 5 === 0) {
            addParticles(block.x, block.y, "#7ED321", 1)
          }

          if (block.health <= 0) {
            coinsEarned += block.value
            blocksDestroyed = true
            if (block.type === "gold" || block.isSpecialGold) {
              goldCollected = true
              addParticles(block.x, block.y, "#FFD700", block.isSpecialGold ? 50 : 30)
            }
            addParticles(block.x, block.y, block.color, 12)
            updatedBlocks.splice(index, 1)
          } else if (block.poisonTicks <= 0) {
            block.poisoned = false
            delete block.poisonDamage
            delete block.poisonTicks
          }
        }
      })

      return { coinsEarned, goldCollected, blocksDestroyed }
    },
    [addParticles],
  )

  const updateGame = useCallback(() => {
    const currentState = stateRef.current
    if (!currentState.gameRunning) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life--
      particle.vx *= 0.98
      particle.vy *= 0.98

      if (particle.life > 0) {
        const alpha = particle.life / particle.maxLife
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        return true
      }
      return false
    })

    const updatedBalls = currentState.balls.map((ball) => {
      const baseSpeed = 2 * currentState.upgrades.ballSpeed * currentState.prestige.multipliers.speed

      if (ball.type === "sniper") {
        if (ball.sniperState === "tracking" && ball.target) {
          // Rastreando tijolo alvo
          const targetBlock = currentState.blocks.find((b) => b.id === ball.target)
          if (targetBlock) {
            const dx = targetBlock.x - ball.x
            const dy = targetBlock.y - ball.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance > 0) {
              ball.vx = (dx / distance) * baseSpeed * 1.3
              ball.vy = (dy / distance) * baseSpeed * 1.3
              addParticles(ball.x, ball.y, "#4A90E2", 2)
            }
          }
        } else if (ball.sniperState === "to_wall" && ball.wallTarget) {
          // Indo para a parede
          const dx = ball.wallTarget.x - ball.x
          const dy = ball.wallTarget.y - ball.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 30) {
            // Chegou na parede, agora voltar para o tijolo alvo
            ball.sniperState = "to_target"
            addParticles(ball.x, ball.y, "#4A90E2", 15)
          } else if (distance > 0) {
            ball.vx = (dx / distance) * baseSpeed * 1.5
            ball.vy = (dy / distance) * baseSpeed * 1.5
          }
        } else if (ball.sniperState === "to_target") {
          // Voltando para o tijolo alvo
          if (ball.targetX && ball.targetY) {
            const dx = ball.targetX - ball.x
            const dy = ball.targetY - ball.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance > 0) {
              ball.vx = (dx / distance) * baseSpeed * 1.8 // Mais rápida no retorno
              ball.vy = (dy / distance) * baseSpeed * 1.8
              addParticles(ball.x, ball.y, "#FFD700", 3) // Efeito dourado no retorno
            }

            // Se chegou próximo ao alvo ou não há mais blocos, voltar ao modo tracking
            if (distance < 50 || currentState.blocks.length === 0) {
              ball.sniperState = "tracking"
              ball.target = null
              ball.targetX = null
              ball.targetY = null
              ball.wallTarget = null
            }
          } else {
            // Sem alvo válido, voltar ao tracking
            ball.sniperState = "tracking"
            ball.target = null
          }
        }
      } else {
        const currentSpeed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2)
        if (currentSpeed > 0) {
          ball.vx = (ball.vx / currentSpeed) * baseSpeed
          ball.vy = (ball.vy / currentSpeed) * baseSpeed
        }
      }

      ball.x += ball.vx
      ball.y += ball.vy

      const loopDetectionChance = ball.type === "sniper" ? 0.1 : 0.3
      if (Math.random() < loopDetectionChance && detectBallLoop(ball.id, ball.x, ball.y, ball.vx, ball.vy)) {
        randomizeBallDirection(ball)
      }

      ball.trail.push({ x: ball.x, y: ball.y, opacity: 1 })
      if (ball.trail.length > 10) {
        ball.trail.shift()
      }

      ball.trail.forEach((point, index) => {
        point.opacity = index / ball.trail.length
      })

      const ballRadius = 6
      if (ball.x <= ballRadius) {
        ball.x = ballRadius
        ball.vx = Math.abs(ball.vx)
        addParticles(ball.x, ball.y, "#00FFFF", 3)
      }
      if (ball.x >= canvas.width - ballRadius) {
        ball.x = canvas.width - ballRadius
        ball.vx = -Math.abs(ball.vx)
        addParticles(ball.x, ball.y, "#00FFFF", 3)
      }
      if (ball.y <= ballRadius) {
        ball.y = ballRadius
        ball.vy = Math.abs(ball.vy)
        addParticles(ball.x, ball.y, "#00FFFF", 3)
      }
      if (ball.y >= canvas.height - ballRadius) {
        ball.y = canvas.height - ballRadius
        ball.vy = -Math.abs(ball.vy)
        addParticles(ball.x, ball.y, "#00FFFF", 3)
      }

      return ball
    })

    const updatedBlocks = [...currentState.blocks]
    let coinsEarned = 0
    let goldCollected = false
    let blocksDestroyed = false

    const poisonResult = applyPoisonDamage(updatedBlocks)
    coinsEarned += poisonResult.coinsEarned
    goldCollected = goldCollected || poisonResult.goldCollected
    blocksDestroyed = blocksDestroyed || poisonResult.blocksDestroyed

    updatedBalls.forEach((ball, ballIndex) => {
      updatedBlocks.forEach((block, blockIndex) => {
        if (checkCollision(ball, block)) {
          playHitSound()

          const specialResult = applyBallSpecialEffect(ball, block, updatedBlocks, ballIndex, blockIndex)
          coinsEarned += specialResult.coinsEarned
          goldCollected = goldCollected || specialResult.goldCollected
          blocksDestroyed = blocksDestroyed || specialResult.blocksDestroyed

          block.health -= ball.power

          addParticles(block.x, block.y, block.color, 8)

          if (ball.type !== "poison") {
            const dx = ball.x - block.x
            const dy = ball.y - block.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance > 0) {
              const baseSpeed = 2 * currentState.upgrades.ballSpeed * currentState.prestige.multipliers.speed
              ball.vx = (dx / distance) * baseSpeed
              ball.vy = (dy / distance) * baseSpeed
            }
          }

          if (block.health <= 0) {
            coinsEarned += block.value
            blocksDestroyed = true

            if (block.type === "gold" || block.isSpecialGold) {
              goldCollected = true
              addParticles(block.x, block.y, "#FFD700", block.isSpecialGold ? 50 : 30)
            } else {
              addParticles(block.x, block.y, "#FFD700", 15)
            }

            addParticles(block.x, block.y, block.color, block.isSpecialGold ? 25 : 15)
            updatedBlocks.splice(blockIndex, 1)
          }
        }
      })
    })

    if (coinsEarned > 0 || goldCollected || blocksDestroyed) {
      if (coinsEarned > 0) {
        dispatch({ type: "ADD_COINS", amount: coinsEarned })
      }

      if (goldCollected) {
        dispatch({ type: "ADD_GOLD" })
      }

      dispatch({ type: "UPDATE_BLOCKS", blocks: updatedBlocks })

      if (updatedBlocks.length === 0) {
        completeLevel()
      }
    }

    if (updatedBalls !== currentState.balls) {
      dispatch({ type: "UPDATE_BALLS", balls: updatedBalls })
    }

    const isDesktop = canvas.width >= 400
    const blockWidth = isDesktop
      ? Math.max(40, Math.min(60, canvas.width / 12))
      : Math.max(30, Math.min(45, canvas.width / 10))
    const blockHeight = isDesktop
      ? Math.max(15, Math.min(20, canvas.height / 30))
      : Math.max(10, Math.min(15, canvas.height / 35))

    updatedBlocks.forEach((block) => {
      const healthPercent = block.health / block.maxHealth

      const currentBlockWidth = block.isSpecialGold ? block.width : blockWidth
      const currentBlockHeight = block.isSpecialGold ? block.height : blockHeight

      ctx.save()
      ctx.shadowColor = block.color
      ctx.shadowBlur = block.type === "gold" || block.isSpecialGold ? 15 : 8

      if (block.poisoned) {
        ctx.shadowColor = "#7ED321"
        ctx.shadowBlur = 12
        const poisonPulse = Math.sin(Date.now() * 0.02) * 0.3 + 0.7
        ctx.globalAlpha = poisonPulse
      } else {
        ctx.globalAlpha = 0.8
      }

      ctx.fillStyle = block.color
      ctx.fillRect(
        block.x - currentBlockWidth / 2,
        block.y - currentBlockHeight / 2,
        currentBlockWidth,
        currentBlockHeight,
      )

      if (block.type === "gold" || block.isSpecialGold) {
        const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8
        ctx.globalAlpha = pulse
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(
          block.x - currentBlockWidth / 2 + 3,
          block.y - currentBlockHeight / 2 + 3,
          currentBlockWidth - 6,
          currentBlockHeight - 6,
        )

        // Efeito extra para retângulo especial
        if (block.isSpecialGold) {
          ctx.fillStyle = "#FFF700"
          ctx.fillRect(
            block.x - currentBlockWidth / 2 + 6,
            block.y - currentBlockHeight / 2 + 6,
            currentBlockWidth - 12,
            currentBlockHeight - 12,
          )
        }
      }

      ctx.fillStyle = "#FF0000"
      ctx.globalAlpha = 0.3
      ctx.fillRect(
        block.x - currentBlockWidth / 2,
        block.y - currentBlockHeight / 2,
        currentBlockWidth * (1 - healthPercent),
        currentBlockHeight,
      )

      ctx.globalAlpha = 0.5
      ctx.strokeStyle = block.color
      ctx.lineWidth = block.type === "gold" || block.isSpecialGold ? 2 : 1
      ctx.strokeRect(
        block.x - currentBlockWidth / 2,
        block.y - currentBlockHeight / 2,
        currentBlockWidth,
        currentBlockHeight,
      )

      ctx.restore()
    })

    updatedBalls.forEach((ball) => {
      const ballColor = ball.type === "plasma" ? "#FF6B35" : ball.type === "sniper" ? "#4A90E2" : "#FFFFFF"

      // Renderizar trilha da bola
      ball.trail.forEach((point, index) => {
        if (index > 0) {
          ctx.save()
          ctx.globalAlpha = point.opacity * 0.5
          ctx.strokeStyle = ballColor
          ctx.lineWidth = isDesktop ? 3 : 2
          ctx.beginPath()
          ctx.moveTo(ball.trail[index - 1].x, ball.trail[index - 1].y)
          ctx.lineTo(point.x, point.y)
          ctx.stroke()
          ctx.restore()
        }
      })

      // Renderizar bola com cor específica
      const ballRadius = isDesktop ? 8 : 6
      ctx.save()
      ctx.shadowColor = ballColor
      ctx.shadowBlur = isDesktop ? 15 : 10
      ctx.fillStyle = ballColor
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2)
      ctx.fill()

      // Centro da bola
      ctx.fillStyle = "#FFFFFF"
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ballRadius / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    })
  }, [
    checkCollision,
    addParticles,
    dispatch,
    completeLevel,
    detectBallLoop,
    randomizeBallDirection,
    playHitSound,
    applyBallSpecialEffect,
    applyPoisonDamage,
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener("click", handleCanvasClick)
    canvas.addEventListener("touchstart", handleCanvasTouch, { passive: false })
    canvas.style.cursor = "crosshair"
    canvas.style.touchAction = "none" // Prevenir scroll no mobile

    return () => {
      canvas.removeEventListener("click", handleCanvasClick)
      canvas.removeEventListener("touchstart", handleCanvasTouch)
    }
  }, [handleCanvasClick, handleCanvasTouch])

  useEffect(() => {
    const gameLoop = () => {
      updateGame()
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    if (stateRef.current.gameRunning) {
      gameLoop()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (state.blocks.length === 0 && state.level >= 1) {
      console.log("[v0] No blocks found, initializing level:", state.level)
      console.log(
        "[v0] Current game state - Level:",
        state.level,
        "Balls:",
        state.balls.length,
        "Blocks:",
        state.blocks.length,
      )
      generateLevel()
    }
  }, [state.blocks.length, state.level, generateLevel])

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className="border-2 border-cyan-400 rounded-lg shadow-2xl shadow-cyan-400/20 bg-black/50 backdrop-blur-sm max-w-full max-h-full"
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-cyan-400/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,255,255,0.1))]" />
      </div>
      <div className="absolute top-1 left-1 text-cyan-400 text-xs font-mono opacity-75 pointer-events-none">
        {state.balls.length === 0 ? "Compre uma bola!" : "Toque nos blocos!"}
      </div>
      {state.balls.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-2">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/50 max-w-xs">
            <div className="text-center">
              <div className="text-cyan-400 text-base font-bold mb-2">Idle Breakout!</div>
              <div className="text-gray-300 text-xs">Compre sua primeira bola na loja</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
