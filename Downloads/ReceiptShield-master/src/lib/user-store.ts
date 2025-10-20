
'use client';

import type { User } from '@/types';

const USERS_DB_KEY = 'receiptShieldUsersDB';

// This function now returns the users array, ensuring it's always initialized before use.
function getOrInitializeUsersDB(): User[] {
  if (typeof window === 'undefined') return [];
  
  const defaultUsers: User[] = [
      {
        id: 'admin-001',
        uid: 'admin-001',
        name: 'Alex Admin',
        email: 'admin@corp.com',
        role: 'admin',
        status: 'active',
      },
      {
        id: 'manager-001',
        uid: 'manager-001',
        name: 'Bob Manager',
        email: 'manager@example.com',
        role: 'manager',
        status: 'active',
      },
      {
        id: 'employee-001',
        uid: 'employee-001',
        name: 'Charlie Employee',
        email: 'employee@example.com',
        role: 'employee',
        supervisorId: 'manager-001',
        status: 'active',
      },
      {
        id: 'employee-002',
        uid: 'employee-002',
        name: 'Dana Employee',
        email: 'employee2@example.com',
        role: 'employee',
        supervisorId: 'manager-001',
        status: 'active',
      }
  ];

  try {
    const storedUsersJson = localStorage.getItem(USERS_DB_KEY);
    if (storedUsersJson) {
      const storedUsers = JSON.parse(storedUsersJson);
       // Simple check to see if it's a valid user array
      if (Array.isArray(storedUsers) && storedUsers.length > 0) {
        return storedUsers;
      }
    }
     // If storage is empty or invalid, set it with default users
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch (e) {
     console.error("Failed to parse user data from local storage, resetting.", e);
     // If parsing fails, reset with default users
     localStorage.setItem(USERS_DB_KEY, JSON.stringify(defaultUsers));
     return defaultUsers;
  }
}


export function getUsers(): User[] {
  return getOrInitializeUsersDB();
}

function setUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
   // Dispatch a storage event so other components can update
  window.dispatchEvent(new Event('storage'));
}

export function addUser(user: User): void {
  const users = getUsers();
  setUsers([...users, { ...user, status: 'active' }]);
}

export function updateUser(updatedUser: User): void {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);

    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        setUsers(users);
    }
}


export function getUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getManagers(): User[] {
  const users = getUsers();
  return users.filter(u => u.role === 'manager');
}

export function getEmployeesForManager(managerId: string): User[] {
    const users = getUsers();
    return users.filter(u => u.role === 'employee' && u.supervisorId === managerId);
}

export function updateUserSupervisor(userId: string, newSupervisorId: string): void {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        users[userIndex].supervisorId = newSupervisorId;
        setUsers(users);
    }
}
