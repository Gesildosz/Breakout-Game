import { createClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Game progress types
export interface GameProgress {
  id?: string
  user_id?: string
  level: number
  coins: number
  balls: number
  upgrades: {
    ballSpeed: number
    ballPower: number
    coinMultiplier: number
  }
  prestige: {
    level: number
    multipliers: {
      speed: number
      power: number
      coins: number
    }
  }
  settings: {
    volume: number
  }
  created_at?: string
  updated_at?: string
}

// Save game progress to Supabase
export async function saveGameProgress(progress: GameProgress) {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, using localStorage fallback")
    localStorage.setItem("idle-breakout-save", JSON.stringify(progress))
    return { success: true }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // If not authenticated, save to localStorage as fallback
      localStorage.setItem("idle-breakout-save", JSON.stringify(progress))
      return { success: true }
    }

    const { data, error } = await supabase
      .from("game_progress")
      .upsert({
        user_id: user.id,
        level: progress.level,
        coins: progress.coins,
        balls: progress.balls,
        upgrades: progress.upgrades,
        prestige: progress.prestige,
        settings: progress.settings,
      })
      .select()

    if (error) {
      console.error("Error saving game progress:", error)
      // Fallback to localStorage
      localStorage.setItem("idle-breakout-save", JSON.stringify(progress))
      return { success: true }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error saving game progress:", error)
    // Fallback to localStorage
    localStorage.setItem("idle-breakout-save", JSON.stringify(progress))
    return { success: true }
  }
}

// Load game progress from Supabase
export async function loadGameProgress(): Promise<GameProgress | null> {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, using localStorage fallback")
    const saved = localStorage.getItem("idle-breakout-save")
    return saved ? JSON.parse(saved) : null
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // If not authenticated, load from localStorage as fallback
      const saved = localStorage.getItem("idle-breakout-save")
      return saved ? JSON.parse(saved) : null
    }

    const { data, error } = await supabase.from("game_progress").select("*").eq("user_id", user.id).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No data found, check localStorage for migration
        const saved = localStorage.getItem("idle-breakout-save")
        if (saved) {
          const progress = JSON.parse(saved)
          // Migrate localStorage data to Supabase
          await saveGameProgress(progress)
          return progress
        }
        return null
      }
      console.error("Error loading game progress:", error)
      // Fallback to localStorage
      const saved = localStorage.getItem("idle-breakout-save")
      return saved ? JSON.parse(saved) : null
    }

    return data
  } catch (error) {
    console.error("Error loading game progress:", error)
    // Fallback to localStorage
    const saved = localStorage.getItem("idle-breakout-save")
    return saved ? JSON.parse(saved) : null
  }
}
