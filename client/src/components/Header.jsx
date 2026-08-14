import { useAuth } from "../hooks/useAuth";
import { logout as logoutApi } from "../api/client";
import './header.css';

export default function Header() {
    const { loggedin, token, logout } = useAuth();

    async function handleLogout() {
        try {
            await logoutApi(token);
        } catch (err) {
            console.log(err);
        } finally {
            logout();
        }
    }

    return (
        <header className="app-header">
            <a href="/" className="app-logo">AMBIANCE</a>

            <div className="app-nav">
                {loggedin ? (
                    <>
                        <a href="/nouvelleObservation">Nouvelle observation</a>
                        <button onClick={handleLogout} className="app-logout-btn">Déconnexion</button>
                    </>
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