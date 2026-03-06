'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                {error.message || "An unexpected error occurred while loading the page."}
            </p>
            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    variant="default"
                >
                    Try again
                </Button>
                <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                >
                    Go Home
                </Button>
            </div>
        </div>
    )
}
