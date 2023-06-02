import {Link} from "react-router-dom";
import AuthBox from "./AuthBox.tsx";

const FourOFour = () => {
    return <AuthBox>
        <div className={"login-container"}>
            <h2 className="login-container-header">404: Not found</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
                Return to
                <Link className="login-container-switch" to={"/"}> home</Link>
            </p>
        </div>
    </AuthBox>
}

export default FourOFour;