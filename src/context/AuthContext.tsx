'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI, setTokens, clearTokens, setUser, getStoredUser } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    email: string
    name: string
    phone?: string
    phoneVerified?: boolean
    role: string
    age?: number
    monthlyIncome?: string
    riskProfile?: string
    walletAddress?: string
}

interface LoginResult {
    step: 'otp_required' | 'login_complete'
    pendingToken?: string
    email?: string
    message?: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<LoginResult>
    verify2fa: (pendingToken: string, otp: string) => Promise<void>
    register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>
    logout: () => Promise<void>
    updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check for stored user on mount
        const stored = getStoredUser()
        if (stored) {
            setUserState(stored)
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string): Promise<LoginResult> => {
        const response = await authAPI.login({ email, password })

        // 2FA flow: login API now returns step='otp_required' with a pendingToken
        if (response.step === 'otp_required') {
            return {
                step: 'otp_required',
                pendingToken: response.pendingToken,
                email: response.email,
                message: response.message,
            }
        }

        // Direct login (fallback, shouldn't happen with 2FA enabled)
        setTokens(response.accessToken, response.refreshToken)
        setUser(response.user)
        setUserState(response.user)
        return { step: 'login_complete' }
    }

    const verify2fa = async (pendingToken: string, otp: string) => {
        const response = await authAPI.verify2faOtp(pendingToken, otp)
        setTokens(response.accessToken, response.refreshToken)
        setUser(response.user)
        setUserState(response.user)
    }

    const register = async (data: { email: string; password: string; name: string; phone?: string }) => {
        const response = await authAPI.register(data)
        setTokens(response.accessToken, response.refreshToken)
        setUser(response.user)
        setUserState(response.user)
    }

    const logout = async () => {
        try {
            await authAPI.logout()
        } catch (e) {
            // ignore
        }
        clearTokens()
        setUserState(null)
        router.push('/login')
    }

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser)
        setUserState(updatedUser)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                verify2fa,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
