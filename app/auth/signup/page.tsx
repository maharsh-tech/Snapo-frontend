import AuthForm from '@/components/AuthForm'

export default function SignUp() {
  return (
    <div className="container py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <AuthForm mode="signup" />
    </div>
  )
}
