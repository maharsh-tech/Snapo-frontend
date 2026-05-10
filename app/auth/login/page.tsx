import AuthForm from '@/components/AuthForm'

export default function Login() {
  return (
    <div className="container py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <AuthForm mode="login" />
    </div>
  )
}
