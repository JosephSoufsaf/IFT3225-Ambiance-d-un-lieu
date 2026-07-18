import { useContext } from "react";
import { UserLoginContext } from "../App";


export default function Header() {
    
    const {loggedin, setLoggedin} = useContext(UserLoginContext);
    console.log('header login state : ',loggedin);
    
    return <header className="flex justify-between items-center p-4 border-2">
        <a href="/" className='font-bold text-2xl transition-all hover:scale-110'>Ambiance</a>

        <div>
            {loggedin ? (<a href="/deconnection">Deconnection</a>) : (
                <div class="flex gap-4">
                    <a href="/inscription">Inscription</a>
                    <a href="/connection">Connection</a>
                </div>
            )}
        </div>
    </header>
}