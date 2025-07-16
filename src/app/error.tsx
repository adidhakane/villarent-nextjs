'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🔥</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Application Error
            </h1>
            <p className="text-gray-600 mb-4">
              Something went wrong while loading the application.
            </p>
            
            <details className="text-left mb-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Technical Details
              </summary>
              <div className="text-xs bg-gray-100 p-3 rounded">
                <p><strong>Error:</strong> {error.message}</p>
                {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
                {error.stack && (
                  <pre className="mt-2 overflow-auto max-h-32 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>

            <div className="space-y-2">
              <button
                onClick={reset}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Reload Page
              </button>
              <Link
                href="/"
                className="block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center transition-colors"
              >
                Go to Homepage
              </Link>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>If this problem persists, please check:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Your internet connection</li>
                <li>Browser console for detailed errors</li>
                <li>Try clearing browser cache</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
