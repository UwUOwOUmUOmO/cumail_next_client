import SideBar from './SideBar';
import ContextBar from "./ContextBar.tsx";
import {useCumailNEXTChat} from "../contexts/CumailNEXTChatProvider.tsx";
import { BsHash } from 'react-icons/bs';
import {
    CumailNEXTChatContextType, MessageFull, UserProfileFull,
    UserRoomAffiliation
} from "../contexts/CumailNEXTChatContextType.ts";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {HiOutlineUserCircle} from "react-icons/hi";
import {Link} from "react-router-dom";
import {useCumailNEXTAuth} from "../contexts/CumailNEXTAuthProvider.tsx";
import {CumailNEXTAuthContextType} from "../contexts/CumailNEXTAuthContextType.ts";
import {AiOutlineMinus} from "react-icons/all";
import {JoinButtonHandled, Dialog, ConfirmationBox} from "./BigShinyButton.tsx";

const MAX_MESSAGES_PER_POOL = 50;

const BoardsBarHeader = () => {
    return <div className='channel-block'>
        <h5 className='channel-block-text'>Joined boards</h5>
    </div>
}

const BoardBar: React.FC<{ rerenderCount: number }> = ({ rerenderCount }) => {
    const { selfUserRoomAffiliations, changeRoom } = useCumailNEXTChat() as CumailNEXTChatContextType;
    const [ content, setContent ] = useState([] as UserRoomAffiliation[]);
    const [leaveRoomTrigger, setLeaveRoom] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setContent([]);
        setLoading(true);
        selfUserRoomAffiliations().then(re => {
            setContent(re);
            setLoading(false);
        });
    }, [rerenderCount, leaveRoomTrigger]);



    return <div className='channel-container'>
        { !loading ? content.map((stuff, index)=> {
            return <BoardDisplay key={index} setLeaveRoom={setLeaveRoom} affiliation={stuff} onClick={() => {
                changeRoom(stuff.chatRoomId).then(r => console.log("Room changed successfully?", r));
            }}/>
        }) : <div className="dropdown-selection group w-full text-gray-200 font-bold">
            Loading...
        </div> }
    </div>
}

const BoardDisplay: React.FC<({ affiliation: UserRoomAffiliation, onClick?: () => void, setLeaveRoom: React.Dispatch<React.SetStateAction<number>> })> = ({ affiliation, onClick, setLeaveRoom }) => {
    const { getRoomProfile, leaveRoom, changeRoom, roomConnectionData } = useCumailNEXTChat() as CumailNEXTChatContextType;
    const [ boardName, setBoardName ] = useState("");
    const [showLeaveRoom, setShowLeaveRoom] = useState(false);
    const submitRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        getRoomProfile(affiliation.chatRoomId).then(re => {
            setBoardName(re.roomName);
        });
    }, []);

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        if (submitRef.current) submitRef.current.disabled = true;
        await leaveRoom(affiliation.chatRoomId);
        setLeaveRoom(r => r + 1);
        setShowLeaveRoom(false);
        if (submitRef.current) submitRef.current.disabled = false;
        changeRoom("").then(_r => { return; });
    }

    return <div className='dropdown-selection group w-full'>
        <BsHash onClick={onClick} size='24' className={`${roomConnectionData.roomId === affiliation.chatRoomId ? "text-purple-600" : "text-gray-400"} transition duration-300 ease-in-out group-hover:text-fuchsia-500`} />
        <h5 onClick={onClick} className={`dropdown-selection-text ${roomConnectionData.roomId === affiliation.chatRoomId ? "text-purple-700" : "text-gray-500"} group-hover:text-fuchsia-600`}>{boardName}</h5>
        <div className="text-gray-400 transition ml-auto mr-4">
            <AiOutlineMinus className="duration-300 ease-in-out hover:text-rose-700" onClick={() => {
                if (boardName === "") return;
                setShowLeaveRoom(true);
            }}/>
            <span className="leave-room-tooltip group-hover:scale-100">
				{ boardName === "" ? "Loading..." : `Leave ${boardName}` }
			</span>
        </div>
        { !showLeaveRoom ? undefined :
        <ConfirmationBox submitRef={submitRef} header="Are you sure?" onClose={() => { setShowLeaveRoom(false); }} onSubmit={handleSubmit}>
            <div className="mt-8 space-y-6 w-80 text-gray-300">
                Are you sure you want to leave <span className="font-bold">{boardName}</span>?
            </div>
        </ConfirmationBox>}
    </div>
}


const isValidURL = (text: string) => {
    const pattern = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;
    // var pattern = new RegExp("[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)");
    return pattern.test(text);
}

const isImageLink = (text: string) => {
    const isURL = isValidURL(text);
    if (!isURL) return false;
    const imageRegex = /(?:https?:\/\/.*\.(?:png|jpg|jpeg|gif))/
    const testResult = text.match(imageRegex);
    return (testResult && testResult[0])
}

