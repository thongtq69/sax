import { Suspense } from "react"
import VerifyOTPContent from "./VerifyOTPContent"

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  )
}
