import AuthBox from "./AuthBox.tsx";

const ClickJackingWarning = () => {
    return <AuthBox>
        <div className={"login-container"}>
            <h2 className="login-container-header">If you see this page, this website is under Clickjacking security attack.</h2>
            <p className="mt-2 text-center text-sm text-gray-400">Please DO NOT hand out any of your personal information, login info, etc to this site</p>
        </div>
    </AuthBox>
}

export default ClickJackingWarning;