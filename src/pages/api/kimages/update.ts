import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getFirestore, doc, updateDoc, getDocs, deleteDoc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/firebaseClient';
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id, name, keywords, desc, imageUrl } = req.body.data;

    if (id == null || id == '') {
      try {
        const db = getFirestore(firebaseApp!);

        var docRef;
        if (imageUrl == null) {
          docRef = await addDoc(collection(db, "kimages"), { desc, name, createDt: serverTimestamp() });
        } else {
          docRef = await addDoc(collection(db, "kimages"), { desc, name, createDt: serverTimestamp(), imageUrl });
        }    

        const keywordList = keywords.split('\n');
        for (let i = 0; i < keywordList.length; i++) {
          const keyword = keywordList[i];
          if (keyword != '' && keyword != null && docRef != null && docRef.id != null) {
            const content = keyword;
            const imageId = docRef.id;
            const keywordDocRef = await addDoc(collection(db, "keywords"), { content, imageId, createDt: serverTimestamp() });
          }
        }
        
        // const docRef = doc(db, 'kimages', id);
        // await updateDoc(docRef, { contents, name, sendType, sendUserIdList, repeat, weekDays, hour, minute, imageUrl });
        res.status(200).json({ message: 'Kimage updated Successfully'});
      } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).json({ error: 'Error adding document' });
      }
    } else {
      try {
        const db = getFirestore(firebaseApp!);
        const docRef = doc(db, 'kimages', id);
        await updateDoc(docRef, { desc, name, imageUrl });

        const d = query(collection(db, 'kimages'), where('imageId', '==', id));
        const docSnap = await getDocs(d);
        for (let i = 0; i < docSnap.length; i++) {
          const doc = docSnap[i];
          if (doc != null) {
            await deleteDoc(doc.ref);
          }
        }

        const keywordList = keywords.split('\n');
        for (let i = 0; i < keywordList.length; i++) {
          const keyword = keywordList[i];
          if (keyword != '' && keyword != null) {
            const content = keyword;
            const imageId = id;
            const keywordDocRef = await addDoc(collection(db, "keywords"), { content, imageId, createDt: serverTimestamp() });
          }
        }

        res.status(200).json({ message: 'Kimage updated Successfully'});
      } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).json({ error: 'Error adding document' });
      }
    }
  }
}
