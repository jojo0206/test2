import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { firebaseApp } from "@/firebase/firebaseClient";
import { collection, getDocs, Firestore, DocumentData, getFirestore, orderBy, query } from 'firebase/firestore';
import { Button, Layout } from '@/components/ui';
import dayjs from "dayjs";
import axios from 'axios';
import { Trash2Icon } from '@/components/icon';
import { StoreEvent } from '@/interface';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from 'react';

interface StoreEventProps {
  storeEvents: Array<StoreEvent>;
}

const StoreEventPage = ({ storeEvents }: StoreEventProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const handleDelete = async (storeEventId: string) => {
    try {
      await axios.delete("/api/management/delete", {
        data: {
          id: storeEventId
        }
      });
      closeDialog();
      router.replace(router.asPath);
    } catch (error) {
      console.error("StoreEvent Delete is Failed.", error);
    }
  };

  const openDialog = (eventId: string) => {
    setSelectedEvent(eventId);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setSelectedEvent(null);
    setIsOpen(false);
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
                  <TableHead />
                  <TableHead>Id</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Store ID</TableHead>
                  <TableHead>Discount Percent</TableHead>
                  <TableHead>MenuCount</TableHead>
                  <TableHead>MenuId</TableHead>
                  <TableHead>CloseDt</TableHead>
                  <TableHead>EatDt</TableHead>
                  <TableHead>CreatedAt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeEvents.map((store: StoreEvent) => {
                  return (
                    <TableRow key={store.id}>
                      <TableCell className="cursor-pointer">
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => openDialog(store.id)}>
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{store.id}</TableCell>
                      <TableCell>{store.userId}</TableCell>
                      <TableCell>{store.storeId}</TableCell>
                      <TableCell>{store.discountPercent}</TableCell>
                      <TableCell>{store.menuCount}</TableCell>
                      <TableCell>{store.menuId}</TableCell>
                      <TableCell>{dayjs(store.closeDt).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                      <TableCell>{dayjs(store.eatDt).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                      <TableCell>{dayjs(store.createDt).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>선택한 게시물을 삭제하시겠습니까?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="justify-end">
            <div className="flex gap-4">
              <Button type="button" onClick={() => handleDelete(selectedEvent!)}>삭제하기</Button>
              <Button type="button" variant="secondary" onClick={closeDialog}>닫기</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const db: Firestore = getFirestore(firebaseApp!);
    const postCollection = collection(db, 'storeEvents');
    const querySnapshot = await getDocs(query(postCollection, orderBy("createDt", "desc")));
    const storeEvents: DocumentData[] = querySnapshot.docs
      .filter(doc => doc.data().isOpen === true)
      .map(doc => ({
        ...doc.data(),
        id: doc.id,
        createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
        closeDt: doc.data().closeDt ? doc.data().closeDt.toDate().toISOString() : null,
        eatDt: doc.data().eatDt ? doc.data().eatDt.toDate().toISOString() : null,
      }));
    return {
      props: {
        storeEvents: storeEvents,
      },
    };
  } catch (error) {
    console.error("Error fetching data: ", error);
    return {
      props: {
        storeEvents: [],
      },
    };
  }
};

export default StoreEventPage;