const getYoutubeVideoId = (url: string) => {
    const youtubeUrlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/
    const match = url.match(youtubeUrlRegex);
    // ["https://www.youtube.com/watch?v=", "dQw4w9WgXcQ"]
    if (match && match[1]) {
        return match[1];
    } else {
        return "";
    }
}

const RenderYoutubeVideo: React.FC<{ link: string }> = ({link}) => {
    return (
        <iframe width="533" height="300" src={`https://www.youtube-nocookie.com/embed/${link}`} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen={true}>
        </iframe>
    );
}

// const xssCleanse = (content: string) => {
//     const lt = /</g;
//     const gt = />/g;
//     const ap = /'/g;
//     const ic = /"/g;
//     return content.replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");
// }

const ChatBubbleDelegate: React.FC<{ content: string }> = ({ content }) => {
    const cleansedContent = content;
    const isURL = isValidURL(cleansedContent);
    const isImg = isImageLink(cleansedContent);
    const youtubeVideoId = getYoutubeVideoId(cleansedContent);
    const isYoutubeUrl = (youtubeVideoId !== "");
    return (
        <>
            {
                isYoutubeUrl ? <RenderYoutubeVideo link={youtubeVideoId}/> :
                    (isImg ? <img src={cleansedContent} alt="linked photo"/> :
                        (isURL ? <Link className='px-4 inline-block text-purple-300 underline' to={cleansedContent}>{cleansedContent}</Link> :
                            <span className="px-4 inline-block text-gray-300">{cleansedContent}</span>))
            }
        </>
    )
}

const ChatBubble: React.FC<{ message: MessageFull, nextMessage: MessageFull | null, users: Map<string, UserProfileFull> }> = ({ message, nextMessage, users }) => {
    const specifiedUser = users.get(message.senderId);
    const isLastMessageSameSender = nextMessage === null ? false : nextMessage.senderId === message.senderId;
    // console.log(`Message: ${message.messageContent}:`, isLastMessageSameSender)
    return <div>
        <div className={`flex items ${isLastMessageSameSender ? "" : ""}`}>
            <div className={`chatmessage-wrap ${isLastMessageSameSender ? "" : "space-y-2"}`}>
                { isLastMessageSameSender ? undefined : <div className="chatmessage-message">{ specifiedUser ? specifiedUser.userName : "<unknown>" }</div> }
                <ChatBubbleDelegate content={message.messageContent}/>
            </div>
            <HiOutlineUserCircle size={30} className={isLastMessageSameSender ? "invisible" : ""}/>
        </div>
    </div>
}

const MessagesDisplay: React.FC<{ messagesSet: MessageFull[], users: Map<string, UserProfileFull> }> = ({ messagesSet, users }) => {
    // console.log("Messages:",messagesSet);
    // console.log("Users:", users)

    return (<>
        { messagesSet.map((item, index, array) => <ChatBubble key={index} message={item} users={users} nextMessage={ index === array.length - 1 ? null : array[index + 1] as MessageFull }/>) }
        </>)
}

