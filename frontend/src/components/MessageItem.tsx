import React from 'react'

interface Message {
	id: number
	content: string
	username: string
	senderName: string
	createdAt: string
	userId: number
}

interface Props {
	message: Message
	isOwn: boolean
}

function formatTime(dateStr: string): string {
	return new Date(dateStr).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	})
}

export default function MessageItem({ message, isOwn }: Props) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: isOwn ? 'flex-end' : 'flex-start',
				marginBottom: '10px',
			}}
		>
			<div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
				{message.senderName || message.username} ·{' '}
				{formatTime(message.createdAt)}
			</div>
			<div
				style={{
					maxWidth: '70%',
					padding: '8px 12px',
					borderRadius: '12px',
					backgroundColor: isOwn ? '#0084ff' : '#e4e6ea',
					color: isOwn ? 'white' : 'black',
				}}
			>
				{message.content}
			</div>
		</div>
	)
}
