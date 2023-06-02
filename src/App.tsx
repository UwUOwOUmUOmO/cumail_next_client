import './App.css';
import { AppRoutes } from './AppRoutes';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import PrivateRoute from "./contexts/PrivateRoute.tsx";
import {CumailNEXTAuthProvider} from "./contexts/CumailNEXTAuthProvider.tsx";
import {CumailNEXTChatProvider} from "./contexts/CumailNEXTChatProvider.tsx";

export default function App() {
    return (
        <CumailNEXTAuthProvider>
            <CumailNEXTChatProvider>
                <Router>
                    <Routes>
                        { AppRoutes.map((route, index) => {
                            const { element, isPrivate, ...rest } = route;
                            return isPrivate ?
                                <Route key={index} {...rest} element={<PrivateRoute>{element}</PrivateRoute>}/>
                                : <Route key={index} {...rest} element={element}/>;
                        }) }
                    </Routes>
                </Router>
            </CumailNEXTChatProvider>
        </CumailNEXTAuthProvider>
    )
}