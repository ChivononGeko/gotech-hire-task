import React, { useState } from 'react'
import { API_URL } from '../constants'

interface Props {
	onLogin: (token: string, userId: number) => void
}

export default function LoginPage({ onLogin }: Props) {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const res = await fetch(`${API_URL}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			})
			const data = await res.json()
			if (data.token) {
				onLogin(data.token, data.userId)
			} else {
				setError(data.message ?? 'Invalid credentials')
			}
		} catch {
			setError('Network error. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
			}}
		>
			<form
				onSubmit={handleSubmit}
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '10px',
					width: '300px',
				}}
			>
				<h2>Login</h2>
				{error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}
				<input
					placeholder='Username'
					value={username}
					onChange={e => setUsername(e.target.value)}
					style={{ padding: '8px', fontSize: '16px' }}
				/>
				<input
					type='password'
					placeholder='Password'
					value={password}
					onChange={e => setPassword(e.target.value)}
					style={{ padding: '8px', fontSize: '16px' }}
				/>
				<button
					type='submit'
					disabled={loading}
					style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
				>
					{loading ? 'Logging in...' : 'Login'}
				</button>
				<a href='/register'>Don't have an account? Register</a>
			</form>
		</div>
	)
}
