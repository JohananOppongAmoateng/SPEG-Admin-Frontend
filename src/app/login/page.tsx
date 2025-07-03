"use client";
import React, { useState } from "react";
import {
    ArrowRight,
    AtSign,
    Key,
    Loader2,
    Mail,
    Eye,
    EyeOff
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardContent,
    TextField,
    Button,
    Alert,
    AlertTitle,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from "@mui/material";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import LogoLoader from "../(components)/Preloader/Preloader";
import { loginIn } from "@/state/api";

const LoginSignupScreen = ({ login }: any) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [resetEmailLoading, setResetEmailLoading] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const handleResetPassword = async () => {
        if (!resetEmail) {
            toast.error("Please enter your email address");
            return;
        }

        setResetEmailLoading(true);
        try {
            await axiosInstance.post("/users/reset-password", {
                email: resetEmail
            });
            toast.success("Password reset link sent to your email");
            setShowResetDialog(false);
            setResetEmail("");
        } catch (error) {
            toast.error(`Failed to send reset link: ${(error as Error).message}`);
        } finally {
            setResetEmailLoading(false);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrorMessage("");

        if (isLoginMode) {
            if (!email || !password) {
                setErrorMessage("Please enter your email and password.");
                setIsLoading(false);
                return;
            }
            try {
                // First set loading state
                setIsNavigating(true);

                await loginIn(email, password);
                toast.success("Login successful");

                router.push("/dashboard");
                // Force a refresh of the navigation
            } catch (error) {
                setIsNavigating(false);
                toast.error(`An Invalid Credentials`);
                console.error(error);
            }
        } else {
            if (!firstName || !lastName || !email || !password) {
                toast.error("Please fill in all the required fields.");
                setIsLoading(false);
                return;
            }
            if (
                password.length < 8 ||
                !/[A-Z]/.test(password) ||
                !/[!@#$%^&*(),.?":{}|<>]/.test(password)
            ) {
                toast.error("Password must meet security criteria.");
                setIsLoading(false);
                return;
            }
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                toast.error("Please enter a valid email address.");
                setIsLoading(false);
                return;
            }
            try {
                const data = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                    role: "admin"
                };
                await axiosInstance.post("/users/signup", data);
                toast.success("Account created successfully! Please login.");
                setIsLoginMode(true);
            } catch (error: any) {
                toast.error(
                    `An error occurred during signup. ${(error as Error).message} Please try again.`
                );
            }
        }
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setErrorMessage("");
        setIsLoading(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Show full-screen loading state during navigation
    if (isNavigating) {
        return <LogoLoader />;
    }

    return (
        <div className="flex h-screen items-center justify-center relative bg-gray-100">
            <div className="absolute inset-0 bg-[url('/loginPineapple.jpg')] bg-cover bg-center blur-sm opacity-50" />
            <Card className="z-10 w-full max-w-md p-6 bg-white bg-opacity-90 rounded-lg shadow-xl">
                <CardHeader
                    title={
                        isLoginMode
                            ? "Speg Inventory System"
                            : "Create Your Account"
                    }
                    className="text-center font-semibold text-lg text-[#228B22]"
                />
                <CardContent className="space-y-4">
                    {errorMessage &&
                        <Alert severity="error" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            {errorMessage}
                        </Alert>}
                    {!isLoginMode &&
                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                label="First Name"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                variant="outlined"
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Last Name"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                variant="outlined"
                                fullWidth
                                size="small"
                            />
                        </div>}
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        variant="outlined"
                        fullWidth
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <AtSign className="mr-2 text-[#228B22]" />
                            )
                        }}
                    />
                    <TextField
                        label={isLoginMode ? "Password" : "Create Password"}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        variant="outlined"
                        fullWidth
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <Key className="mr-2 text-[#228B22]" />
                            ),
                            endAdornment: (
                                <IconButton
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                    size="small"
                                    className="text-[#228B22]"
                                >
                                    {showPassword
                                        ? <EyeOff className="h-4 w-4" />
                                        : <Eye className="h-4 w-4" />}
                                </IconButton>
                            )
                        }}
                    />
                    {!isLoginMode &&
                        <div className="text-sm text-gray-600">
                            Password must have:
                            <ul className="list-disc pl-5 mt-1">
                                <li>At least 8 characters</li>
                                <li>One uppercase letter</li>
                                <li>One special character</li>
                            </ul>
                        </div>}
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="success"
                        fullWidth
                        disabled={isLoading}
                        className="font-semibold py-2 text-white tracking-wide"
                    >
                        {isLoading
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <ArrowRight className="mr-2" />}
                        {isLoginMode ? "Login" : "Sign Up"}
                    </Button>
                    <div className="text-center space-y-2">
                        <p>
                            {isLoginMode
                                ? "Don't have an account?"
                                : "Already have an account?"}{" "}
                            <Button
                                type="button"
                                onClick={() => setIsLoginMode(!isLoginMode)}
                                className="text-[#228B22] hover:underline font-medium text-sm"
                            >
                                {isLoginMode ? "Sign Up" : "Login"}
                            </Button>
                        </p>
                        {isLoginMode &&
                            <Button
                                type="button"
                                onClick={() => setShowResetDialog(true)}
                                className="text-[#228B22] hover:underline font-medium text-sm"
                            >
                                Forgot Password?
                            </Button>}
                    </div>
                </CardContent>
            </Card>

            {/* Password Reset Dialog */}
            <Dialog
                open={showResetDialog}
                onClose={() => setShowResetDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle className="text-center text-[#228B22]">
                    Reset Password
                </DialogTitle>
                <DialogContent>
                    <div className="mt-4">
                        <TextField
                            label="Email"
                            type="email"
                            value={resetEmail}
                            onChange={e => setResetEmail(e.target.value)}
                            variant="outlined"
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <Mail className="mr-2 text-[#228B22]" />
                                )
                            }}
                        />
                    </div>
                </DialogContent>
                <DialogActions className="p-4">
                    <Button
                        onClick={() => setShowResetDialog(false)}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleResetPassword}
                        variant="contained"
                        color="success"
                        disabled={resetEmailLoading}
                    >
                        {resetEmailLoading
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Mail className="mr-2 h-4 w-4" />}
                        Send Reset Link
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default LoginSignupScreen;
