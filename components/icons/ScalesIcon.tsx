interface IconProps {
  className?: string
  size?: number
}

export function ScalesIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M5 8l7-5 7 5" />
      <path d="M5 8v0a2 2 0 0 1-2 2v0a2 2 0 0 0 2 2v0" />
      <path d="M19 8v0a2 2 0 0 0 2 2v0a2 2 0 0 1-2 2v0" />
      <circle cx="5" cy="11" r="3" />
      <circle cx="19" cy="11" r="3" />
    </svg>
  )
}
