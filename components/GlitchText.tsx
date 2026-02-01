'use client'

import { useState, useEffect, useRef } from 'react'

interface GlitchTextProps {
  text: string
  className?: string
}

// Multi-language glitch characters
const GLITCH_CHARS = [
  // Latin & symbols
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?<>[]{}|/\\~'.split(''),
  // Japanese Katakana
  ...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split(''),
  // Japanese Hiragana
  ...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split(''),
  // Korean Hangul
  ...'가나다라마바사아자차카타파하갸냐댜랴먀뱌샤야쟈챠캬탸퍄햐'.split(''),
  // Chinese characters
  ...'龍鳳虎豹風雷電雲山水火土金木天地日月星辰'.split(''),
  // Cyrillic
  ...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split(''),
  // Greek
  ...'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'.split(''),
  // Arabic numerals/symbols style
  ...'٠١٢٣٤٥٦٧٨٩'.split(''),
  // Box drawing & blocks
  ...'░▒▓█▄▀■□▪▫'.split(''),
]

export function GlitchText({ text, className = '' }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isGlitching, setIsGlitching] = useState(false)
  const glitchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const microGlitchRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const getRandomChar = () => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]

    // Micro-glitch: brief flicker of 1-3 characters
    const doMicroGlitch = () => {
      const numChars = 1 + Math.floor(Math.random() * 3)
      const positions = new Set<number>()
      while (positions.size < numChars && positions.size < text.length) {
        positions.add(Math.floor(Math.random() * text.length))
      }

      // Show glitched version briefly
      const glitched = text.split('').map((char, i) =>
        positions.has(i) ? getRandomChar() : char
      ).join('')

      setDisplayText(glitched)
      setIsGlitching(true)

      // Restore after 50-100ms
      setTimeout(() => {
        setDisplayText(text)
        setIsGlitching(false)
      }, 50 + Math.random() * 50)
    }

    // Full glitch: chaotic sequence with varying intensity
    const doFullGlitch = () => {
      setIsGlitching(true)

      const glitchDuration = 700 + Math.random() * 400
      const glitchInterval = 40
      let elapsed = 0

      // Clear any existing timer
      if (glitchTimerRef.current) clearInterval(glitchTimerRef.current)

      glitchTimerRef.current = setInterval(() => {
        elapsed += glitchInterval

        if (elapsed >= glitchDuration) {
          if (glitchTimerRef.current) clearInterval(glitchTimerRef.current)
          setDisplayText(text)
          setIsGlitching(false)
        } else {
          // Vary intensity through the glitch
          const progress = elapsed / glitchDuration
          // Peak chaos in the middle, fade in and out
          const intensity = Math.sin(progress * Math.PI) * 0.6 + 0.2

          const glitched = text.split('').map((char) => {
            if (Math.random() < intensity) {
              return getRandomChar()
            }
            return char
          }).join('')

          setDisplayText(glitched)
        }
      }, glitchInterval)
    }

    // Schedule random micro-glitches between main glitches
    const scheduleMicroGlitches = () => {
      const delay = 1500 + Math.random() * 3000
      microGlitchRef.current = setTimeout(() => {
        if (Math.random() < 0.4) { // 40% chance for micro-glitch
          doMicroGlitch()
        }
        scheduleMicroGlitches()
      }, delay)
    }

    // Initial delay before first full glitch
    const initialDelay = setTimeout(() => {
      doFullGlitch()
    }, 2000 + Math.random() * 2000)

    // Full glitch cycle every 8-12 seconds
    const cycleInterval = setInterval(() => {
      doFullGlitch()
    }, 8000 + Math.random() * 4000)

    // Start micro-glitch scheduler
    scheduleMicroGlitches()

    return () => {
      clearTimeout(initialDelay)
      clearInterval(cycleInterval)
      if (glitchTimerRef.current) clearInterval(glitchTimerRef.current)
      if (microGlitchRef.current) clearTimeout(microGlitchRef.current)
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
