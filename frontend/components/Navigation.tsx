'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart3, Menu, X } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'DeFi', href: '/defi' },
        { name: 'Analytics', href: '/analytics' },
    ]

    return (
        <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900">DomainIQ</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* RainbowKit Connect Button */}
                        <ConnectButton
                            chainStatus="icon"
                            accountStatus={{
                                smallScreen: 'avatar',
                                largeScreen: 'full',
                            }}
                            showBalance={{
                                smallScreen: false,
                                largeScreen: true,
                            }}
                        />
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-primary-600 p-2"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="px-3 py-2">
                                <ConnectButton
                                    chainStatus="icon"
                                    accountStatus="avatar"
                                    showBalance={false}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}