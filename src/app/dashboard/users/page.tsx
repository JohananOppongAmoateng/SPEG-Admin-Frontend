"use client";

import { useEffect, useState } from "react";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import UserDetailsModal from "./UserDetailsModal";
import { Loader2 } from "lucide-react";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

const columns: GridColDef[] = [
    {
        field: "id",
        headerName: "ID",
        width: 100,
        renderCell: params =>
            <Tooltip
                title={`Click this row to view user details and verify`}
                arrow
            >
                <div className="flex items-center gap-1 dark:text-gray-300">
                    {params.value.substring(0, 8)}...
                    <InfoIcon fontSize="small" className="dark:text-gray-400" />
                </div>
            </Tooltip>
    },
    {
        field: "name",
        headerName: "Name",
        width: 200,
        renderCell: params => {
            const name = `${params.row.firstName || "N/A"} ${params.row
                .lastName || "N/A"}`;
            return (
                <Tooltip title="Click to view full details" arrow>
                    <div className="dark:text-gray-300">
                        {name}
                    </div>
                </Tooltip>
            );
        }
    },
    {
        field: "email",
        headerName: "Email",
        width: 200,
        renderCell: params =>
            <Tooltip title={`User email: ${params.value}`} arrow>
                <div className="dark:text-gray-300">
                    {params.value}
                </div>
            </Tooltip>
    },
    {
        field: "createdAt",
        headerName: "Signup Date",
        width: 180,
        renderCell: params => {
            const date = new Date(params.value);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString();

            return (
                <Tooltip
                    title={`Signed up on: ${formattedDate} at ${formattedTime}`}
                    arrow
                >
                    <div className="dark:text-gray-300">
                        {formattedDate}
                    </div>
                </Tooltip>
            );
        }
    },
    {
        field: "adminVerified",
        headerName: "Verified",
        width: 130,
        type: "boolean",
        renderCell: params =>
            <Tooltip
                title={
                    params.value
                        ? "User is verified by admin"
                        : "User pending verification"
                }
                arrow
            >
                <div
                    className={`px-2 py-1 rounded-full dark:text-white ${params.value
                        ? "bg-green-100 dark:bg-green-500 dark:bg-opacity-40"
                        : "bg-red-100 dark:bg-red-500 dark:bg-opacity-40"}`}
                >
                    {params.value ? "Verified" : "Unverified"}
                </div>
            </Tooltip>
    }
];
    interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  farmName?: string;
  farmLocation?: string;
  telNumber?: string;
  role?: string;
  adminVerified: boolean;
  isVerified: boolean; 
    }

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchUsers = async () => {
            setIsLoading(true); // Ensure loading state is set at the start
            try {
                const { data } = await axiosInstance.get("/users/all")
                setUsers(data);
            } catch (error) {
            
                    console.error("Error fetching users:", error);
                    setIsError(true);
                
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();

        return () => {
            controller.abort(); // Cleanup: cancel request on unmount
        };
    }, []); // Empty dependency array ensures this runs once on mount

    const handleRowVerify = (id: string) =>
            setUsers(u =>
                u.map(x => (x.id === id ? { ...x, adminVerified: true } : x))
            );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-4 dark:bg-gray-900 dark:text-gray-300">
                <Loader2
                    className="animate-spin text-blue-500 dark:text-blue-400"
                    size={40}
                />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center text-red-500 dark:text-red-400 py-4">
                Failed to fetch users
            </div>
        );
    }

    if (!users.length) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No users found
            </div>
        );
    }

    return (
        <div className="flex flex-col dark:bg-gray-900">
            <Header name="Users" />
            <div>
                {/* Wrapper div needed for Tooltip to work with DataGrid */}
                <DataGrid
                    rows={users}
                    columns={columns}
                    getRowId={row => row.id}
                    onRowClick={params => setSelectedUser(params.row)}
                    checkboxSelection
                    className="bg-white dark:bg-gray-800 shadow rounded-lg border dark:border-gray-700 mt-5 !text-gray-700 dark:!text-gray-300"
                />
            </div>
            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    markVerified={handleRowVerify}
                />
            )}
        </div>
    );
};

export default Users;
