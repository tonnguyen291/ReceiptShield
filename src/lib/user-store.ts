
'use client';

import type { User } from '@/types';

const USERS_DB_KEY = 'receiptShieldUsersDB';

// Seed with default users if none exist
function initializeUsersDB(): void {
  if (typeof window === 'undefined') return;
  const storedUsers = localStorage.getItem(USERS_DB_KEY);
  if (!storedUsers) {
    const defaultUsers: User[] = [
        {
          id: 'admin-001',
          name: 'Alex Admin',
          email: 'admin@corp.com',
          role: 'admin',
        },
        {
          id: 'manager-001',
          name: 'Bob Manager',
          email: 'manager@example.com',
          role: 'manager',
        },
        {
          id: 'employee-001',
          name: 'Charlie Employee',
          email: 'employee@example.com',
          role: 'employee',
          supervisorId: 'manager-001'
        }
    ];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(defaultUsers));
  }
}

initializeUsersDB();

export function getUsers(): User[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedUsers = localStorage.getItem(USERS_DB_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error("Failed to parse users from localStorage", error);
    return [];
  }
}

function setUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

export function addUser(user: User): void {
  const users = getUsers();
  setUsers([...users, user]);
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
