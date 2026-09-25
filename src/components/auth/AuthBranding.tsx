import { Check, Hammer } from 'lucide-react'

interface AuthBrandingProps {
  compact?: boolean
}

const featureHighlights = [
  'Keep applications, DSA, and projects in one place',
  'See the next step in your career plan',
  'Prepare with focused study and progress insights',
]

function BrandLockup() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
        <Hammer aria-hidden="true" className="h-4.5 w-4.5" />
      </span>
      <span className="text-base font-semibold tracking-tight text-neutral-900">
        CareerForge
      </span>
    </div>
  )
}

export function AuthBranding({ compact = false }: AuthBrandingProps) {
  if (compact) {
    return (
      <div className="mb-8 flex items-center justify-between gap-4">
        <BrandLockup />
        <span className="text-xs font-medium text-neutral-400">Career management</span>
      </div>
    )
  }

  return (
    <section className="flex h-full w-full flex-col justify-between bg-primary-50/70 p-8 sm:p-10 lg:p-12 xl:p-16">
      <BrandLockup />

      <div className="my-12 max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
          Career management platform
        </p>
        <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
          Build your career.
          <br />
          Track your progress.
          <br />
          <span className="text-primary-600">Get placement-ready.</span>
        </h2>
        <p className="mt-6 max-w-md text-sm leading-6 text-neutral-600 sm:text-base">
          A focused workspace for students who want a clearer plan from applications to
          their next opportunity.
        </p>
      </div>

      <div>
        <ul className="space-y-3" aria-label="CareerForge highlights">
          {featureHighlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3 text-sm text-neutral-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-primary-600 ring-1 ring-inset ring-primary-100">
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-neutral-400">CareerForge · Built for focused progress</p>
      </div>
    </section>
  )
}
