import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

function UserList() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await axiosInstance.get('users/');
    setUsers(res.data);
  };

  const deleteUser = async (id) => {
    await axiosInstance.delete(`users/${id}/`);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <Link to="/create">+ Add User</Link>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email}
            <Link to={`/edit/${user.id}`}> ✏️ Edit</Link>
            <button onClick={() => deleteUser(user.id)}>🗑 Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
