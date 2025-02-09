import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { firebaseApp } from "@/firebase/firebaseClient";
import { collection, getDocs, Firestore, DocumentData,getFirestore, orderBy, query } from 'firebase/firestore';
import { Layout } from '@/components/ui';
import dayjs from "dayjs";
import { Review } from '@/interface';

interface Reviews {
  reviews : Array<Review>
}

const ReviewPage = ({reviews}: Reviews) => {
  const router = useRouter()
  const handle_review_detail_by_id = (id:string) => {
      router.push("/reviews/"+ id)
  }

  return (
    <Layout>
      <div>
      <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 lg:h-[60px]" />
        <div className="grid grid-cols-1 gap-4 p-4">
          <div className="border shadow-sm rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className='pointer-events-none'>
                  <TableHead>Id</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>CreatedAt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map(({id,contents,createDt}: Review) => {
                  const createdAt = dayjs(createDt).format("YYYY-MM-DD")
                  return (
                    <TableRow key={id} onClick={() => handle_review_detail_by_id(id)} className="cursor-pointer"> 
                      <TableCell className="font-medium">{id}</TableCell>
                      <TableCell>{contents}</TableCell>
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
      const postCollection = collection(db, 'reviews');
      const querySnapshot = await getDocs(query(postCollection, orderBy("createDt","desc")));
      const reviews: DocumentData[] = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
      }));
      return {
          props: {
              reviews: reviews,
          },
      };
  } catch (error) {
      console.error("Error fetching data: ", error);
      return {
          props: {
            reviews: [],
          },
      };
  }
};

export default ReviewPage;