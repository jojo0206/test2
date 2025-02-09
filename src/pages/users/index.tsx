import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { firebaseApp } from "@/firebase/firebaseClient";
import { collection, getDocs, Firestore, DocumentData,getFirestore, orderBy, query } from 'firebase/firestore';
import { Layout } from '@/components/ui';
import dayjs from "dayjs";
import { User } from '@/interface';


interface UserProps {
  users: Array<User>;
}


const StoreEventPage = ({ users }: UserProps) => {
  const router = useRouter();
  const handleUserDetail = (userId: string) => {
    router.push("/users/" + userId);
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
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Nickname</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Birth</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user.id} className="cursor-pointer" onClick={() => handleUserDetail(user.id)}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.nickname}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.gender}</TableCell>
                    <TableCell>{user.birth}</TableCell>
                    <TableCell>{dayjs(user.createDt).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                  </TableRow>
                ))}
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
      const postCollection = collection(db, 'users');
      const querySnapshot = await getDocs(query(postCollection, orderBy("createDt", "desc")));
      const users: DocumentData[] = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
      }));
      return {
          props: {
            users: users,
          },
      };
  } catch (error) {
      console.error("Error fetching data: ", error);
      return {
          props: {
            users: [],
          },
      };
  }
};

export default StoreEventPage;