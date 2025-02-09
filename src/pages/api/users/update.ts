import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/firebaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { 
        id,name, nickname, phone, gender, email, birth, fcmToken, userTypeExt, thumbnailUrl, normalBirth, normalGender, normalName, normalNickname, normalPhone, storeGender, storeName, storeNickname, storePhone, storeBirth
     } = req.body.data;
     try {
      const db = getFirestore(firebaseApp!);
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, { name, nickname, phone, gender, email, birth, fcmToken, userTypeExt, thumbnailUrl, normalBirth, normalGender, normalName, normalNickname, normalPhone, storeGender, storeName, storeNickname, storePhone, storeBirth });
      res.status(200).json({ message: 'User updated Successfully'});
    } catch (error) {
      console.error("Error adding document: ", error);
      res.status(500).json({ error: 'Error adding document' });
    }
  }
}
