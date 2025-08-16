"use client"

import { useGame } from "@/contexts/game-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Zap, Target, Skull } from "lucide-react"

export function BallShop() {
  const { state, dispatch } = useGame()

  const handleAddNormalBall = () => {
    const cost = Math.floor(50 * Math.pow(2, state.upgrades.ballCount))
    if (state.coins >= cost) {
      dispatch({ type: "UPGRADE", upgrade: "ballCount", cost })
      dispatch({ type: "ADD_BALL" })
    }
  }

  const handleBuySpecialBall = (ballType: "plasma" | "sniper" | "poison") => {
    const ball = state.specialBalls[ballType]
    const cost = Math.floor(ball.cost * Math.pow(1.5, ball.purchased))

    if (state.coins >= cost) {
      dispatch({ type: "BUY_SPECIAL_BALL", ballType, cost })
      dispatch({ type: "USE_SPECIAL_BALL", ballType })
    }
  }

  const getAddBallCost = () => {
    return Math.floor(50 * Math.pow(2, state.upgrades.ballCount))
  }

  const canAddBall = () => {
    return state.coins >= getAddBallCost()
  }

  const getBallTypeIcon = (type: string) => {
    switch (type) {
      case "plasma":
        return <Zap className="w-5 h-5" />
      case "sniper":
        return <Target className="w-5 h-5" />
      case "poison":
        return <Skull className="w-5 h-5" />
      default:
        return <Plus className="w-5 h-5" />
    }
  }

  const getBallTypeColor = (type: string) => {
    switch (type) {
      case "plasma":
        return "from-orange-500 to-red-500"
      case "sniper":
        return "from-blue-500 to-cyan-500"
      case "poison":
        return "from-green-500 to-emerald-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Loja de Bolas</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "TOGGLE_BALL_SHOP" })}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Bola Normal</h3>
            <Button
              onClick={handleAddNormalBall}
              disabled={!canAddBall()}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-6 text-lg disabled:opacity-50"
            >
              <Plus className="w-6 h-6 mr-2" />
              Adicionar Bola Normal - {getAddBallCost().toLocaleString()}💰
            </Button>
            <p className="text-gray-400 text-sm mt-2 text-center">Bolas atuais: {state.balls.length}</p>
          </div>

          {/* Special Balls Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-400 mb-4">Comprar Bolas Especiais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(state.specialBalls).map(([key, ball]) => {
                const ballType = key as "plasma" | "sniper" | "poison"
                const buyCost = Math.floor(ball.cost * Math.pow(1.5, ball.purchased))

                return (
                  <div key={key} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-r ${getBallTypeColor(key)} flex items-center justify-center mb-3 mx-auto`}
                    >
                      {getBallTypeIcon(key)}
                    </div>
                    <h4 className="text-lg font-bold text-white text-center mb-2">{ball.name}</h4>
                    <p className="text-gray-400 text-sm text-center mb-3">{ball.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Custo:</span>
                        <span className="text-white">{buyCost.toLocaleString()}💰</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Compradas:</span>
                        <span className="text-cyan-400">{ball.purchased}</span>
                      </div>
                      {ball.purchased > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Próximo:</span>
                          <span className="text-yellow-400">
                            {Math.floor(ball.cost * Math.pow(1.5, ball.purchased + 1)).toLocaleString()}💰
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => handleBuySpecialBall(ballType)}
                        disabled={state.coins < buyCost}
                        className={`w-full bg-gradient-to-r ${getBallTypeColor(key)} text-white disabled:opacity-50`}
                      >
                        {getBallTypeIcon(key)}
                        <span className="ml-2">Comprar e Usar - {buyCost.toLocaleString()}💰</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
