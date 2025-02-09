import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/firebaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId ,point, reserveId, currentDate } = req.body.data;
    try {
        const db = getFirestore(firebaseApp!);
        const newDocRef = doc(collection(db, 'points'));
        const newDocId = newDocRef.id;
        
        await setDoc(newDocRef, {
            id: newDocId,
            userId: userId,
            point: point,
            reserveId: reserveId || "", // TODO 
            createDt: new Date(currentDate),
        });

        res.status(200).json({ message: 'Document added successfully', id: newDocId });
    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).json({ error: 'Error adding document' });
    }
}}
