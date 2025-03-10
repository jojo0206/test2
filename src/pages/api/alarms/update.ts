import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getFirestore, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/firebaseClient';

// export interface Alarm {
//     id: string;
//     name: string;
//     sendType: number;//1 전체, 2 식당, 3 특정 
//     sendUserIdList: string;
//     contents: string;
  
//     repeat: boolean;
  
//     weekDays: number;
//     hour: number;
//     minute: number;
  
//     imageUrl: string;
  
//     createDt: string;
//   }
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id,name,sendType,sendUserIdList,contents, repeat, weekDays, hour, minute, imageUrl, kimageId } = req.body.data;
    const sendDay = 0;
    if (id == null || id == '') {
      try {
        const db = getFirestore(firebaseApp!);

        if (kimageId == null) {
          const docRef = await addDoc(collection(db, "alarms"), { contents, name, sendType, sendUserIdList, repeat, weekDays, hour, minute, sendDay, createDt: serverTimestamp() });
        } else {
          const docRef = await addDoc(collection(db, "alarms"), { contents, name, sendType, sendUserIdList, repeat, weekDays, hour, minute, sendDay, createDt: serverTimestamp(), kimageId });
        }
        
        // const docRef = doc(db, 'alarms', id);
        // await updateDoc(docRef, { contents, name, sendType, sendUserIdList, repeat, weekDays, hour, minute, imageUrl });
        res.status(200).json({ message: 'Alarm updated Successfully'});
      } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).json({ error: 'Error adding document' });
      }
    } else {
      try {
        const db = getFirestore(firebaseApp!);
        const docRef = doc(db, 'alarms', id);
        await updateDoc(docRef, { contents, name, sendType, sendUserIdList, repeat, weekDays, hour, minute, kimageId });
        res.status(200).json({ message: 'Alarm updated Successfully'});
      } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).json({ error: 'Error adding document' });
      }
    }
  }
}
