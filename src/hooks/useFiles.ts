import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

export function useFiles() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'files'), orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFiles(filesData);
      setLoading(false);
    }, (error) => {
        // If index is missing for orderBy, fallback or log
        console.error("Error fetching files:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Placeholder for upload logic - in a real app this would upload to Storage then add doc
  const uploadFileRecord = async (fileData: any) => {
    await addDoc(collection(db, 'files'), {
        ...fileData,
        uploadedAt: new Date().toISOString() // using string for compatibility with UI formatters
    });
  };

  return { files, loading, uploadFileRecord };
}
