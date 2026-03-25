export interface JoinRoomPayload {
	roomId: number
}

export interface SendMessagePayload {
	roomId: number
	content: string
}

export interface LeaveRoomPayload {
	roomId: number
}
