'use client'

import { useState, useEffect } from 'react'

interface GlitchTextProps {
  text: string
  className?: string
}

const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?<>[]{}|/\\~'

export function GlitchText({ text, className = '' }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    // Start the glitch cycle
    const startGlitch = () => {
      setIsGlitching(true)

      // Glitch duration: 600-900ms of rapid changes
      const glitchDuration = 600 + Math.random() * 300
      const glitchInterval = 50 // Change every 50ms during glitch

      let elapsed = 0
      const glitchTimer = setInterval(() => {
        elapsed += glitchInterval

        if (elapsed >= glitchDuration) {
          // End glitch, restore original text
          clearInterval(glitchTimer)
          setDisplayText(text)
          setIsGlitching(false)
        } else {
          // Generate glitched text
          const glitched = text
            .split('')
            .map((char, i) => {
              // Randomly glitch some characters (40-70% chance per character)
              if (Math.random() < 0.4 + Math.random() * 0.3) {
                return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
              }
              return char
            })
            .join('')
          setDisplayText(glitched)
        }
      }, glitchInterval)

      return glitchTimer
    }

    // Initial delay before first glitch (2-4 seconds)
    const initialDelay = setTimeout(() => {
      startGlitch()
    }, 2000 + Math.random() * 2000)

    // Set up recurring glitch cycle (every 8-12 seconds)
    const cycleInterval = setInterval(() => {
      startGlitch()
    }, 8000 + Math.random() * 4000)

    return () => {
      clearTimeout(initialDelay)
      clearInterval(cycleInterval)
    }
  }, [text])

  return (
    <span
      className={`${className} ${isGlitching ? 'glitch-active' : ''}`}
      data-text={text}
    >
      {displayText}
    </span>
  )
}
