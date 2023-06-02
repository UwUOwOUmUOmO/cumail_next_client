import SideBar from "./SideBar.tsx";
import ContextBar from "./ContextBar.tsx";
import React, {useEffect, useRef, useState} from "react";
import {useCumailNEXTChat} from "../contexts/CumailNEXTChatProvider.tsx";
import {
    CumailNEXTChatContextType, InvitationFull,
    RoomProfileFull, UserProfileFull,
    UserRoomAffiliation
} from "../contexts/CumailNEXTChatContextType.ts";
import {BsFillClipboardFill, BsHash} from "react-icons/bs";
import {
    BigShinyButton, ConfirmationBox,
    CreateNewBoardHandled,
    CreateNewInvitationHandled,
    Dialog
} from "./BigShinyButton.tsx";
import {ImCancelCircle} from "react-icons/all";

const BoardsBarHeader = () => {
    return <div className='channel-block'>
        <h5 className='channel-block-text'>Boards management</h5>
    </div>
}

const BoardBar: React.FC<{ upperLevelRerenderTrigger: number, setBoard: React.Dispatch<React.SetStateAction<UserRoomAffiliation | null>> }> = ({ upperLevelRerenderTrigger, setBoard }) => {
    const { selfUserRoomAffiliations } = useCumailNEXTChat() as CumailNEXTChatContextType;
    const [ content, setContent ] = useState([] as UserRoomAffiliation[]);
    const [loading, setLoading] = useState(false);
    const [rerenderCount, setRerenderCount] = useState(0);

    useEffect(() => {
        setLoading(true);
        selfUserRoomAffiliations().then(re => {
            setContent(re);
            setLoading(false);
        });
    }, [rerenderCount, upperLevelRerenderTrigger]);



    return <div className='channel-container'>
        { !loading ? content.map((stuff, index)=> {
            return <BoardDisplay key={index} affiliation={stuff} onClick={() => {
                setBoard(stuff);
            }}/>
        }) : <div className="dropdown-selection group w-full text-gray-200 font-bold">
            Loading...
        </div>}
        <CreateNewBoardHandled onSuccess={() => { setRerenderCount(r => r + 1); return true; }} />
    </div>
}

const BoardDisplay: React.FC<({ affiliation: UserRoomAffiliation, onClick?: () => void })> = ({ affiliation, onClick }) => {
    const { getRoomProfile } = useCumailNEXTChat() as CumailNEXTChatContextType;
    const [ boardName, setBoardName ] = useState("");

    useEffect(() => {
        getRoomProfile(affiliation.chatRoomId).then(re => {
            setBoardName(re.roomName);
        });
    }, []);

    return <div onClick={onClick} className='dropdown-selection text-gray-500 group w-full'>
        <BsHash size='24' className='text-gray-400 transition duration-300 ease-in-out group-hover:text-fuchsia-600' />
        <h5 className='dropdown-selection-text group-hover:text-fuchsia-600'>{boardName}</h5>
    </div>
}

const MiniPanel: React.FC<{ panelName?: string, children?: React.ReactNode }> = ({ panelName, children }) => {
    return <div className="bg-sidebar rounded-lg shadow-lg pt-8 pb-4 px-10 my-5 text-gray-200">
        { panelName ? <div className="mb-2 items-start text-align-left text-xl font-bold tracking-tight text-gray-300">
            { panelName }
        </div> : undefined }
        { children }
    </div>
}

