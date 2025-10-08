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
      const existingUser = existingUserSnapshot.docs[0].data();
      throw new Error(`A user with email "${invitationData.email}" already exists in the system. Please use a different email address.`);
    }

    // Check if there's already a pending or expired invitation for this email
    const existingInvitationQuery = query(
      collection(db, INVITATIONS_COLLECTION),
      where('email', '==', invitationData.email.toLowerCase()),
      where('status', 'in', ['pending', 'expired'])
    );
    const existingInvitationSnapshot = await getDocs(existingInvitationQuery);
    
    if (!existingInvitationSnapshot.empty) {
      const existingDoc = existingInvitationSnapshot.docs[0];
      const existingData = existingDoc.data();
      const existingInvitation = {
        id: existingDoc.id,
        email: existingData.email,
        role: existingData.role,
        supervisorId: existingData.supervisorId,
        invitedBy: existingData.invitedBy,
        status: existingData.status,
        token: existingData.token,
        expiresAt: existingData.expiresAt?.toDate() || new Date(),
        createdAt: existingData.createdAt?.toDate() || new Date(),
        acceptedAt: existingData.acceptedAt?.toDate(),
      } as Invitation;

      console.log('📧 Found existing invitation:', {
        id: existingInvitation.id,
        email: existingInvitation.email,
        status: existingInvitation.status,
        expiresAt: existingInvitation.expiresAt,
        isExpiredByDate: new Date() > existingInvitation.expiresAt,
        daysUntilExpiry: Math.ceil((existingInvitation.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      });

      // If the invitation is expired or past its expiry date, renew it
      const isExpiredByDate = new Date() > existingInvitation.expiresAt;
      if (existingInvitation.status === 'expired' || (existingInvitation.status === 'pending' && isExpiredByDate)) {
        console.log('🔄 Renewing expired/outdated invitation:', existingInvitation.id, {
          status: existingInvitation.status,
          isExpiredByDate: isExpiredByDate
        });
        const now = new Date();
        const newExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        
        // Update the invitation to pending status with new expiry and resend timestamp
        await updateDoc(doc(db, INVITATIONS_COLLECTION, existingDoc.id), {
          status: 'pending',
          expiresAt: Timestamp.fromDate(newExpiresAt),
          lastSentAt: Timestamp.fromDate(now),
        });

        console.log('✅ Invitation renewed - status: pending, new expiry:', newExpiresAt);

        // Return the updated invitation
        return {
          ...existingInvitation,
          status: 'pending',
          expiresAt: newExpiresAt,
          lastSentAt: now,
        };
      }

      // For pending invitations, just return the existing one
      return existingInvitation;
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
      lastSentAt: now,
    };

    // Prepare the document data, omitting null supervisorId for non-employees
    const docData: any = {
      email: invitation.email,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      status: invitation.status,
      token: invitation.token,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: Timestamp.fromDate(now),
      lastSentAt: Timestamp.fromDate(now),
    };

    // Only include supervisorId if it's not null
    if (invitation.supervisorId !== null) {
      docData.supervisorId = invitation.supervisorId;
    }

    const docRef = await addDoc(collection(db, INVITATIONS_COLLECTION), docData);

    console.log('Invitation created successfully with ID:', docRef.id);
    
    // Return the full invitation object
    return {
      id: docRef.id,
      ...invitation,
      expiresAt,
      createdAt: now,
      lastSentAt: now,
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
        lastSentAt: data.lastSentAt?.toDate(),
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
      lastSentAt: data.lastSentAt?.toDate(),
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
      lastSentAt: data.lastSentAt?.toDate(),
      acceptedAt: data.acceptedAt?.toDate(),
    } as Invitation;
  } catch (error) {
    console.error('Error getting pending invitation by email:', error);
    throw error;
  }
}

// Check if there's a pending invitation for an email and return it
export async function checkExistingPendingInvitation(email: string): Promise<Invitation | null> {
  try {
    return await getPendingInvitationByEmail(email);
  } catch (error) {
    console.error('Error checking existing pending invitation:', error);
    return null;
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
