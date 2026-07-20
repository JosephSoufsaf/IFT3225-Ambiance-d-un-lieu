import { useContext } from "react";
import { UserLoginContext } from "../App";
import { logout } from "../api/client";


export default function Header() {
    
    const {loggedin, setLoggedin} = useContext(UserLoginContext);
    console.log('header login state : ',loggedin);
    
    async function handleLogout() {
        const authToken = localStorage.getItem('loginToken');
        await logout(authToken);
        localStorage.removeItem('loginToken');
        setLoggedin(false);
    }
    
    return <header className="flex justify-between items-center p-4 border-2">
        <a href="/" className='font-bold text-2xl transition-all hover:scale-110'>Ambiance</a>

        <div>
            {loggedin ? (
                <button onClick={handleLogout}>Déconnexion</button>
            ) : (
                <div className="flex gap-4">
                    <a href="/inscription">Inscription</a>
                    <a href="/connection">Connection</a>
                </div>
            )}
        </div>
    </header>
}