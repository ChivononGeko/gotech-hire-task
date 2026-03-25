import React, { useState, useRef, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ChatPage from './components/ChatPage'
import { API_URL, SOCKET_URL } from './constants'

export default function App() {
	const [token, setToken] = useState<string | null>(
		localStorage.getItem('token'),
	)
	const [userId, setUserId] = useState<number | null>(() => {
		const stored = localStorage.getItem('userId')
		return stored ? parseInt(stored, 10) : null
	})

	const socketRef = useRef<Socket | null>(null)

	if (!socketRef.current) {
		socketRef.current = io(SOCKET_URL, {
			auth: { token: localStorage.getItem('token') },
		})
	}

	useEffect(() => {
		return () => {
			socketRef.current?.disconnect()
		}
	}, [])

	const handleLogin = (newToken: string, newUserId: number) => {
		localStorage.setItem('token', newToken)
		localStorage.setItem('userId', String(newUserId))
		setToken(newToken)
		setUserId(newUserId)
		if (socketRef.current) {
			socketRef.current.auth = { token: newToken }
			socketRef.current.disconnect().connect()
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('token')
		localStorage.removeItem('userId')
		socketRef.current?.disconnect()
		socketRef.current = null
		setToken(null)
		setUserId(null)
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path='/login'
					element={
						token ? (
							<Navigate to='/chat' />
						) : (
							<LoginPage onLogin={handleLogin} />
						)
					}
				/>
				<Route
					path='/register'
					element={
						token ? (
							<Navigate to='/chat' />
						) : (
							<RegisterPage onLogin={handleLogin} />
						)
					}
				/>
				<Route
					path='/chat'
					element={
						token && userId && socketRef.current ? (
							<ChatPage
								token={token}
								userId={userId}
								socket={socketRef.current}
								apiUrl={API_URL}
								onLogout={handleLogout}
							/>
						) : (
							<Navigate to='/login' />
						)
					}
				/>
				<Route
					path='*'
					element={<Navigate to={token ? '/chat' : '/login'} />}
				/>
			</Routes>
		</BrowserRouter>
	)
}
