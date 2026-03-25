import React, { createContext, useContext } from 'react'
import { Socket } from 'socket.io-client'

interface ChatContextValue {
	token: string
	userId: number
	socket: Socket
	apiUrl: string
}

const ChatContext = createContext<ChatContextValue | null>(null)

export const ChatProvider = ChatContext.Provider

export function useChat(): ChatContextValue {
	const ctx = useContext(ChatContext)
	if (!ctx) throw new Error('useChat must be used inside ChatProvider')
	return ctx
}
