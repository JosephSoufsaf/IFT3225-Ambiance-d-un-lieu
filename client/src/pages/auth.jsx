import { Outlet } from "react-router"
import './connection.css';

export default function Auth() {
    return <div className="auth-page">
        <h1 className="text-center text-2xl m-4 underline">Authentification</h1>
        <Outlet />
    </div>
}