import { useState, useEffect, useContext } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  arrayUnion,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { AuthContext } from '../app/App';
import { toast } from "sonner";

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export function useFriendRequests() {
  const { user } = useContext(AuthContext) || {};
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setLoading(false);
      return;
    }

    // Listen for incoming requests
    const incomingQ = query(
      collection(db, 'friendRequests'),
      where('receiverId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubIncoming = onSnapshot(incomingQ, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FriendRequest[];
      setIncomingRequests(reqs);
    });

    // Listen for outgoing requests
    const outgoingQ = query(
      collection(db, 'friendRequests'),
      where('senderId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubOutgoing = onSnapshot(outgoingQ, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FriendRequest[];
      setOutgoingRequests(reqs);
      setLoading(false);
    });

    return () => {
      unsubIncoming();
      unsubOutgoing();
    };
  }, [user]);

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;

    try {
      // Check if request already exists
      const existingQuery = query(
        collection(db, 'friendRequests'),
        where('senderId', '==', user.uid),
        where('receiverId', '==', receiverId),
        where('status', '==', 'pending')
      );
      const existingDocs = await getDocs(existingQuery);
      if (!existingDocs.empty) {
        toast.info("Request already sent!");
        return;
      }

      await addDoc(collection(db, 'friendRequests'), {
        senderId: user.uid,
        receiverId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success("Friend request sent!");
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request");
    }
  };

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return;

    try {
      // 1. Update request status
      const requestRef = doc(db, 'friendRequests', requestId);
      await deleteDoc(requestRef); // Or update to 'accepted' if you want history

      // 2. Add to sender's friend list
      const senderRef = doc(db, 'users', senderId);
      await updateDoc(senderRef, {
        friends: arrayUnion(user.uid)
      });

      // 3. Add to receiver's (current user) friend list
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        friends: arrayUnion(senderId)
      });

      toast.success("Friend request accepted!");
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      await deleteDoc(requestRef);
      toast.info("Friend request rejected");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const cancelFriendRequest = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      await deleteDoc(requestRef);
      toast.info("Friend request cancelled");
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast.error("Failed to cancel request");
    }
  };

  return {
    incomingRequests,
    outgoingRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest
  };
}
