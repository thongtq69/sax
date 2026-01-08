"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react"

export default function VerifyOTPContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email")
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [countdown, setCountdown] = useState(0)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()
    
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setMessage({ type: "error", text: "Please enter all 6 digits" })
      return
    }

    if (!email) {
      setMessage({ type: "error", text: "Email not found. Please register again." })
      return
    }

    setIsVerifying(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        setTimeout(() => {
          router.push("/auth/login?verified=true")
        }, 2000)
      } else {
        setMessage({ type: "error", text: data.message })
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Email not found" })
      return
    }

    if (countdown > 0) {
      return
    }

    setIsResending(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        setCountdown(60) // 60 seconds cooldown
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to resend OTP" })
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Request</CardTitle>
            <CardDescription>Email parameter is missing</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/register">
              <Button className="w-full">Go to Registration</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit OTP code to<br />
            <span className="font-semibold text-gray-900">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <Label className="text-center block mb-3">Enter OTP Code</Label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold"
                    disabled={isVerifying}
                  />
                ))}
              </div>
            </div>

            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifying || otp.some(d => !d)}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="link"
                onClick={handleResendOTP}
                disabled={isResending || countdown > 0}
                className="text-blue-600"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend OTP (${countdown}s)`
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>OTP expires in 15 minutes</p>
            </div>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
