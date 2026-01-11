import { useState, useEffect, useContext } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy, 
  serverTimestamp, 
  updateDoc, 
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { AuthContext } from '../app/App';

export function useChats() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext) || {};

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
      // orderBy('lastMessage.timestamp', 'desc') // Requires index
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => {
        const tA = new Date(a.lastMessage?.timestamp || 0).getTime();
        const tB = new Date(b.lastMessage?.timestamp || 0).getTime();
        return tB - tA;
      });
      setChats(chatsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chats:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createChat = async (participants: string[], type: 'direct' | 'group', name?: string) => {
    if (!user) return;

    // Check if direct chat already exists
    if (type === 'direct' && participants.length === 2) {
      const existingChat = chats.find(c => 
        c.type === 'direct' && 
        c.participants.includes(participants[0]) && 
        c.participants.includes(participants[1])
      );
      if (existingChat) return existingChat.id;
    }

    const chatData = {
      type,
      participants,
      name: name || '',
      photoURL: type === 'group' 
        ? `https://api.dicebear.com/7.x/initials/svg?seed=${name}` 
        : '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCount: 0,
      lastMessage: {
        text: 'Chat created',
        timestamp: new Date().toISOString(),
        senderId: 'system'
      }
    };

    const docRef = await addDoc(collection(db, 'chats'), chatData);
    return docRef.id;
  };

  return { chats, loading, createChat };
}

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (chatId: string, content: string, senderId: string, type: string = 'text', replyTo: string | null = null) => {
    const messageData = {
      chatId,
      senderId,
      content,
      type,
      timestamp: new Date().toISOString(),
      status: 'sent',
      reactions: [],
      replyTo
    };

    // Add message
    await addDoc(collection(db, 'messages'), messageData);

    // Update chat last message
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: {
        text: type === 'text' ? content : 'Sent a file',
        timestamp: new Date().toISOString(),
        senderId
      },
      updatedAt: serverTimestamp()
    });
  };

  return { messages, loading, sendMessage };
}
