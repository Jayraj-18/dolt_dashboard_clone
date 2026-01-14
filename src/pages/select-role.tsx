import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Home, Wrench, Shield } from "lucide-react";
import axios from "axios";

const RoleSelection = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Use env var or default to proxy
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const Backend_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const handleRoleSelect = async (role: string) => {
        if (!user) return;
        setLoading(true);

        try {
            // Call backend to switch role
            const res = await axios.post(
                `${Backend_URL}/api/auth/switch-role`,
                { userId: user.id, newRole: role },
                { withCredentials: true }
            );

            if (res.data.success) {
                // Update local user state
                const updatedUser = { ...user, role: role as any };
                setUser(updatedUser);

                // Navigate to the correct dashboard
                navigate(`/${role}`);
            }
        } catch (error) {
            console.error("Failed to switch role:", error);
            alert("Failed to switch role. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p>Please log in first.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Select Your Role</h1>
                    <p className="text-gray-600 mt-2">
                        Continue as a Property Owner, Service Provider, or Admin.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* User Role */}
                    {(user.isAlsoUser || user.role === 'user') && (
                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-500"
                            onClick={() => handleRoleSelect("user")}
                        >
                            <CardHeader className="text-center pb-2">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Home className="w-6 h-6 text-orange-600" />
                                </div>
                                <CardTitle className="text-xl">Homeowner</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center text-sm text-gray-600">
                                Book services, manage properties, and track orders.
                            </CardContent>
                        </Card>
                    )}

                    {/* Provider Role */}
                    {(user.isAlsoProvider || user.role === 'provider') && (
                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500"
                            onClick={() => handleRoleSelect("provider")}
                        >
                            <CardHeader className="text-center pb-2">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Wrench className="w-6 h-6 text-blue-600" />
                                </div>
                                <CardTitle className="text-xl">Provider</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center text-sm text-gray-600">
                                Manage jobs, view earnings, and update availability.
                            </CardContent>
                        </Card>
                    )}

                    {/* Admin Role (Only if actually admin or explicitly allowed) */}
                    {(user.role === 'admin') && (
                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-red-500"
                            onClick={() => handleRoleSelect("admin")}
                        >
                            <CardHeader className="text-center pb-2">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Shield className="w-6 h-6 text-red-600" />
                                </div>
                                <CardTitle className="text-xl">Admin</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center text-sm text-gray-600">
                                System administration and oversight.
                            </CardContent>
                        </Card>
                    )}
                </div>

                {loading && <p className="text-center mt-6 text-gray-500">Switching role...</p>}
            </div>
        </div>
    );
};

export default RoleSelection;
