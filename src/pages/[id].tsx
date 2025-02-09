import { GetServerSideProps, GetServerSidePropsContext} from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Input, DetailPageHeader, Separator, Button } from "@/components/ui";
import { firebaseApp, storage } from "@/firebase/firebaseClient";
import { Firestore, DocumentData, getFirestore, doc, getDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import dayjs from "dayjs";
import { EventReserves, Menu, Point, Store, StoreEvent, User } from '@/interface'; // Adjust path as per your project structure
import axios from "axios";

interface CustomInputBoxProps {
    htmlFor: string;
    value: string;
    readOnly?: boolean;
}
interface Props {
    storeEvent: StoreEvent;
  }
    

const StoreEventDetail = ({ storeEvent }: Props) => {
  const router = useRouter();

  const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

  const [menuCount, setMenuCount] = useState<string>(String(storeEvent?.menuCount));
  const [discountPercent, setDiscountPercent] = useState<string>(String(storeEvent?.discountPercent));
  const [closeDt, setCloseDt] = useState<string>(storeEvent?.closeDt);
  const [eatDt, setEatDt] = useState<string>(storeEvent?.eatDt);
  const [isOpen, setIsOpen] = useState<boolean>(storeEvent?.isOpen);
  
  const handleIsOpenChange = () => setIsOpen(!isOpen);
  const handleMenuCountChange = ({target: { value }}: React.ChangeEvent<HTMLInputElement>) => setMenuCount(value);
  const handleDiscountPercentChange = ({target: { value }}: React.ChangeEvent<HTMLInputElement>) => setDiscountPercent(value);
  const handleCloseDtChange = ({target: { value }}: React.ChangeEvent<HTMLInputElement>) => setCloseDt(value);
  const handleEatDtChange = ({target: { value }}: React.ChangeEvent<HTMLInputElement>) => setEatDt(value);
  


  const CustomInputBox: React.FC<CustomInputBoxProps> = ({ htmlFor, value, readOnly = false }) => {
    return (
      <div>
        <label htmlFor={htmlFor} className="block text-gray-700 font-medium mb-1">
          {htmlFor.toUpperCase()}
        </label>
        <Input
          id={htmlFor}
          type="text"
          value={value}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          readOnly={readOnly}
        />
      </div>
    );
  };
  

  return (
    <div>
        <DetailPageHeader title="이벤트 관리" />
        <div className="bg-white p-6 w-full">
            <form className="space-y-4">
                <CustomInputBox htmlFor="id" value={storeEvent?.id} readOnly={true}/>
                <CustomInputBox htmlFor="storeId" value={storeEvent?.storeId} readOnly={true}/>
                <CustomInputBox htmlFor="menuId" value={storeEvent?.menuId} readOnly={true}/>
                <CustomInputBox htmlFor="storeEventRequestId" value={storeEvent?.storeEventRequestId} readOnly={true}/>
                <div>
                    <label htmlFor={"menuCount"} className="block text-gray-700 font-medium mb-1">
                        MenuCount
                    </label>
                    <Input 
                        id='menuCount'
                        type="text"
                        className={inputStyle}
                        value={menuCount}
                        onChange={handleMenuCountChange}
                    />
                </div>
                <div>
                    <label htmlFor={"discountPercent"} className="block text-gray-700 font-medium mb-1">
                        DiscountPercent
                    </label>
                    <Input 
                        id='discountPercent'
                        type="text"
                        className={inputStyle}
                        value={discountPercent}
                        onChange={handleDiscountPercentChange}
                    />
                </div>
                <div>
                    <label htmlFor={"closeDt"} className="block text-gray-700 font-medium mb-1">
                        CloseDt
                    </label>
                    <Input 
                        id='closeDt'
                        type="text"
                        className={inputStyle}
                        value={closeDt}
                        onChange={handleCloseDtChange}
                    />
                </div>
                <div>
                    <label htmlFor={"eatDt"} className="block text-gray-700 font-medium mb-1">
                        EatDt
                    </label>
                    <Input 
                        id='eatDt'
                        type="text"
                        className={inputStyle}
                        value={eatDt}
                        onChange={handleEatDtChange}
                    />
                </div>
                <div>
                    <label htmlFor="isOpen" className="block text-gray-700 font-medium mb-1">
                        isOpen
                    </label>
                    <Input
                        type="checkbox"
                        id="isOpen"
                        value={isOpen as any}
                        onChange={handleIsOpenChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </form>
            <Separator/>
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
                        {/* {reviews.map(({id,contents,createDt}: Review) => {
                        const createdAt = dayjs(createDt).format("YYYY-MM-DD")
                        return (
                            <TableRow key={id} onClick={() => handleReview(id)} className="cursor-pointer"> 
                            <TableCell className="font-medium">{id}</TableCell>
                            <TableCell>{contents}</TableCell>
                            <TableCell>{createdAt}</TableCell>
                            </TableRow>
                        )
                        })} */}
                    </TableBody>
                    </Table>                    
                </div>
            </div>
        </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const { params } = context;
    const storeId = params?.id as string;
  
    try {
      const db: Firestore = getFirestore(firebaseApp!);
      const StoredocRef = doc(db, 'storeEvents', storeId);
      const StoredocSnapshot = await getDoc(StoredocRef);
  
      if (!StoredocSnapshot.exists()) {
        return {
          notFound: true,
        };
      }
  
      const storeEvent: DocumentData = {
        ...StoredocSnapshot.data(),
        id: StoredocSnapshot.id,
        createDt: StoredocSnapshot.data().createDt ? StoredocSnapshot.data().createDt.toDate().toISOString() : null,
        closeDt: StoredocSnapshot.data().closeDt ? StoredocSnapshot.data().closeDt.toDate().toISOString() : null,
        eatDt: StoredocSnapshot.data().eatDt ? StoredocSnapshot.data().eatDt.toDate().toISOString() : null,
      };

      const menusRef = doc(db, 'menus', storeEvent.menuId);
      const menuSnapshot = await getDoc(menusRef);
      
      if (!menuSnapshot.exists()) {
        return {
          notFound: true,
        };
      }

      const menu: DocumentData = {
        ...menuSnapshot.data(),
        createDt: menuSnapshot.data().createDt ? menuSnapshot.data().createDt.toDate().toISOString() : null,
      };

      const eventReservesRef = collection(db, 'eventReserves');
      const eventReservesQuery = query(eventReservesRef, where('eventId', '==', storeEvent.id), orderBy('createDt', 'desc'));
      const eventReservesSnapshot = await getDocs(eventReservesQuery);
      const eventReserves : DocumentData[] = eventReservesSnapshot.docs.map(doc => ({
        ...doc.data(),
        createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
      }));
      
      const userIds = eventReserves.map(eventReserve => eventReserve.userId);
      const userData: any= [];
      let pointData: any= [];

      for (const userId of userIds) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            userData.push({
                ...userDoc.data(),
                createDt: userDoc.data().createDt ? userDoc.data().createDt.toDate().toISOString() : null,
            });
            const pointRef = collection(db, 'points');
            const pointQuery = query(pointRef, where('userId', '==', userDoc.id), orderBy('createDt', 'desc'));
            const pointSnapshot = await getDocs(pointQuery);
            const points : DocumentData[] = pointSnapshot.docs.map(doc => ({
                ...doc.data(),
                createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
            }));
            pointData = [...pointData, ...points]
        }
      }
      return {
        props: {
          storeEvent: storeEvent,
          menu: menu,
          points: pointData,
          users: userData
        },
      };
  
    } catch (error) {
      console.error("Error fetching data: ", error);
      return {
        props: {
          storeEvent: null,
          menu: [],
          points: [],
          users: [],
        },
      };
    }
  };

export default StoreEventDetail;


