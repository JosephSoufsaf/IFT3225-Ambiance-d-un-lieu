import { useState, useEffect } from "react";
import { loginUser } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import './connection.css';

export default function Connection() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const { loggedin, login } = useAuth();

    useEffect(() => {
        console.log('login state change : ', loggedin);
    }, [loggedin]);

    async function handleSubmit(e) {
        e.preventDefault();

        setError(null);

        try {
            const data = await loginUser({ email, password });
            login(data.authToken);
            setMessage('Connexion réussie');
        } catch (err) {
            setMessage(null);
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} className='auth-form'>

            <h1 className='underline'>Formulaire de connection</h1>

            <input className='auth-input' type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input className='auth-input' type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />

            <button type="submit" className="auth-submit">Se Connecter</button>

            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-message">{message}</p>}

        </form>
    );
}