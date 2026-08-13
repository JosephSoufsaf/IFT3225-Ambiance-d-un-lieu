import { useState, useEffect } from "react";
import { loginUser } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import AuthForm from "../components/AuthForm";

export default function Connection() {
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const { loggedin, login } = useAuth();

    useEffect(() => {
        console.log('login state change : ', loggedin);
    }, [loggedin]);

    async function handleSubmit({ email, password }) {
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
        <AuthForm
            title="Formulaire de connection"
            fields={[
                { name: 'email', type: 'email', placeholder: 'Email' },
                { name: 'password', type: 'password', placeholder: 'Mot de passe' },
            ]}
            submitLabel="Se Connecter"
            onSubmit={handleSubmit}
            error={error}
            message={message}
        />
    );
}