const ChatBox = () => {
    const dummyRef = useRef<HTMLDivElement>(null);
    const chatBoxRef = useRef<HTMLInputElement | null>(null);
    const { getSession } = useCumailNEXTAuth() as CumailNEXTAuthContextType;
    const { roomConnectionData, getUserProfile, getLatestMessages, onMessageReceived, sendMessageManual } = useCumailNEXTChat() as CumailNEXTChatContextType;
    const [fetchedMessages, setFetchedMessages] = useState([] as MessageFull[]);
    const [streamedMessages, setStreamedMessages] = useState([] as MessageFull[]);
    const [userInfoMap, setUserInfoMap] = useState(new Map<string, UserProfileFull>());
    const messagesSet = useMemo(() => {
        const re = streamedMessages.slice(0).concat(fetchedMessages);
        if (re.length > MAX_MESSAGES_PER_POOL) messagePoolCleanup();
        return re;
    }, [fetchedMessages, streamedMessages]);

    function messagePoolCleanup(){
        // (50 + 1) - 50 = 1
        const removalAmount = (fetchedMessages.length + streamedMessages.length) - MAX_MESSAGES_PER_POOL;
        let fetchedPoolCleanupAmount = 0;
        if (removalAmount <= 0) return;
        if (fetchedMessages.length > 0) setFetchedMessages(m => {
            // 50 - 1 = 49
            fetchedPoolCleanupAmount = Math.max(m.length - removalAmount, 0);
            return m.slice(0, fetchedPoolCleanupAmount)
        });
        if (fetchedPoolCleanupAmount + removalAmount === MAX_MESSAGES_PER_POOL) return;
        setStreamedMessages(m => m.slice(0, Math.max(m.length - (removalAmount - fetchedPoolCleanupAmount))));
    }
    async function userCacheHandler(message: MessageFull){
        if (!userInfoMap.has(message.senderId)){
            const profile = await getUserProfile(message.senderId);
            setUserInfoMap(m => {
                m.set(message.senderId, profile);
                return m;
            });
        }
    }
    async function newConnection(){
        setStreamedMessages([]);
        setFetchedMessages([]);
        const messagesFetched = await getLatestMessages(50);
        for (let i = 0; i < messagesFetched.messages.length; i++){
            const message = messagesFetched.messages[i];
            await userCacheHandler(message);
        }
        // console.log("Messages:", messagesFetched);
        setFetchedMessages(messagesFetched.messages);
    }
    function ownerSenderHandler(message: MessageFull) {
        setStreamedMessages(m => {
            const originalLength = m.length;
            for (let i = 0; i < originalLength; i++){
                const evaluating = m[i];
                if (evaluating.messageId === ""
                 && evaluating.clientStamp === message.clientStamp
                 && evaluating.senderId === message.senderId
                 && evaluating.roomId === message.roomId){
                    return m.slice(0, i).concat([message]).concat(m.slice(i + 1, originalLength));
                }
            }
            return [message].concat(m);
        });
    }
    async function incomingMessageHandler(message: MessageFull){
        await userCacheHandler(message);
        // Optimistic update emplacement
        if (message.senderId === getSession().userId) ownerSenderHandler(message);
        else setStreamedMessages(m => [message].concat(m));
    }
    async function senMessageHandler(content: string){
        // Optimistic update
        const deFacto: MessageFull = {
            messageId: "",
            senderId: getSession().userId,
            roomId: roomConnectionData.roomId,
            messageContent: content,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            clientStamp: Date.now()
        }
        await userCacheHandler(deFacto);
        setStreamedMessages(m => [deFacto].concat(m));
        await sendMessageManual({
            senderId: getSession().userId,
            messageContent: content,
            clientStamp: deFacto.clientStamp
        });
    }
    useEffect(() => {
        newConnection().then(() => { return; });
    }, [roomConnectionData]);

    useEffect(() => {
        onMessageReceived((message: MessageFull) => {
            incomingMessageHandler(message).then(() => { return; });
        });
    }, []);

    const handleSubmit: React.KeyboardEventHandler<HTMLInputElement> = async (event) => {
        if (!chatBoxRef.current) return;
        if (event.key === "Enter"){
            const msg = chatBoxRef.current.value;
            chatBoxRef.current.value = "";
            dummyRef.current?.scrollIntoView({
                behavior: "smooth"
            });
            await senMessageHandler(msg);
        }
    };

    return <div className={"flex flex-col w-full h-screen"}>
        <div className='chatroom'>
            <div className={`shadow-md w-full py-5 px-4 font-bold text-gray-300 text-lg ${roomConnectionData.roomName === "" ? "invisible" : ""}`}>
                { roomConnectionData.roomName }
            </div>
            <div className='chatroom-chatbox sm:px-6'>
                <div id="messages" className='chatroom-chatbox-wrap'>
                    <div ref={dummyRef}/>
                    <MessagesDisplay messagesSet={messagesSet} users={userInfoMap}/>
                </div>
            </div>
            { roomConnectionData.roomId === "" ? undefined :
                <div className="chatroom-input sm:p-6">
                    <div className="relative flex">
                        <input ref={chatBoxRef} onKeyDown={handleSubmit} type="text" placeholder="Start chatting..." className="chatroom-input-real"></input>
                    </div>
                </div> }
        </div>
    </div>
}

type DialogPayload = {
    show: boolean,
    header: string,
    content: string,
}

const ChatHub = () => {
    const { lastError, resolveError } = useCumailNEXTChat() as CumailNEXTChatContextType;
    const [rerenderCount, setRerenderCount] = useState(0);
    const [dialogPayload, setDialogPayload] = useState({ show: false, header: "", content: "" } as DialogPayload);

    useEffect(() => {
        if (lastError && Object.keys(lastError).length !== 0){
            setDialogPayload({
                show: true,
                header: "Error",
                content: `Error code ${lastError.status}: ${lastError.data}`
            });
        } else setDialogPayload({ show: false, header: "", content: "" });
        console.log("Chat App Error:", lastError);
    }, [lastError]);
    return (<div className='flex bg-slate-600'>
        <SideBar />
        { dialogPayload.show ? <Dialog content={dialogPayload.content} header={dialogPayload.header} onClose={() => {
            resolveError();
            // setDialogPayload({ show: false, header: "", content: "" });
        }}/> : undefined }
        <ContextBar>
            <BoardsBarHeader/>
            <BoardBar rerenderCount={rerenderCount}/>
            <JoinButtonHandled onJoinSuccess={()=> {
                setRerenderCount(r => r + 1);
                return true;
            }} onJoinFailed={()=> {
                return true;
            }} />
        </ContextBar>
        <ChatBox/>
    </div>)
}

export default ChatHub;