const BoardNameManager: React.FC<{ rerenderTrigger: React.Dispatch<React.SetStateAction<number>>, roomProfile: RoomProfileFull | null, affiliation: UserRoomAffiliation | null }> = ({ rerenderTrigger, roomProfile, affiliation }) => {
    const nameRef = useRef<HTMLInputElement | null>(null);
    const submitRef = useRef<HTMLButtonElement | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const {changeRoomName} = useCumailNEXTChat() as CumailNEXTChatContextType;
    const [allowChangeName, setAllowChangeName] = useState(false);
    
    useEffect(() => {
        if (nameRef.current) nameRef.current.value = roomProfile !== null ? roomProfile.roomName : "";
    }, [roomProfile]);

    useEffect(() => {
        // if (nameRef.current) nameRef.current.value = "";
        if (!submitRef.current || !affiliation) setAllowChangeName(false);
        else setAllowChangeName(affiliation.role >= 4);
    }, [affiliation, submitRef]);
    useEffect(() => {
        if (submitRef.current) submitRef.current.disabled = !allowChangeName;
    }, [allowChangeName]);

    const changeNameHandler = async () => {
        const newName = nameRef.current ? nameRef.current?.value : "";
        const roomId = roomProfile ? roomProfile.roomId : "";
        if (newName === "" || roomId === "") return;
        if (submitRef.current) submitRef.current.disabled = true;
        const result = await changeRoomName(roomId, newName);
        if (result) {
            setShowSuccess(true);
            rerenderTrigger(r => r + 1);
        }
        if (submitRef.current) submitRef.current.disabled = false;
    }

    return <MiniPanel panelName="Board's name">
        <div className={"my-3"}>
            <input readOnly={affiliation === null ? true : affiliation.role < 4} required placeholder={"Put your board's name here"} ref={nameRef} className={"w-full block rounded-lg bg-chatbox py-2 px-4"}/>
            <div className={`flex flex-row-reverse`}>
                <BigShinyButton text={"Change name"} onClick={async () => { await changeNameHandler(); }} />
            </div>
        </div>
        { showSuccess ? <Dialog onClose={() => { setShowSuccess(false); }} header={"Success"} content={"Board's name changed successfully"} /> : undefined }
    </MiniPanel>
}

const InvitationBaseSlot: React.FC<{ inv: InvitationFull }> = ({ inv }) => {
    const nameRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (nameRef.current) nameRef.current.value = inv.invitationString;
    }, [inv]);

    return <input ref={nameRef} readOnly={true} className={"w-full block rounded-lg bg-chatbox py-2 px-4 my-3"}/>
}

const InvitationFullSlot: React.FC<{ inv: InvitationFull, deleteTrigger: React.Dispatch<InvitationFull | null> }> = ({ inv, deleteTrigger }) => {
    return <div className={"w-full flex flex-row"}>
        <InvitationBaseSlot inv={inv} />
        <div className={"ml-2 flex flex-row"}>
            <div className="sidebar-icon mx-1 group" onClick={async () => { await navigator.clipboard.writeText(inv.invitationString); }}>
                <BsFillClipboardFill className={""} size={28} />
                <span className="inv-tooltip-bottom group-hover:scale-100">Copy invitation</span>
            </div>
            <div className="inv_remove-icon group" onClick={() => { deleteTrigger(inv); }}>
                <ImCancelCircle className={""} size={28} />
                <span className="inv-tooltip-bottom group-hover:scale-100">Remove</span>
            </div>
        </div>
    </div>
}

const InvitationManager: React.FC<{ roomProfile: RoomProfileFull | null, affiliation: UserRoomAffiliation | null }> = ({ roomProfile, affiliation }) => {
    const [renderCount, setRenderCount] = useState(0);
    const [invitations, setInvitations] = useState([] as InvitationFull[]);
    const [showWarning, setShowWarning] = useState<InvitationFull | null>(null);
    const { getInvitations, deleteInvitation } = useCumailNEXTChat() as CumailNEXTChatContextType;

    function resetInvitationsList() {
        // console.log("State:", roomProfile, affiliation, affiliation?.role);
        if (!roomProfile || !affiliation || affiliation.role < 4) {
            setInvitations([]);
            return;
        }
        getInvitations(affiliation.chatRoomId).then(r => {
            setInvitations(r);
        })
    }
    useEffect(() => {
        resetInvitationsList()
    }, [renderCount, roomProfile, affiliation]);

    const deleteHandler: React.FormEventHandler<HTMLFormElement> = async (event) =>{
        event.preventDefault();
        if (!showWarning) return;
        const inv = showWarning.invitationString;
        setShowWarning(null);
        const result = await deleteInvitation(inv);
        if (result) setRenderCount(r => r + 1);
        // setShowSuccess(result);
    }

    return <MiniPanel panelName="Invitations">
        <div className={"overflow-y-auto overflow-x-hidden max-h-50"}>
            { invitations.map((value, index) => {
                return <InvitationFullSlot inv={value} key={index} deleteTrigger={setShowWarning} />
            }) }
        </div>
        { !showWarning ? undefined :
            <ConfirmationBox onSubmit={deleteHandler} onClose={() => { setShowWarning(null); }} header={"Delete invitation?"}>
                <div className={"text-md"}>
                    Are you sure you want to delete invitation <span className={"font-bold"}>{ showWarning.invitationString }</span>?
                </div>
            </ConfirmationBox> }
        { roomProfile ? <CreateNewInvitationHandled onSuccess={() => {
            setRenderCount(r => r + 1);
            return true;
        }} forBoardId={roomProfile.roomId} forBoardName={roomProfile.roomName} /> : undefined }
    </MiniPanel>
}

