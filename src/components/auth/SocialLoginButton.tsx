import { GitHubIcon } from '../GitHubIcon'
import { Button } from '../Button'

interface SocialLoginButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function SocialLoginButton({ onClick, disabled = false }: SocialLoginButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      className="w-full"
      onClick={onClick}
      disabled={disabled}
    >
      <GitHubIcon className="h-4 w-4" />
      Continue with GitHub
    </Button>
  )
}
