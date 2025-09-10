'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
    onSearch: (query: string) => void
    disabled?: boolean
    placeholder?: string
}

export default function SearchBar({ onSearch, disabled = false, placeholder = "Enter domain name..." }: SearchBarProps) {
    const [query, setQuery] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim() && !disabled) {
            onSearch(query.trim())
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full h-14 pl-6 pr-14 text-lg rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!query.trim() || disabled}
                    className="absolute right-2 top-2 h-10 w-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                >
                    <Search className="w-5 h-5 text-white" />
                </button>
            </div>
        </form>
    )
}