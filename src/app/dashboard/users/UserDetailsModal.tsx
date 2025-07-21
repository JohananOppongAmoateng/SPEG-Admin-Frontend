import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton
} from "@mui/material";
import { CheckCircle, Close, Delete, VerifiedUser } from "@mui/icons-material";
import { verifyUser, deleteUser } from "../../../state/api";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";


const UserDetailsModal = ({ user, onClose, markVerified}: any) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleVerify = async () => {
        try {
            await verifyUser(user.id);

            toast.success("User verified successfully."); // Ensure success toast is awaited
            markVerified(user.id);
            onClose();
        } catch (error) {
            console.error("Verification failed:", error);
            toast.error("Failed to verify user.");
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this user?"
        );
        if (!confirmDelete) return;

        setIsDeleting(true);
        try {
      const result = await deleteUser(user.id);
      if (result.success) {
        toast.success("User deleted successfully");
        onClose();
      } else {
        toast.error(`Delete failed: ${result.error}`);
      }
    } catch (err) {
      console.error("Unexpected error deleting user:", err);
      toast.error("Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
    };

    return (
        <Dialog
            open={true}
            onClose={onClose}
            PaperProps={{
                style: {
                    borderRadius: "16px",
                    padding: "20px",
                    backgroundColor: "#2C2C3E",
                    color: "#E0E0E0",
                    minWidth: "450px",
                    boxShadow: "0px 10px 24px rgba(0, 0, 0, 0.5)"
                }
            }}
        >
            <DialogTitle
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#FFFFFF"
                }}
            >
                <Typography
                    variant="h6"
                    style={{ fontWeight: "600", color: "#FFFFFF" }}
                >
                    User Details
                </Typography>
                <IconButton onClick={onClose} style={{ color: "#FFFFFF" }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers style={{ padding: "20px 30px" }}>
                <Typography
                    variant="body1"
                    style={{ marginBottom: "10px", color: "#B0B0B0" }}
                >
                    <strong>First Name:</strong> {user.firstName}
                </Typography>
                <Typography
                    variant="body1"
                    style={{ marginBottom: "10px", color: "#B0B0B0" }}
                >
                    <strong>Last Name:</strong> {user.lastName}
                </Typography>
                <Typography
                    variant="body1"
                    style={{ marginBottom: "10px", color: "#B0B0B0" }}
                >
                    <strong>Email:</strong> {user.email}
                </Typography>
                <Typography
                    variant="body1"
                    style={{ marginBottom: "10px", color: "#B0B0B0" }}
                >
                    <strong>Farm Name:</strong> {user.farmName || "N/A"}
                </Typography>
                <Typography
                    variant="body1"
                    style={{ marginBottom: "10px", color: "#B0B0B0" }}
                >
                    <strong>Location:</strong> {user.farmLocation || "N/A"}
                </Typography>
                <Typography
                    variant="body1"
                    style={{ marginBottom: "10px", color: "#B0B0B0" }}
                >
                    <strong>Phone Number:</strong> {user.telNumber || "N/A"}
                </Typography>
                <Typography
                    variant="body1"
                    style={{ marginBottom: "10px", color: "#B0B0B0" }}
                >
                    <strong>Role:</strong> {user.role || "User"}
                </Typography>
                <Typography
                    variant="body1"
                    style={{
                        marginBottom: "10px",
                        color: user.emailVerified ? "#4CAF50" : "#FF5252"
                    }}
                >
                    <strong>Email Verified:</strong>{" "}
                    {user.emailVerified ? "Yes" : "No"}
                </Typography>
                <Typography
                    variant="body1"
                    style={{
                        color: user.adminVerified ? "#4CAF50" : "#FF5252"
                    }}
                >
                    <strong>Admin Verified:</strong>{" "}
                    {user.adminVerified ? "Yes" : "No"}
                </Typography>
            </DialogContent>

            <DialogActions
                style={{
                    justifyContent: "space-between",
                    padding: "20px 30px"
                }}
            >
                {!user.adminVerified &&
                    <Button
                        onClick={handleVerify}
                        variant="contained"
                        startIcon={<VerifiedUser />}
                        style={{
                            backgroundColor: "#4CAF50",
                            color: "#FFFFFF",
                            fontWeight: "500",
                            textTransform: "capitalize",
                            boxShadow: "0px 6px 12px rgba(76, 175, 80, 0.3)",
                            transition: "background-color 0.3s"
                        }}
                    >
                        Verify User
                    </Button>}
                <Button
                    onClick={handleDelete}
                    variant="contained"
                    startIcon={<Delete />}
                    disabled={isDeleting}
                    style={{
                        backgroundColor: isDeleting ? "#FFB6B6" : "#FF5252",
                        color: "#FFFFFF",
                        fontWeight: "500",
                        textTransform: "capitalize",
                        boxShadow: "0px 6px 12px rgba(255, 82, 82, 0.3)",
                        transition: "background-color 0.3s"
                    }}
                >
                    {isDeleting ? "Deleting..." : "Delete User"}
                </Button>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    startIcon={<Close />}
                    style={{
                        color: "#FF5252",
                        borderColor: "#FF5252",
                        fontWeight: "500",
                        textTransform: "capitalize",
                        transition: "color 0.3s, border-color 0.3s"
                    }}
                    sx={{
                        "&:hover": {
                            color: "#FFFFFF",
                            borderColor: "#FF5252",
                            backgroundColor: "#FF5252"
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDetailsModal;
