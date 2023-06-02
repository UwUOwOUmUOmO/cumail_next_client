import React, {useRef, useState} from "react";
import {BsPlusCircleFill} from "react-icons/bs";
import {AiOutlinePlus, MdOutlineCreate} from "react-icons/all";
import {Button, Form} from "react-bootstrap";
import {useCumailNEXTChat} from "../contexts/CumailNEXTChatProvider.tsx";
import {CumailNEXTChatContextType} from "../contexts/CumailNEXTChatContextType.ts";

type CallbackType = (() => void) | (() => Promise<void>);
type ReturnedCallbackType = (() => boolean);

export const BigShinyButton: React.FC<{ text?: string, icon?: JSX.Element, onClick?: (() => void) | (() => Promise<void>) }> = ({ text, icon, onClick }) => {
    return <div className="flex flex-col items-center">
        <div className="px-4 py-3 mt-3 rounded-md shadow-md
             text-white bg-btndefault text-sm font-bold flex w-max
             transition-all duration-300 hover:bg-btnactive cursor-pointer" onClick={onClick}>
            <div className="flex w-full mx-6 items-center">
                {icon}
                <div className="ml-2 text-center">
                    { text }
                </div>
            </div>
        </div>
    </div>
}

export const JoinBoardButton: React.FC<{ onClick?: CallbackType }> = ({ onClick }) => {
    return <BigShinyButton text={"Join new board"} icon={<BsPlusCircleFill className="text-gray-200" />} onClick={onClick} />
}

export const CreateBoardButton: React.FC<{ onClick?: CallbackType }> = ({ onClick }) => {
    return <BigShinyButton text={"Create new board"} icon={<MdOutlineCreate className="text-gray-200" />} onClick={onClick} />
}

export const CreateInvitationButton: React.FC<{ onClick?: CallbackType }> = ({ onClick }) => {
    return <div className="flex flex-col items-center">
        <div className="px-4 py-3 mt-3 rounded-md shadow-md
             text-white bg-btndefault text-sm font-bold flex w-full
             transition-all duration-300 hover:bg-btnactive cursor-pointer" onClick={onClick}>
            <div className="flex w-full mx-6 items-center justify-center">
                <AiOutlinePlus className="text-gray-200" />
                <div className="ml-2 text-center">
                    Add invitation
                </div>
            </div>
        </div>
    </div>
}

export const BigBlackBox: React.FC<{ header: string, modalLevel?: string, actionCancel?: CallbackType, children?: React.ReactNode }> = ({ header, modalLevel, children }) => {
    return <div className={`fixed top-0 left-0 w-screen h-screen flex justify-center items-center ${modalLevel ? modalLevel : "modal-2"}`}>
        <div className="flex flex-col top-0 left-0 w-max h-max items-start justify-start">
            <div className="bg-sidebar rounded-lg shadow-lg py-6 px-10">
                <div className='py-5'>
                    <div className='w-full max-w-md space-y-8'>
                        <div className="container border-solid box-border border-indigo-600">
                            <div>
                                <h2 className="mt-3 items-start text-align-left text-xl font-bold tracking-tight text-gray-300">
                                    { header }
                                </h2>
                            </div>
                        </div>
                        { children }
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export const ConfirmationBox: React.FC<{ header: string, customModal?: string, customSubmitMessage?: string, onClose?:CallbackType, onSubmit?: React.FormEventHandler<HTMLFormElement>, children?: React.ReactNode, submitRef?: React.MutableRefObject<HTMLButtonElement | null> }> = ({ header, customModal, customSubmitMessage, onClose, onSubmit, children, submitRef }) => {
    return <BigBlackBox modalLevel={customModal ? customModal : "modal-2"} header={header}>
        <Form onSubmit={onSubmit} className="w-full text-gray-300">
            {children}
            <div className="flex mt-4 flex-row w-full items-end justify-end">
                <Button ref={submitRef} type="submit" className="group login-form-submit mx-2 w-max">
                    {customSubmitMessage ? customSubmitMessage : "Confirm"}
                </Button>
                <button type="button" className="login-form-submit mx-2 w-max" onClick={onClose}>Close</button>
            </div>
        </Form>
    </BigBlackBox>
}

export const JoinButtonHandled: React.FC<{ onJoinSuccess?: ReturnedCallbackType, onJoinFailed?: ReturnedCallbackType }> = ({ onJoinSuccess, onJoinFailed }) => {
    const [showBox, setShowBox] = useState(false);
    const invitationRef = useRef<HTMLInputElement | null>(null);
    const submitRef = useRef<HTMLButtonElement | null>(null);
    const { joinChatBoard } = useCumailNEXTChat() as CumailNEXTChatContextType;

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        if (submitRef.current) submitRef.current.disabled = true;
        const result = await joinChatBoard(invitationRef.current !== null ? invitationRef.current.value : "");
        if (result && onJoinSuccess) if (onJoinSuccess()) setShowBox(false);
        else if (!result && onJoinFailed) if (onJoinFailed()) setShowBox(false);
        if (submitRef.current) submitRef.current.disabled = false;
        setShowBox(false);
    }

    return <div>
        <JoinBoardButton onClick={()=>{ setShowBox(true) }} />
        { !showBox ? undefined :
            <ConfirmationBox submitRef={submitRef} header="Join a new board" customSubmitMessage="All aboard!" onSubmit={handleSubmit} onClose={() => { setShowBox(false) }}>
                <div className={"w-96"} />
                <div className="login-form">
                    <Form.Group>
                        <Form.Label className='sr-only'>Invitation</Form.Label>
                        <Form.Control ref={invitationRef} required placeholder='Invitation' className="single-form-email" />
                    </Form.Group>
                </div>
            </ConfirmationBox>}
    </div>
}

