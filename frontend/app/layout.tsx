import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import ErrorBoundary from '@/components/ErrorBoundary'
import WalletProvider from '@/components/WalletProvider'

export const metadata: Metadata = {
    title: 'DomainIQ - AI-Powered Domain Intelligence',
    description: 'Advanced domain analytics and scoring platform powered by Doma Protocol',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <WalletProvider>
                    <ErrorBoundary>
                        <Navigation />
                        <main className="min-h-screen pt-16">
                            {children}
                        </main>
                    </ErrorBoundary>
                </WalletProvider>
            </body>
        </html>
    )
}