import { useTheme } from './ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'light' ? 'dark' : 'light'

  return <button className="theme-toggle" type="button" aria-label={`Use ${nextTheme} theme`} title={`Use ${nextTheme} theme`} onClick={toggleTheme}>
    <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
  </button>
}
