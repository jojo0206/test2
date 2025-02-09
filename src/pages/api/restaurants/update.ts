import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp, functions } from '@/firebase/firebaseClient';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { AxiosResponse } from "axios";
import { FirebaseError } from "firebase/app";

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
    try {
      const myFunction = httpsCallable(functions, 'helloWorld3');
      const res2 = await myFunction({ token: 'value1', title: 'value2', body: 'value3' });//({ token: 'value1', title: 'value2', body: 'value3' });
      const result = res2 as AxiosResponse<MyFunctionResult>;
      const data = result.data as MyFunctionResult;
      res.status(200).json({ message: data });
    } catch (error) {
      let errorMessage: string;
      if (error instanceof FirebaseError) {
        errorMessage = `code ${error.code}|${error.message}|${error.name}|${error.stack}|`;
     } else if (error instanceof Error) {
        // 일반적인 Error 객체
        errorMessage = `Error2: ${error.message.replace(/\n/g, " ")}|1|${error.toString().replace(/\n/g, " ")}|2|${String(error).replace(/\n/g, " ")}`;
      } else {
        // 알 수 없는 에러 타입
        errorMessage = `An2 unknown error occurred: ${String(error).replace(/\n/g, " ")}`;
      }
      res.status(200).json({ message: errorMessage });
    }
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
