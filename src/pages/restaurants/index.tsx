import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { firebaseApp } from "@/firebase/firebaseClient";
import { Firestore, getFirestore, getDocs, collection, DocumentData } from 'firebase/firestore';
import { Layout, Badge } from '@/components/ui';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import dayjs from 'dayjs';
import { Store } from '@/interface';

interface StoreProps {
  stores : Array<Store>
}

const StoresPage = ({stores}:StoreProps) => {
  const router = useRouter();

  const handle_store_detail_by_id = (id:string) => {
    router.push("/restaurants/" + id)
  };

  return (
    <Layout>
      <div>
      <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 lg:h-[60px]" />
        <div className="grid grid-cols-1 gap-4 p-4">
          <div className="border shadow-sm rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className='pointer-events-none'>
                  <TableHead>business No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IsApproved</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>PostNumber</TableHead>
                  <TableHead>CreatedAt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store: Store) => {
                  return (
                    <TableRow key={store.id} onClick={() => handle_store_detail_by_id(store.id)} className="cursor-pointer"> 
                      <TableCell>{store.businessNo}</TableCell>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.description}</TableCell>
                      <TableCell>
                        <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${store.isApproval ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                          {store.isApproval ? "승인" : "미승인"}
                        </Badge>
                      </TableCell>
                      <TableCell>{store.address + " " +store.addressDetail}</TableCell>
                      <TableCell>{store.postNumber}</TableCell>
                      <TableCell>{dayjs(store.createDt).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
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
      const querySnapshot = await getDocs(collection(db, 'stores'));
      const stores: DocumentData[] = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
      }));

      return {
          props: {
            stores: stores,
          },
      };
  } catch (error) {
      console.error("Error fetching data: ", error);
      return {
          props: {
            stores: [],
          },
      };
  }
};

export default StoresPage;