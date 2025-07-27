
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
          status: 'active',
        },
        {
          id: 'manager-001',
          name: 'Bob Manager',
          email: 'manager@example.com',
          role: 'manager',
          status: 'active',
        },
        {
          id: 'employee-001',
          name: 'Charlie Employee',
          email: 'employee@example.com',
          role: 'employee',
          supervisorId: 'manager-001',
          status: 'active',
        },
        {
          id: 'employee-002',
          name: 'Dana Employee',
          email: 'employee2@example.com',
          role: 'employee',
          supervisorId: 'manager-001',
          status: 'active',
        }
    ];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(defaultUsers));
  } else {
    // Migration for existing users to add status
    const users: User[] = JSON.parse(storedUsers);
    const usersNeedMigration = users.some(u => !u.status);
    if(usersNeedMigration) {
      const migratedUsers = users.map(u => ({ ...u, status: u.status || 'active' }));
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(migratedUsers));
    }
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
  return users.filter(u => u.role === 'manager' && u.status === 'active');
}

export function getEmployeesForManager(managerId: string): User[] {
    const users = getUsers();
    return users.filter(u => u.role === 'employee' && u.supervisorId === managerId && u.status === 'active');
}

export function updateUserSupervisor(userId: string, newSupervisorId: string): void {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        users[userIndex].supervisorId = newSupervisorId;
        setUsers(users);
    }
}
