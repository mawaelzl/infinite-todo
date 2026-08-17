import { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { InfiniteScroller } from './components/InfiniteScroller'
import { SettingsMenu } from './components/SettingsMenu'
import { WelcomeDialog } from './components/WelcomeDialog'
import { useTodos } from './useTodos'
import { useAccentColor } from './useAccentColor'
import { useLocale } from './i18n/useLocale'
import { randomTagline } from './i18n/taglines'
import { randomWelcomeMessage } from './i18n/welcomeMessages'
import { useDailyReview } from './useDailyReview'
import './App.css'

const RAINBOW_COLORS = [
  '#ff3b30', // red
  '#ff9500', // orange
  '#ffcc00', // yellow
  '#34c759', // green
  '#00c7be', // teal
  '#007aff', // blue
  '#af52de', // violet
  '#ff2d95', // pink
]

function App() {
  const { getTodos, addTodo, toggleTodo, deleteTodo, updateTodoDuration } = useTodos()
  const { accent, setAccent } = useAccentColor()
  const { locale } = useLocale()
  const tagline = useMemo(() => randomTagline(locale), [locale])
  const dailyReview = useDailyReview()
  const [welcomeMessage] = useState(() =>
    dailyReview === 'none' ? null : randomWelcomeMessage(locale, dailyReview === 'all-done' ? 'allDone' : 'incomplete')
  )
  const [showWelcome, setShowWelcome] = useState(welcomeMessage !== null)

  useEffect(() => {
    if (dailyReview !== 'all-done') return

    // Every confetti() call spawns its whole particleCount from a single
    // origin, so firing 8 particles at once from one point looks like a
    // clump falling together. Instead fire several single-particle drops
    // per tick, each from its own random x position, so they're spread out
    // in space. A single color per call also sidesteps the canvas-confetti
    // quirk where colors[i % colors.length] only ever cycles through the
    // first `particleCount` colors of the array.
    const dropsPerTick = 6

    const end = Date.now() + 3000
    const intervalId = window.setInterval(() => {
      if (Date.now() >= end) {
        window.clearInterval(intervalId)
        return
      }
      for (let i = 0; i < dropsPerTick; i++) {
        const color = RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)]
        confetti({
          particleCount: 1,
          colors: [color],
          origin: { x: Math.random(), y: -0.1 },
          startVelocity: 2 + Math.random() * 3,
          gravity: 1,
          drift: Math.random() * 2 - 1,
          ticks: 600,
          spread: 70,
          scalar: 1.1,
        })
      }
    }, 150)

    return () => window.clearInterval(intervalId)
  }, [dailyReview])

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-spacer" aria-hidden="true" />
        <p className="app__tagline">{tagline}</p>
        <SettingsMenu accent={accent} onChange={setAccent} />
      </header>
      <InfiniteScroller
        getTodos={getTodos}
        onAdd={addTodo}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onUpdateDuration={updateTodoDuration}
      />
      {showWelcome && welcomeMessage && (
        <WelcomeDialog message={welcomeMessage} onDismiss={() => setShowWelcome(false)} />
      )}
    </div>
  )
}

export default App
