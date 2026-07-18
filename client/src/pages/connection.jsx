import { useState } from "react";
import { loginUser } from "../api/client";

export default function Connection() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();

        setError(null);

        try {

            const data = await loginUser({ email, password });

            console.log('Connexion réussie', data);

        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col items-center gap-y-6 m-4'>

            <h1 className='underline'>Formulaire de connection</h1>

            <input className='inputText' type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input className='inputText' type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
            
            <button type="submit">Se Connecter</button>

            {error && <p>{error}</p>}

        </form>
    );
}