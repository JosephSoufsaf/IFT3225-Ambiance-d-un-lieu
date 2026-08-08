import { useState } from 'react';
import { registerUser } from '../api/client';
import AuthForm from '../components/AuthForm';

export default function Inscription() {
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    async function handleSubmit({ email, username, password }) {
        setError(null);
        try {
            await registerUser({ email, username, password });
            setMessage('Inscription réussie');
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <AuthForm
            title="Formulaire d'inscription"
            fields={[
                { name: 'email', type: 'email', placeholder: 'Email' },
                { name: 'username', type: 'text', placeholder: "Nom d'utilisateur" },
                { name: 'password', type: 'password', placeholder: 'Mot de passe' },
            ]}
            submitLabel="S'inscrire"
            onSubmit={handleSubmit}
            error={error}
            message={message}
        />
    );
}