import { useState } from 'react';
import { registerUser } from '../api/client';
import './connection.css';

export default function Inscription() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            const data = await registerUser({ email, username, password });
            console.log('Inscription réussie', data);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} className='auth-form'>
            <h1 className='underline'>Formulaire d'inscription</h1>
            <input className='auth-input' type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input className='auth-input' type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nom d'utilisateur" />
            <input className='auth-input' type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
            <button type="submit" className='auth-submit'>S'inscrire</button>
            {error && <p className='auth-error'>{error}</p>}
        </form>
    );
}