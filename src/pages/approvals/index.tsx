import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { firebaseApp } from "@/firebase/firebaseClient";
import { Firestore, getFirestore, getDocs, collection, DocumentData, query, orderBy} from 'firebase/firestore';
import { Layout, Badge } from '@/components/ui';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { useState } from 'react';
import axios from 'axios';
import { Store } from '@/interface';

interface StoreProps {
  stores : Array<Store>
}

const ApprovalsPage = ({stores}:StoreProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSwitchIsApproval = async (storeId: string, isApproval: boolean) => {
    setIsLoading(true);
    try{
      const response = await axios.post("/api/approvals/update",{
        data: {
          id: storeId,
          isApproval: !isApproval
        }
      });
      if(response.status === 200){
        router.replace(router.asPath);
      }
    }catch(error){
      console.error("Fail update store approval : ",error)
    }finally{
      setIsLoading(false);
    }

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
                    <TableRow key={store.id}> 
                      <TableCell>{store.businessNo}</TableCell>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.description}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${store.isApproval ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}
                          onClick={() => handleSwitchIsApproval(store.id, store.isApproval)}
                        >
                          {store.isApproval ? "승인" : "미승인"}
                        </Badge>
                      </TableCell>
                      <TableCell>{store.address + " " +store.addressDetail}</TableCell>
                      <TableCell>{store.postNumber}</TableCell>
                      <TableCell>{store.createDt}</TableCell>
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
      const postCollection = collection(db, 'stores');
      const querySnapshot = await getDocs(query(postCollection, orderBy("createDt","desc")));
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
export default ApprovalsPage;