import {BiLogOut, FiSettings, MdOutlineGroups2, SiVite} from 'react-icons/all'
import { HiOutlineUserCircle } from "react-icons/hi";
import { useCumailNEXTAuth } from "../contexts/CumailNEXTAuthProvider.tsx";
import { CumailNEXTAuthContextType } from "../contexts/CumailNEXTAuthContextType.ts";
import { Link } from "react-router-dom";

export default function SideBar() {
	const { logout } = useCumailNEXTAuth() as CumailNEXTAuthContextType;
	return (
		<div className="fixed top-0 left-0 h-screen w-16 m-0 flex flex-col
					  bg-sidebar text-white shadow">
			<RedirectButton customCss={"discord-icon group"} to="/" icon={<SiVite size="28"/>} text='Messages'/>
			<Divider />
			<RedirectButton to="/user" icon={<HiOutlineUserCircle size="28"/>} text='User'/>
			<RedirectButton to="/boards" icon={<MdOutlineGroups2 size="28"/>} text='Boards'/>
			<RedirectButton to="/settings" icon={<FiSettings size="28"/>} text='Settings'/>
			<div className="flex flex-grow flex-col justify-end h-max">
				<EventfulButton icon={<BiLogOut size="28"/>} text='Log out' event={() => {
						logout();
					}}/>
			</div>
		</div>
	);
}

const RedirectButton = ({ icon, text, to, customCss }: { icon: JSX.Element, text: string, to: string, customCss?: string }) => {
	return (<Link to={to} className={customCss ? customCss : "sidebar-icon group"}>
		{icon}
		<span className="sidebar-tooltip group-hover:scale-100">
			{text}
		</span>
	</Link>)
}
const EventfulButton = ({ icon, text, event }: { icon: JSX.Element, text: string, event: () => void }) => {
	return (
		<div className="sidebar-icon bottom-0 group" onClick={event}>
			{icon}
			<span className="sidebar-tooltip group-hover:scale-100">
				{text}
			</span>
		</div>
	)
}

const Divider = () => <hr className="sidebar-hr" />;
