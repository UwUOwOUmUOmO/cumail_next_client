import React, {useContext, useRef, useState} from "react";
import {useCumailNEXTAuth} from "./CumailNEXTAuthProvider.tsx";
import axios, {AxiosError} from "axios";
import * as signalR from "@microsoft/signalr";
import {
    CumailNEXTChatContextType, InvitationFull,
    MessageFull,
    MessageReceivedCallback,
    MessagesResponse,
    MessageWebSocketSubmitForm,
    RoomConnectionData,
    RoomProfileFull,
    UserProfileFull,
    UserRoomAffiliation
} from "./CumailNEXTChatContextType.ts";
import {CumailNEXTAuthContextType} from "./CumailNEXTAuthContextType.ts";
import {AxiosErrorResponse} from "./Misc.ts";

const CumailNEXTChatContext = React.createContext<CumailNEXTChatContextType | null>(null)

const CHAT_APP_BASE_URL = process.env.REACT_APP_CUMAIL_CHAT_BASE_URL as string;
const CHAT_APP_WEBSOCKET_URL = process.env.REACT_APP_CUMAIL_CHATWS_BASE_URL as string;

export const useCumailNEXTChat = () => useContext(CumailNEXTChatContext);

const chatAppGetRequest = async (subUrl: string, authorization?: string) => {
    return await axios.get(CHAT_APP_BASE_URL + subUrl, authorization === undefined ? undefined : {
        headers: {
            Authorization: `Bearer ${authorization}`
        }
    });
}
const chatAppPostRequest = async (subUrl: string, payload?: any, authorization?: string) => {
    return await axios.post(CHAT_APP_BASE_URL + subUrl, payload, authorization === undefined ? undefined : {
        headers: {
            Authorization: `Bearer ${authorization}`
        }
    });
}
const chatAppDeleteRequest = async (subUrl: string, authorization?: string) => {
    return await axios.delete(CHAT_APP_BASE_URL + subUrl, authorization === undefined ? undefined : {
        headers: {
            Authorization: `Bearer ${authorization}`
        }
    });
}
const chatAppPatchRequest = async (subUrl: string, payload?: any, authorization?: string) => {
    return await axios.patch(CHAT_APP_BASE_URL + subUrl, payload, authorization === undefined ? undefined : {
        headers: {
            Authorization: `Bearer ${authorization}`
        }
    });
}

