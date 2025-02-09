import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/firebaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.body;
    try {
        const db = getFirestore(firebaseApp!);
        const docRef = doc(db, 'reviews', id);
        await deleteDoc(docRef);
        res.status(200).json({ message: 'Review Deleted Successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  }
}
