import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">FinFlow</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie sua conta gratuitamente
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
