import {AxiosErrorResponse} from "./Misc.ts";

export type UserProfileFull = {
    userId: string,
    userName: string,
    profilePictureUrl: string,
    description: string,
    disabled: boolean,
    deleted: boolean
}

export type UserRoomAffiliation = {
    chatRoomId: string,
    userId: string,
    role: number
}

export type RoomProfileFull = {
    roomId: string,
    roomName: string,
    description: string,
    createdAt: number,
    lastActivity: number,
    isPublic: boolean,
    hashedPassword: string,
    maxUsers: number,
}

export type RoomConnectionData = {
    roomId: string,
    roomName: string
}

export type MessageFull = {
    messageId: string,
    senderId: string,
    roomId: string,
    messageContent: string,
    createdAt: number,
    modifiedAt: number,
    clientStamp: number
}

export type InvitationFull = {
    invitationString: string,
    instigatorId: string,
    chatRoomId: string,
    isEnabled: boolean
}

export type MessagesResponse = {
    messages: MessageFull[]
}

export type MessageReceivedCallback = (message: MessageFull) => void;
export type MessageWebSocketSubmitForm = {
    senderId: string,
    messageContent: string,
    clientStamp: number
}

export type CumailNEXTChatContextType = {
    lastError: AxiosErrorResponse,
    roomConnectionData: RoomConnectionData,
    resolveError: () => void,
    getUserProfile: (uid: string) => Promise<UserProfileFull>,
    selfFetchProfile: () => Promise<UserProfileFull>,
    getUserRoomAffiliations: (uid: string) => Promise<UserRoomAffiliation[]>,
    selfUserRoomAffiliations: () => Promise<UserRoomAffiliation[]>,
    getRoomProfile: (roomId: string) => Promise<RoomProfileFull>,
    getRoomMembers: (roomId: string) => Promise<UserRoomAffiliation[]>,
    changeRoom: (roomId: string) => Promise<boolean>,
    sendMessage: (content: string) => Promise<void>,
    sendMessageManual: (message : MessageWebSocketSubmitForm) => Promise<void>,
    onMessageReceived: (handler: MessageReceivedCallback) => void,
    getLatestMessages: (amount: number) => Promise<MessagesResponse>,
    createChatBoard: (boardName: string) => Promise<boolean>,
    joinChatBoard: (invitation: string) => Promise<boolean>,
    changeRoomName: (roomId: string, newRoomName: string) => Promise<boolean>,
    kickFromRoom: (userId: string, roomId: string) => Promise<boolean>,
    leaveRoom: (roomId: string) => Promise<boolean>,
    getInvitations: (roomId: string) => Promise<InvitationFull[]>,
    createInvitation: (roomId: string, invitation: string) => Promise<boolean>,
    deleteInvitation: (invitation: string) => Promise<boolean>,
}
