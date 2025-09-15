import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Invitation, InvitationRequest } from '@/types';

const INVITATIONS_COLLECTION = 'invitations';

// Generate a unique token for invitation links
function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create a new invitation
export async function createInvitation(
  invitationData: InvitationRequest,
  invitedBy: string
): Promise<Invitation> {
  try {
    // Check if user already exists
    const existingUserQuery = query(
      collection(db, 'users'),
      where('email', '==', invitationData.email.toLowerCase())
    );
    const existingUserSnapshot = await getDocs(existingUserQuery);
    
    if (!existingUserSnapshot.empty) {
      throw new Error('A user with this email already exists');
    }

    // Check if there's already a pending invitation for this email
    const existingInvitationQuery = query(
      collection(db, INVITATIONS_COLLECTION),
      where('email', '==', invitationData.email.toLowerCase()),
      where('status', '==', 'pending')
    );
    const existingInvitationSnapshot = await getDocs(existingInvitationQuery);
    
    if (!existingInvitationSnapshot.empty) {
      throw new Error('A pending invitation already exists for this email');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const invitation: Omit<Invitation, 'id'> = {
      email: invitationData.email.toLowerCase().trim(),
      role: invitationData.role,
      supervisorId: invitationData.supervisorId || null,
      invitedBy,
      status: 'pending',
      token: generateInvitationToken(),
      expiresAt,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, INVITATIONS_COLLECTION), {
      ...invitation,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: Timestamp.fromDate(now),
    });

    console.log('Invitation created successfully with ID:', docRef.id);
    
    // Return the full invitation object
    return {
      id: docRef.id,
      ...invitation,
      expiresAt,
      createdAt: now,
    };
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
}

// Get all invitations
export async function getInvitations(): Promise<Invitation[]> {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, INVITATIONS_COLLECTION),
        orderBy('createdAt', 'desc')
      )
    );

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        expiresAt: data.expiresAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        acceptedAt: data.acceptedAt?.toDate(),
      } as Invitation;
    });
  } catch (error) {
    console.error('Error getting invitations:', error);
    throw error;
  }
}

// Get invitation by token
export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, INVITATIONS_COLLECTION),
        where('token', '==', token)
      )
    );

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      expiresAt: data.expiresAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      acceptedAt: data.acceptedAt?.toDate(),
    } as Invitation;
  } catch (error) {
    console.error('Error getting invitation by token:', error);
    throw error;
  }
}

// Get pending invitations for a specific email
export async function getPendingInvitationByEmail(email: string): Promise<Invitation | null> {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, INVITATIONS_COLLECTION),
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'pending')
      )
    );

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      expiresAt: data.expiresAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      acceptedAt: data.acceptedAt?.toDate(),
    } as Invitation;
  } catch (error) {
    console.error('Error getting pending invitation by email:', error);
    throw error;
  }
}

// Update invitation status
export async function updateInvitationStatus(
  invitationId: string, 
  status: Invitation['status'],
  acceptedBy?: string
): Promise<void> {
  try {
    const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);
    const updateData: any = { status };
    
    if (status === 'accepted' && acceptedBy) {
      updateData.acceptedAt = Timestamp.fromDate(new Date());
      updateData.acceptedBy = acceptedBy;
    }

    await updateDoc(invitationRef, updateData);
    console.log('Invitation status updated successfully');
  } catch (error) {
    console.error('Error updating invitation status:', error);
    throw error;
  }
}

// Cancel/delete invitation
export async function cancelInvitation(invitationId: string): Promise<void> {
  try {
    await updateInvitationStatus(invitationId, 'cancelled');
    console.log('Invitation cancelled successfully');
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    throw error;
  }
}

// Delete invitation permanently
export async function deleteInvitation(invitationId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, INVITATIONS_COLLECTION, invitationId));
    console.log('Invitation deleted successfully');
  } catch (error) {
    console.error('Error deleting invitation:', error);
    throw error;
  }
}

// Check if invitation is expired
export function isInvitationExpired(invitation: Invitation): boolean {
  return new Date() > invitation.expiresAt;
}

// Clean up expired invitations (can be called periodically)
export async function cleanupExpiredInvitations(): Promise<void> {
  try {
    const invitations = await getInvitations();
    const expiredInvitations = invitations.filter(
      inv => inv.status === 'pending' && isInvitationExpired(inv)
    );

    for (const invitation of expiredInvitations) {
      await updateInvitationStatus(invitation.id, 'expired');
    }

    console.log(`Cleaned up ${expiredInvitations.length} expired invitations`);
  } catch (error) {
    console.error('Error cleaning up expired invitations:', error);
    throw error;
  }
}