const MemberEntry: React.FC<{ member: UserRoomAffiliation, currentUserAffiliation: UserRoomAffiliation, deleteTrigger: React.Dispatch<UserProfileFull | null> }> = ({ member, currentUserAffiliation, deleteTrigger }) => {
    const [fullProfile, setFullProfile] = useState<UserProfileFull | null>(null);
    const {getUserProfile} = useCumailNEXTChat() as CumailNEXTChatContextType;
    const nameRef = useRef<HTMLInputElement | null>(null);

    // { fullProfile ? fullProfile.userName : "Loading..." }
    useEffect(() => {
        getUserProfile(member.userId).then(r => {
            setFullProfile(r);
            if (nameRef.current) nameRef.current.value = r.userName;
        })
    }, [member]);

    return <div className={"w-full flex flex-row"}>
        {/*<InvitationBaseSlot inv={inv} />*/}
        <input ref={nameRef} readOnly={true} className={`w-full block rounded-lg bg-chatbox py-2 px-4 my-3 ${ (member && member.userId === currentUserAffiliation.userId ? "text-teal-300" : "") }`} />
            <div className={"ml-2 flex flex-row"}>
                <div className="sidebar-icon mx-1 group" onClick={async () => { await navigator.clipboard.writeText(member ? member.userId : ""); }}>
                    <BsFillClipboardFill className={""} size={28} />
                    <span className="inv-tooltip-bottom group-hover:scale-100">Copy UID</span>
                </div>
                { currentUserAffiliation.role > member.role && currentUserAffiliation.role >= 4 ?
                    <div className="inv_remove-icon mx-1 group" onClick={() => { deleteTrigger(fullProfile); }}>
                        <ImCancelCircle className={""} size={28} />
                        <span className="inv-tooltip-bottom group-hover:scale-100">Remove</span>
                    </div>
                : undefined }
            </div>
    </div>
}

const MembersManager: React.FC<{ roomProfile: RoomProfileFull | null, affiliation: UserRoomAffiliation | null }> = ({ roomProfile, affiliation }) =>{
    const [showWarning, setShowWarning] = useState<UserProfileFull | null>(null);
    const [renderCount, setRenderCount] = useState(0);
    const [membersList, setMembersList] = useState([] as UserRoomAffiliation[]);
    const {getRoomMembers, kickFromRoom} = useCumailNEXTChat() as CumailNEXTChatContextType;

    function resetMembersList(){
        if (!roomProfile || !affiliation) {
            setMembersList([]);
            return;
        }
        getRoomMembers(affiliation.chatRoomId).then(r => {
            setMembersList(r);
        });
    }
    useEffect(() => {
        resetMembersList();
    }, [renderCount, roomProfile, affiliation])

    const deleteHandler: React.FormEventHandler<HTMLFormElement> = async (event) =>{
        event.preventDefault()
        if (!showWarning || !affiliation) return;
        const kickTarget = showWarning.userId;
        setShowWarning(null);
        const result = await kickFromRoom(kickTarget, affiliation.chatRoomId);
        if (result) setRenderCount(r => r + 1);
    }

    return <MiniPanel panelName={"Members"}>
        { !showWarning ? undefined :
            <ConfirmationBox onSubmit={deleteHandler} onClose={() => { setShowWarning(null); }} header={"Kick member?"}>
                <div className={"text-md"}>
                    Are you sure you want to kick user <span className={"font-bold"}>{ showWarning.userName }</span>?
                </div>
            </ConfirmationBox> }
        { !affiliation ? undefined :
            <div className={"overflow-y-auto overflow-x-hidden max-h-50"}>
                { membersList.map((value, index) => {
                    return <MemberEntry deleteTrigger={setShowWarning} key={index} member={value} currentUserAffiliation={affiliation} />
                }) }
            </div>}
    </MiniPanel>
}

