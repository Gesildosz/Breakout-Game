"use client"

import { motion } from "framer-motion"
import { useGame } from "@/contexts/game-context"
import { Play, X, Settings, RotateCcw, AlertTriangle, Check } from "lucide-react"
import { useState } from "react"

export default function MainMenu() {
  const { dispatch } = useGame()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)

  const handleStartGame = () => {
    dispatch({ type: "START_GAME" })
  }

  const handleExitGame = () => {
    // Em um ambiente web, "sair" pode significar voltar ao menu ou fechar a aba
    if (typeof window !== "undefined") {
      const confirmExit = window.confirm("Tem certeza que deseja sair do jogo?")
      if (confirmExit) {
        window.close() // Tenta fechar a aba/janela
      }
    }
  }

  const handleShowSettings = () => {
    dispatch({ type: "SHOW_SETTINGS", show: true })
  }

  const handleResetGame = () => {
    setShowResetConfirm(true)
  }

  const confirmReset = async () => {
    try {
      // Limpar localStorage
      localStorage.removeItem("idle-breakout-save")

      // Reset do estado do jogo
      dispatch({ type: "RESET_GAME" })

      // Mostrar confirmação
      setShowResetConfirm(false)
      setResetComplete(true)

      // Esconder mensagem após 3 segundos
      setTimeout(() => {
        setResetComplete(false)
      }, 3000)
    } catch (error) {
      console.error("[v0] Erro ao resetar jogo:", error)
    }
  }

  const cancelReset = () => {
    setShowResetConfirm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,0,128,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(138,43,226,0.1),transparent_50%)]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 8 + i * 0.5,
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

      {/* Menu Content */}
      <div className="relative z-10 text-center px-4 sm:px-6">
        {/* Logo/Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            IDLE BREAKOUT
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-md mx-auto">
            Quebre blocos, colete moedas e evolua suas bolas em uma aventura infinita!
          </p>
        </motion.div>

        {/* Menu Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Jogar Button */}
          <motion.button
            onClick={handleStartGame}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-full max-w-xs mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-xl">JOGAR</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          {/* Configurações Button */}
          <motion.button
            onClick={handleShowSettings}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(138, 43, 226, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-full max-w-xs mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-lg">CONFIGURAÇÕES</span>
          </motion.button>

          {/* Reset Button */}
          <motion.button
            onClick={handleResetGame}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 165, 0, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-full max-w-xs mx-auto bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-3 px-8 rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            <span className="text-lg">RESET</span>
          </motion.button>

          {/* Sair Button */}
          <motion.button
            onClick={handleExitGame}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-full max-w-xs mx-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-8 rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-lg">SAIR</span>
          </motion.button>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 text-gray-400 text-sm"
        >
          <p>Versão 1.0 • Feito com ❤️ para diversão infinita</p>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-cyan-400/30 rounded-full animate-pulse" />
      <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-purple-400/30 rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-5 w-12 h-12 border-2 border-pink-400/30 rounded-full animate-pulse" />
      <div className="absolute top-1/4 right-5 w-14 h-14 border-2 border-blue-400/30 rounded-full animate-pulse" />

      {showResetConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-orange-500/30 shadow-2xl"
          >
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Confirmar Reset</h3>
              <p className="text-gray-300 mb-8">
                Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita.
              </p>

              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={confirmReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Sim, Resetar
                </motion.button>

                <motion.button
                  onClick={cancelReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Cancelar
                </motion.button>

                <motion.button
                  onClick={cancelReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Voltar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {resetComplete && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <Check className="w-6 h-6" />
            <span className="font-bold text-lg">Reset Concluído!</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
