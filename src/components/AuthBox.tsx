import React from "react";

const AuthBox: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (<div className="fixed inset-0 flex items-center justify-center bg-chatbg">
        <div className="bg-loginbg rounded-lg shadow-lg p-6">
            <div className='px-16 py-8'>
                <div className='w-full max-w-md space-y-8'>
                    { children }
                </div>
            </div>
        </div>
    </div>)
}

export default AuthBox;