const RestrictedBoardName: React.FC<{ roomId: string }> = ({ roomId }) => {
    const nameRef = useRef<HTMLInputElement | null>(null);
    const {getRoomProfile} = useCumailNEXTChat() as CumailNEXTChatContextType;

    useEffect(() => {
        getRoomProfile(roomId).then(r => {
            if (r.roomId !== roomId || !nameRef.current) return;
            nameRef.current.value = r.roomName;
        });
    }, [])

    return <MiniPanel panelName="Board's name">
        <input required placeholder={"Put your board's name here"} ref={nameRef} className={"w-full block rounded-lg bg-chatbox py-2 px-4 pb-2"}/>
    </MiniPanel>
}

const ManagementPanel: React.FC<{ rerenderTrigger: React.Dispatch<React.SetStateAction<number>>, selectedBoard: UserRoomAffiliation | null }> = ({ rerenderTrigger, selectedBoard }) => {
    const { getRoomProfile } = useCumailNEXTChat() as CumailNEXTChatContextType;
    const [roomProfile, setRoomProfile] = useState<RoomProfileFull | null>(null);

    useEffect(() => {
        if (selectedBoard !== null){
            getRoomProfile(selectedBoard.chatRoomId).then(r => {
               setRoomProfile(r);
            });
        } else setRoomProfile(null);
    }, [selectedBoard]);

    return <div>
        <div className='chatroom'>
            { roomProfile === null || selectedBoard === null ? undefined :
                <>
                    <h5 className={`shadow-md w-full py-5 px-4 font-bold text-gray-300 text-lg ${roomProfile.roomName === "" ? "invisible" : ""}`}>
                        Board's management
                    </h5>
                    <div className="flex flex-col h-screen overflow-y-auto overflow-x-hidden p-4">
                    { selectedBoard.role >= 4 ?
                        <>
                            <BoardNameManager rerenderTrigger={rerenderTrigger} affiliation={selectedBoard} roomProfile={roomProfile} />
                            <InvitationManager affiliation={selectedBoard} roomProfile={roomProfile} />
                        </> : <RestrictedBoardName roomId={selectedBoard.chatRoomId} />}
                        <MembersManager affiliation={selectedBoard} roomProfile={roomProfile} />
                    </div>
                </>}
        </div>
    </div>
}

type DialogPayload = {
    show: boolean,
    header: string,
    content: string,
}

const BoardManagement = () => {
    const [selectedBoard, setSelectedBoard] = useState<UserRoomAffiliation | null>(null);
    const [upperMostLevelRerenderTrigger, setRerender] = useState(0);
    const { lastError, resolveError } = useCumailNEXTChat() as CumailNEXTChatContextType;
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

    return <div className='flex bg-slate-600'>
        <SideBar />
        { dialogPayload.show ? <Dialog content={dialogPayload.content} header={dialogPayload.header} onClose={() => {
            resolveError();
        }}/> : undefined }
        <ContextBar>
            <BoardsBarHeader />
            <BoardBar upperLevelRerenderTrigger={upperMostLevelRerenderTrigger} setBoard={setSelectedBoard} />
        </ContextBar>
        <div className="chatroom">
            <ManagementPanel rerenderTrigger={setRerender} selectedBoard={selectedBoard} />
        </div>
    </div>
}

export default BoardManagement;
