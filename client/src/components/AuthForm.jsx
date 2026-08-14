import { useState } from 'react';
import '../pages/connection.css';

export default function AuthForm({ title, fields, submitLabel, onSubmit, error, message }) {
    const initialValues = Object.fromEntries(fields.map((f) => [f.name, '']));
    const [values, setValues] = useState(initialValues);

    function handleChange(name, value) {
        setValues((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit(values);
    }

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h1 className="underline">{title}</h1>

            {fields.map((field) => (
                <input
                    key={field.name}
                    className="auth-input"
                    type={field.type}
                    value={values[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                />
            ))}

            <button type="submit" className="auth-submit">{submitLabel}</button>

            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-message">{message}</p>}
        </form>
    );
}