export const CumailNEXTChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { getSession } = useCumailNEXTAuth() as CumailNEXTAuthContextType;
    const [lastError, setLastError] = useState({} as AxiosErrorResponse);
    const [ roomConnectionData, setRoomConnectionData ] = useState({ roomId: "", roomName: "" } as RoomConnectionData);
    const currentRoomConnection = useRef<signalR.HubConnection | null>(null);
    const receiveMessageEvent = useRef<MessageReceivedCallback | null>(null);


    function pushError(exception: any){
        setLastError((exception as AxiosError).response as AxiosErrorResponse);
    }
    function resolveError(){
        setLastError({});
    }
    async function getUserProfile(uid: string): Promise<UserProfileFull> {
        const defaultValue: UserProfileFull = {
            userId: "",
            userName: "",
            profilePictureUrl: "",
            description: "",
            disabled: false,
            deleted: false
        };
        try {
            const response = await chatAppGetRequest(`user?id=${uid}`, getSession().idToken);
            if (response.status !== 200) {
                setLastError(response.data);
                return defaultValue;
            }
            return response.data as UserProfileFull;
        } catch (exception: any){
            pushError(exception);
            return defaultValue;
        }
    }
    async function selfFetchProfile(): Promise<UserProfileFull> {
        return await getUserProfile(getSession().userId);
    }
    async function getUserRoomAffiliations(uid: string): Promise<UserRoomAffiliation[]> {
        const defaultValue: UserRoomAffiliation[] = [];
        try {
            const response = await chatAppGetRequest(`joined_room?userId=${uid}`, getSession().idToken);
            if (response.status !== 200) {
                setLastError(response.data);
                return defaultValue;
            }
            return response.data as UserRoomAffiliation[];
        } catch (exception: any){
            pushError(exception);
            return defaultValue;
        }
    }
    async function getRoomProfile(roomId: string): Promise<RoomProfileFull> {
        const defaultValue: RoomProfileFull = {
            roomId: "",
            roomName: "",
            description: "",
            createdAt: 0,
            lastActivity: 0,
            isPublic: false,
            hashedPassword: "",
            maxUsers: -1
        }
        try {
            const response = await chatAppGetRequest(`room?id=${roomId}`, getSession().idToken);
            if (response.status !== 200){
                setLastError(response.data);
                return defaultValue;
            }
            return response.data as RoomProfileFull;
        } catch (exception: any){
            pushError(exception);
        }
        return defaultValue;
    }
    async function getRoomMembers(roomId: string){
        try {
            const response = await chatAppGetRequest(`room_members?roomId=${roomId}`, getSession().idToken);
            if (response.status !== 200) return [] as UserRoomAffiliation[];
            return response.data as UserRoomAffiliation[];
        } catch (exception){
            pushError(exception);
            return [] as UserRoomAffiliation[];
        }
    }
    async function selfUserRoomAffiliations() {
        return await getUserRoomAffiliations(getSession().userId);
    }
    async function changeRoom(roomId: string): Promise<boolean> {
        await currentRoomConnection.current?.stop();
        currentRoomConnection.current = null;
        // console.log("Old WebSocket connection closed");
        if (roomId === "") {
            setRoomConnectionData({ roomId: "", roomName: "" });
            return true;
        }
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(CHAT_APP_WEBSOCKET_URL + `?idToken=${getSession().idToken}&roomId=${roomId}`)
            .withAutomaticReconnect().build();
        try {
            const roomProfile = await getRoomProfile(roomId);
            if (roomProfile.roomId !== roomId) return false;
            await newConnection.start();
            console.log("New WebSocket connection opened");
            currentRoomConnection.current = newConnection;
            currentRoomConnection.current?.on("ReceiveMessage", (message: MessageFull) => {
                if (receiveMessageEvent.current !== null)
                    receiveMessageEvent.current(message);
            });
            setRoomConnectionData({
                roomId: roomId,
                roomName: roomProfile.roomName
            });
            return true;
        } catch (exception: any){
            pushError(exception);
            return false;
        }
    }
    function onMessageReceived(handler: MessageReceivedCallback) {
        receiveMessageEvent.current = handler;
    }
    async function sendMessage(content: string){
        await currentRoomConnection.current?.invoke("SendMessage", {
            senderId: getSession().userId,
            messageContent: content,
            clientStamp: Date.now()
        });
    }
    async function sendMessageManual(message: MessageWebSocketSubmitForm){
        await currentRoomConnection.current?.invoke("SendMessage", message);
    }
    async function getLatestMessages(amount: number){
        const defaultValue = { messages: [] } as MessagesResponse;
        if (roomConnectionData.roomId === "") return defaultValue;
        try {
            const response = await chatAppGetRequest(`messages?endAt=${amount}&roomId=${roomConnectionData.roomId}&order=0`, getSession().idToken);
            if (response.status !== 200){
                setLastError(response.data);
                return defaultValue;
            }
            return response.data as MessagesResponse;
        } catch (exception: any){
            pushError(exception);
            return defaultValue;
        }
    }
    async function createChatBoard(roomName: string) {
        try {
            const response = await chatAppPostRequest(`create_room`, {
                roomName: roomName
            }, getSession().idToken);
            return response.status === 200;
        } catch (exception){
            pushError(exception);
            return false;
        }
    }
    async function joinChatBoard(invitation: string) {
        try {
            const response = await chatAppPostRequest(`join_room`, {
                invitationId: invitation
            }, getSession().idToken);
            return response.status === 200;

        } catch (exception){
            pushError(exception);
            return false;
        }
    }
    async function kickFromRoom(userId: string, roomId: string): Promise<boolean> {
        try {
            const response = await chatAppDeleteRequest(`remove_from_room?userId=${userId}&roomId=${roomId}`, getSession().idToken);
            return response.status === 200;
        } catch (exception){
            pushError(exception);
            return false;
        }
    }
    async function leaveRoom(roomId: string) {
        return await kickFromRoom(getSession().userId, roomId);
    }
    async function changeRoomName(roomId: string, newRoomName: string){
        try {
            const response = await chatAppPatchRequest(`change_room_name`, {
                roomName: newRoomName,
                roomId: roomId
            }, getSession().idToken);
            return response.status === 200;
        } catch (exception){
            pushError(exception);
            return false;
        }
    }
    async function getInvitations(roomId: string) {
        try {
            const response = await chatAppGetRequest(`invitations?roomId=${roomId}`, getSession().idToken);
            if (response.status !== 200) return [] as InvitationFull[];
            return response.data as InvitationFull[];
        } catch (exception){
            pushError(exception);
            return [] as InvitationFull[];
        }
    }
    async function createInvitation(roomId: string, invitation: string) {
        try {
            const response = await chatAppPostRequest(`create_invitation`, {
                invitationString: invitation,
                instigatorId: getSession().userId,
                chatRoomId: roomId,
                isEnabled: true,
            }, getSession().idToken);
            return response.status === 200;
        } catch (exception){
            pushError(exception);
            return false;
        }
    }
    async function deleteInvitation(invitation: string){
        try {
            const response = await chatAppDeleteRequest(`remove_invitation?inv=${invitation}`, getSession().idToken);
            return response.status === 200;
        } catch (exception){
            pushError(exception);
            return false;
        }
    }
    const value: CumailNEXTChatContextType = {
        lastError: lastError,
        roomConnectionData: roomConnectionData,
        resolveError: resolveError,
        getUserProfile: getUserProfile,
        selfFetchProfile: selfFetchProfile,
        getUserRoomAffiliations: getUserRoomAffiliations,
        selfUserRoomAffiliations: selfUserRoomAffiliations,
        getRoomProfile: getRoomProfile,
        getRoomMembers: getRoomMembers,
        changeRoom: changeRoom,
        sendMessage: sendMessage,
        sendMessageManual: sendMessageManual,
        onMessageReceived: onMessageReceived,
        getLatestMessages: getLatestMessages,
        createChatBoard: createChatBoard,
        joinChatBoard: joinChatBoard,
        changeRoomName: changeRoomName,
        kickFromRoom: kickFromRoom,
        leaveRoom: leaveRoom,
        getInvitations: getInvitations,
        createInvitation: createInvitation,
        deleteInvitation: deleteInvitation,
    }
    return (<CumailNEXTChatContext.Provider value={value}>
        { children }
    </CumailNEXTChatContext.Provider>)
}
