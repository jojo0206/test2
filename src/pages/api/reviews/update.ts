import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/firebaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id,contents, cleanRate, kindRate, moodRate, tasteRate } = req.body.data;
    try {
      const db = getFirestore(firebaseApp!);
      const docRef = doc(db, 'reviews', id);
      await updateDoc(docRef, { contents, cleanRate, kindRate, moodRate, tasteRate });
      res.status(200).json({ message: 'Review updated Successfully'});
    } catch (error) {
      console.error("Error adding document: ", error);
      res.status(500).json({ error: 'Error adding document' });
    }
  }
}
