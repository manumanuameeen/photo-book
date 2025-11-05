import React, { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import type { ISignupPayload } from '../types/auth.types'

const Signup = () => {

    const navigate = useNavigate()
    const [form, setForm] = useState<ISignupPayload>({
        name: "",
        email: "",
        phone: "",
        password: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await authService.signup(form)
        if (res.user) {
            navigate("/verify-otp", { state: { email: form.email } });
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" onChange={handleChange} placeholder="Name" />
            <input name="email" onChange={handleChange} placeholder="Email" />
            <input name="phone" onChange={handleChange} placeholder="Phone" />
            <input name="password" onChange={handleChange} type="password" placeholder="Password" />
            <button type="submit">Sign Up</button>
        </form>
    )
}

export default Signup
