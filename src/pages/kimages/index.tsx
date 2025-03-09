import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { firebaseApp } from "@/firebase/firebaseClient";
import { collection, getDocs, Firestore, DocumentData,getFirestore, orderBy, query } from 'firebase/firestore';
import { Layout } from '@/components/ui';
import dayjs from "dayjs";
import { Keyword, Kimage } from '@/interface';

interface Kimages {
  kimages : Array<Kimage>
  keywords: Array<Keyword>
}

const KimagePage = ({kimages}: Kimages) => {
  const router = useRouter()
  const handle_kimage_detail_by_id = (id:string) => {
      router.push("/kimages/"+ id)
  }

  return (
    <Layout>
      <div>
      <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 lg:h-[60px]" />
        <div className="grid grid-cols-1 gap-4 p-4">
          <div className="flex justify-end gap-4">
            <button
              onClick={() => handle_kimage_detail_by_id('new')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              새로 만들기
            </button>
          </div>

          <div className="border shadow-sm rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className='pointer-events-none'>
                  <TableHead>Id</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>CreatedAt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kimages.map(({id,name,createDt}: Kimage) => {
                  const createdAt = dayjs(createDt).format("YYYY-MM-DD")
                  return (
                    <TableRow key={id} onClick={() => handle_kimage_detail_by_id(id)} className="cursor-pointer"> 
                      <TableCell className="font-medium">{id}</TableCell>
                      <TableCell>{name}</TableCell>
                      <TableCell>{createdAt}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
      const db: Firestore = getFirestore(firebaseApp!);
      const postCollection = collection(db, 'kimages');
      const querySnapshot = await getDocs(query(postCollection, orderBy("createDt","desc")));
      const kimages: DocumentData[] = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
          id: doc.id,
      }));

      const keywordCollection = collection(db, 'keywords');
      const keywordQuerySnapshot = await getDocs(query(keywordCollection, orderBy("createDt","desc")));
      const keywords: DocumentData[] = keywordQuerySnapshot.docs.map(doc => ({
          ...doc.data(),
          createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
          id: doc.id,
      }));

      return {
          props: {
              kimages: kimages,
              keywords: keywords,
          },
      };
  } catch (error) {
      console.error("Error fetching data: ", error);
      return {
          props: {
            kimages: [],
            keywords: [],
          },
      };
  }
};

export default KimagePage;