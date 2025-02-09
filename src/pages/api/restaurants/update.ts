import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/firebaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id, name, isApproval, postNumber, description, address, addressDetail, imageUrl, businessImageUrl } = req.body.data;

    try {
      const db = getFirestore(firebaseApp!);
      const docRef = doc(db, 'stores', id);
      await updateDoc(docRef, { name, isApproval, postNumber, description, address, addressDetail, imageUrl, businessImageUrl });

      res.status(200).json({ message: 'Store updated successfully' });
    } catch (error) {
      console.error("Error updating document: ", error);
      res.status(500).json({ error: 'Error updating document' });
    }
  }
}
