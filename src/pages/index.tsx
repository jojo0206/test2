import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { collection, getDocs, Firestore, DocumentData, getFirestore, orderBy, query, doc, getDoc, limit } from 'firebase/firestore';
import { firebaseApp, functions } from "@/firebase/firebaseClient";
import { Layout } from '@/components/ui';
import { DurationDropdown, FilterDropdown, EventListPagination, AverageList } from '@/components/eventList';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { useState, useEffect } from 'react';
import { Duration, DurationType, Filter, FilterType, Menu, Store, StoreEvent } from '@/interface';
import { ParsedUrlQuery } from 'querystring';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface QueryParams extends ParsedUrlQuery {
  page?: string;
  duration?: Duration;
  filter?: Filter;
}

interface StoreEventProps {
  storeEvents: Array<StoreEvent>;
  totalPages: number;
  currentPage: number;
}

// 함수에 전달할 매개변수의 타입 정의
interface MyFunctionParams {
  token: string;
  title: string;
  body: string;
}

// 함수가 반환할 결과의 타입 정의
interface MyFunctionResult {
  message: string;
  timestamp: number;
}

const Index = ({ storeEvents, totalPages, currentPage }: StoreEventProps) => {
  const router = useRouter();
  const {duration: currentDuration , filter: currentFilter } = router.query as QueryParams;
  const [page, setPage] = useState<number>(currentPage);
  const [duration, setDuration] = useState<Duration>("일별");
  const [filter, setFilter] = useState<Filter>("최신순");
  const [custom, setCustom] = useState<string>("No.4");

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const handleMoveDetail = (id:string) => router.push("/"+ id)

  const handleFilter = (filter: (typeof FilterType)[number]) => {
    const myFunction = httpsCallable<MyFunctionParams, MyFunctionResult>(functions, 'helloWorld2');
    myFunction({ token: 'value1', title: 'value2', body: 'value3' }).then((result)=>{
      const data = result.data as MyFunctionResult;
      setCustom(data.message);
      console.log(data.message);
    });
    
    setFilter(filter);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, filter },
    });
  };

  const handleDuration = async (newDuration: (typeof DurationType)[number]) => {
    setCustom("qwer");
    setDuration(newDuration);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, duration: newDuration },
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage },
    });
  };

  return (
    <Layout>
      <div>
        <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 lg:h-[60px]" />
        <div className="grid grid-cols-1 gap-4 p-4">
          <div className='flex gap-2'>
            <DurationDropdown duration={duration} onSelectDuration={handleDuration} />
            <FilterDropdown filter={filter} onSelectFilter={handleFilter} />
          </div>
          <div className="border shadow-sm rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className='pointer-events-none'>
                  <TableHead>{custom}</TableHead>
                  <TableHead>식당명</TableHead>
                  <TableHead>이벤트 메뉴</TableHead>
                  <TableHead>참여인원</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>가격</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeEvents
                  .sort((a, b) => {
                    if(currentFilter === "가격순") return b.menu.price - a.menu.price;
                    if(currentFilter === "참여인원순") return b.menuCount - a.menuCount;
                    return 0;
                  })
                  .map((storeEvent: StoreEvent, index: number) => {
                    return (
                      <TableRow key={storeEvent.id} className="cursor-pointer" onClick={() => handleMoveDetail(storeEvent.id)}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{storeEvent.store.name}</TableCell>
                        <TableCell>{storeEvent.menu.name}</TableCell>
                        <TableCell>{storeEvent.menuCount}</TableCell>
                        <TableCell>{storeEvent.menu.category}</TableCell>
                        <TableCell>{storeEvent.menu.price}</TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
        <EventListPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        <div className="grid grid-cols-1 gap-4 p-4">
          <div className="border shadow-sm rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className='pointer-events-none'>
                  <TableHead>가장 많은 메뉴</TableHead>
                  <TableHead>평균가격</TableHead>
                  <TableHead>평균 참여인원</TableHead>
                  <TableHead>가장 많은 카테고리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <AverageList storeEvents={storeEvents} />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  try {
    const db: Firestore = getFirestore(firebaseApp!);
    const { page = 1, duration = "일별", filter = "최신순" } = context.query
    const limitPerPage = 10;
    const pageNum = parseInt(page as string, 10);

    const totalDocsSnapshot = await getDocs(collection(db, 'storeEvents'));
    const totalDocs = totalDocsSnapshot.size;
    const totalPages = Math.ceil(totalDocs / limitPerPage);
    const startFrom = (pageNum - 1) * limitPerPage;
    const initialQuery = query(collection(db, 'storeEvents'),orderBy("createDt", "desc"),limit(startFrom + limitPerPage));



    const querySnapshot = await getDocs(initialQuery);
    const docsForCurrentPage = querySnapshot.docs.slice(startFrom, startFrom + limitPerPage);
    const storeEvents: DocumentData[] = docsForCurrentPage.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
      closeDt: doc.data().closeDt ? doc.data().closeDt.toDate().toISOString() : null,
      eatDt: doc.data().eatDt ? doc.data().eatDt.toDate().toISOString() : null,
    }));

    const storeIds = storeEvents.map(event => event.storeId);
    const menuIds = storeEvents.map(event => event.menuId);

    const storeData: { [key: string]: Store } = {};
    const menuData: { [key: string]: Menu } = {};

    for (const storeId of storeIds) {
      const storeDoc = await getDoc(doc(db, 'stores', storeId));
      if (storeDoc.exists()) {
        storeData[storeId] = {
          id: storeDoc.id,
          name: storeDoc.data().name,
          createDt: storeDoc.data().createDt ? storeDoc.data().createDt.toDate().toISOString() : null,
        } as Store;
      }
    }
    for (const menuId of menuIds) {
      const menuDoc = await getDoc(doc(db, 'menus', menuId));
      if (menuDoc.exists()) {
        menuData[menuId] = {
          id: menuDoc.id,
          name: menuDoc.data().name,
          price: menuDoc.data().price,
          category: menuDoc.data().category,
        } as Menu;
      }
    }

    const storeEventsWithStoreData = storeEvents.map(storeEvent => ({
      ...storeEvent,
      store: storeData[storeEvent.storeId] || [],
      menu: menuData[storeEvent.menuId] || [],
    }));

    return {
      props: {
        storeEvents: storeEventsWithStoreData,
        totalPages,
        currentPage: pageNum
      },
    };
  } catch (error) {
    console.error("Error fetching data: ", error);
    return {
      props: {
        storeEvents: [],
        totalPages: 1,
        currentPage: 1,
      },
    };
  }
};

export default Index;
