import React from "react";

const dummyUsers = [
    { id: 1, name: "Rahul Kumar", email: "rahul@example.com", joined: "2025-04-01" },
    { id: 2, name: "Neha Singh", email: "neha@example.com", joined: "2025-04-03" },
    { id: 3, name: "Amit Verma", email: "amit@example.com", joined: "2025-04-05" },
];

const RegisteredUsers = () => {
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">All Registered Users</h1>
            <div className="bg-white rounded shadow p-4">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700 text-left">
                            <th className="py-2 px-4">ID</th>
                            <th className="py-2 px-4">Name</th>
                            <th className="py-2 px-4">Email</th>
                            <th className="py-2 px-4">Date Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dummyUsers.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="py-2 px-4">{user.id}</td>
                                <td className="py-2 px-4">{user.name}</td>
                                <td className="py-2 px-4">{user.email}</td>
                                <td className="py-2 px-4">{user.joined}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegisteredUsers;