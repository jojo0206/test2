import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp, functions } from '@/firebase/firebaseClient';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { AxiosResponse } from "axios";

// 함수에 전달할 매개변수의 타입 정의
interface MyFunctionParams {
  token: string;
  title: string;
  body: string;
}

// 함수가 반환할 결과의 타입 정의
interface MyFunctionResult {
  message: string;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
      const myFunction = httpsCallable<MyFunctionParams, MyFunctionResult>(functions, 'helloWorld2');
      const res2 = await myFunction({ token: 'value1', title: 'value2', body: 'value3' });
      const result = res2 as AxiosResponse<MyFunctionResult>;
      const data = result.data as MyFunctionResult;
      res.status(200).json({ message: data });
  }

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
