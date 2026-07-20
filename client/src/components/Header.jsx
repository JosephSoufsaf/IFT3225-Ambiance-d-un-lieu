import { useContext } from "react";
import { UserLoginContext } from "../App";
import { logout } from "../api/client";
import './header.css';

export default function Header() {
    const { loggedin, setLoggedin } = useContext(UserLoginContext);

    async function handleLogout() {
        const token = localStorage.getItem('loginToken');
        try {
            await logout(token);
        } catch (err) {
            console.log(err);
        } finally {
            localStorage.removeItem('loginToken');
            setLoggedin(false);
        }
    }

    return (
        <header className="app-header">
            <a href="/" className="app-logo">Ambiance</a>

            <div className="app-nav">
                {loggedin ? (
                    <button onClick={handleLogout} className="app-logout-btn">Déconnexion</button>
                ) : (
                    <>
                        <a href="/inscription">Inscription</a>
                        <a href="/connection">Connection</a>
                    </>
                )}
            </div>
        </header>
    );
}