export const CreateNewBoardHandled: React.FC<{ onSuccess?: ReturnedCallbackType, onFailed?: ReturnedCallbackType }> = ({ onFailed, onSuccess }) => {

    const { createChatBoard } = useCumailNEXTChat() as CumailNEXTChatContextType;

    const [showBox, setShowBox] = useState(false);
    const submitRef = useRef<HTMLButtonElement | null>(null);
    const roomNameRef = useRef<HTMLInputElement | null>(null);

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        const boardName = roomNameRef.current === null ? "" : roomNameRef.current.value;
        if (boardName === "") return;
        if (submitRef.current) submitRef.current.disabled = true;
        const result = await createChatBoard(boardName);
        if (result && onSuccess) onSuccess();
        else if (!result && onFailed) onFailed();
        if (submitRef.current) submitRef.current.disabled = false;
        setShowBox(false);
    }

    return <div>
        <CreateBoardButton onClick={() => { setShowBox(true); }} />
        { !showBox ? undefined :
            <ConfirmationBox submitRef={submitRef} onSubmit={handleSubmit} header="Create a new board" onClose={() => { setShowBox(false); }}>
                <div className={"w-96"} />
                <div className="login-form">
                    <Form.Group>
                        <Form.Label className='sr-only'>New Board</Form.Label>
                        <Form.Control ref={roomNameRef} required placeholder="Enter your board's name" className="single-form-email" />
                    </Form.Group>
                </div>
            </ConfirmationBox>}
    </div>
}

export const CreateNewInvitationHandled: React.FC<{ forBoardId: string, forBoardName: string, onSuccess?: ReturnedCallbackType, onFailed?: ReturnedCallbackType }> = ({ forBoardId, forBoardName, onFailed, onSuccess }) => {
    const { createInvitation } = useCumailNEXTChat() as CumailNEXTChatContextType;
    const [showBox, setShowBox] = useState(false);
    const submitRef = useRef<HTMLButtonElement | null>(null);
    const invitationStringRef = useRef<HTMLInputElement | null>(null);

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        const invitationString = invitationStringRef.current === null ? "" : invitationStringRef.current.value;
        if (invitationString === "") return;
        if (submitRef.current) submitRef.current.disabled = true;
        const result = await createInvitation(forBoardId, invitationString);
        if (result && onSuccess) onSuccess();
        else if (!result && onFailed) onFailed();
        if (submitRef.current) submitRef.current.disabled = false;
        setShowBox(false);
    }

    return <div>
        <CreateInvitationButton onClick={() => { setShowBox(true); }} />
        { !showBox ? undefined :
            <ConfirmationBox submitRef={submitRef} onSubmit={handleSubmit} header={`Create a new invitation for '${forBoardName}'`} onClose={() => { setShowBox(false); }}>
                <div className={"w-96"} />
                <div className="login-form">
                    <Form.Group>
                        <Form.Label className='sr-only'>New Invitation</Form.Label>
                        <Form.Control ref={invitationStringRef} required placeholder="Enter your invitation string" className="single-form-email" />
                    </Form.Group>
                </div>
            </ConfirmationBox>}
    </div>
}

export const Dialog: React.FC<{ header: string, content: string, onClose?: CallbackType }> = ({ header, content, onClose }) => {
    return <BigBlackBox modalLevel="modal-0" header={header}>
        <div className="mt-8 space-y-6 w-80 mx-10 text-gray-300">
            <div className={"mb-2"}>
                {content}
            </div>
            <div className="flex flex-row w-full items-end justify-end">
                <button className="login-form-submit mx-2 w-max" onClick={onClose}>Close</button>
            </div>
        </div>
    </BigBlackBox>
}
