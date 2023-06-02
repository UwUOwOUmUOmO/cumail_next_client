import React from "react";

const ContextBar: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <div className='channel-bar shadow-lg overflow-y-auto'>
            { children }
        </div>
    );
};

export default ContextBar;
