import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchAPI = async (endpoint, method = "GET", body = null, token = null) => {
        const API_BASE_URL = "http://localhost:8000/api";
        console.log("Calling API:", `${API_BASE_URL}${endpoint}`);
        const options = {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        };
        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }

        if (body) {
            console.log("Request body:", body);
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Request failed");
            }
            const data = await response.json();
            console.log("Response data:", data);
            return data;
        } catch (error) {
            console.error("Fetch error:", error);
            return { message: error.message || "Network error" };
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const data = await fetchAPI("/auth/register", "POST", form);
        if (data.message === "User registered successfully") {
            navigate("/login");
        } else {
            setError(data.message || "Signup failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {/* Form Container */}
            <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md border border-gray-200">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
                
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-semibold">Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Enter your name" 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Enter your email" 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Create a password" 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 hover:bg-blue-600 transition-all text-white font-bold py-3 rounded-lg">
                        Sign Up
                    </button>
                </form>

                <p className="text-gray-700 text-center mt-4">
                    Already have an account? 
                    <span 
                        className="text-blue-500 hover:underline cursor-pointer font-semibold"
                        onClick={() => navigate("/login")}
                    >  Log in</span>
                </p>
            </div>
        </div>
    );
};

export default Signup;
