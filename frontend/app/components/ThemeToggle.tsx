"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle({ className, children, showIcon = true }: { className?: string, children?: React.ReactNode, showIcon?: boolean }) {
  const [mounted, setMounted] = React.useState(false)
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    // Get theme from localStorage (should exist from layout script)
    const saved = localStorage.getItem("theme")
    const isDarkMode = saved === "dark" || document.documentElement.classList.contains("dark")
    
    setIsDark(isDarkMode)
    setMounted(true)
    
    console.log("Initial theme:", isDarkMode ? "dark" : "light", "from localStorage:", saved)
  }, [])

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const html = document.documentElement
    const currentlyDark = html.classList.contains("dark")
    
    console.log("Before toggle - classList:", html.classList.toString())
    console.log("Currently dark:", currentlyDark, "isDark state:", isDark)
    
    if (currentlyDark) {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
      console.log("Switched to light mode. New classList:", html.classList.toString())
    } else {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
      console.log("Switched to dark mode. New classList:", html.classList.toString())
    }
  }

  if (!mounted) {
    return <div className="w-5 h-5" />
  }

  return (
    <button
      onClick={toggleTheme}
      onMouseDown={(e) => e.preventDefault()}
      className={className || "inline-flex items-center justify-center p-2 rounded-md hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"}
      aria-label="Toggle theme"
      type="button"
      tabIndex={0}
    >
      {children}
      {showIcon && (isDark ? (
        <Sun className="h-5 w-5 text-white" />
      ) : (
        <Moon className="h-5 w-5 text-white" />
      ))}
    </button>
  )
}
