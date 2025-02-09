import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Input, Textarea, DetailPageHeader, Separator } from "@/components/ui";
import { firebaseApp, storage } from "@/firebase/firebaseClient";
import { Firestore, DocumentData, getFirestore, doc, getDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import axios from "axios";
import dayjs from "dayjs";
import { Store, Review } from '@/interface';
import { UploadIcon } from '../../components/icon/UploadIcon';

interface Props {
  store: Store;
  reviews: Array<Review>;
}

const ApprovalsDetailPage = ({ store, reviews }: Props) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bizFileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBusinessFile, setSelectedBusinessFile] = useState<File | null>(null);


  const [name, setName] = useState(store.name);
  const [isApproval, setIsApproval] = useState(store.isApproval);
  const [postNumber, setPostNumber] = useState(store.postNumber);
  const [description, setDescription] = useState(store.description);
  const [address, setAddress] = useState(store.address);
  const [addressDetail, setAddressDetail] = useState(store.addressDetail);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [businessImageUrl, setBusinessImageUrl] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handleIsApprovalChange = () => setIsApproval(!isApproval);
  const handlePostNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => setPostNumber(e.target.value);
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value);
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value);
  const handleAddressDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => setAddressDetail(e.target.value);

  const handleReview = (reviewId: string) => {
    router.push("/reviews/" + reviewId);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file, "store");
    }
  };
  const handleBizFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file, "biz");
    }
  };

  const handleFileSelect = (file: File, type:string) => {
    if(type === "biz") {
      setSelectedBusinessFile(file);
    }
    if(type === "store") {
      setSelectedFile(file);
    }
  };

  const handleIconClick = (type:string) => {
    if(type === "biz"){
      bizFileInputRef.current?.click();
    }
    if(type === "store") {
      fileInputRef.current?.click();
    }
  };

  const handleFileCancel = (type: string) => {
    if (type === "biz") {
      setSelectedBusinessFile(null);
    }
    if (type === "store") {
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        if (store.imageUrl) {
          const imageRef = ref(storage, store.imageUrl);
          const url = await getDownloadURL(imageRef);
          setImageURL(url);
        }
        if (store.businessImageUrl) {
          const businessImageRef = ref(storage, store.businessImageUrl);
          const url = await getDownloadURL(businessImageRef);
          setBusinessImageUrl(url);
        }
      } catch (error) {
        console.error("Error fetching images: ", error);
      }
    };

    fetchImages();
  }, [store.imageUrl, store.businessImageUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let imageUrl = store.imageUrl;
    let businessImageUrl = store.businessImageUrl;

    if (selectedFile) {
      const storageRef = ref(storage, `/store/image/${selectedFile}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    if (selectedBusinessFile) {
      const bizStorageRef = ref(storage, `/store/business/${selectedBusinessFile}`);
      const bizSnapshot = await uploadBytes(bizStorageRef, selectedBusinessFile);
      businessImageUrl = await getDownloadURL(bizSnapshot.ref);
    }

    try {
      const response = await axios.post('/api/restaurants/update', {
        data: {
          id: store.id,
          name,
          isApproval,
          postNumber,
          description,
          address,
          addressDetail,
          imageUrl,
          businessImageUrl,
        },
      });

      if (response.status === 200) {
        router.back();
      }
    } catch (error) {
      console.error('Error updating store:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete('/api/restaurants/delete', {
        data: {
          id: store.id,
        }
      });
      if (response.status === 200) {
        router.back();
      }
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  return (
    <div>
      <DetailPageHeader title="가게 승인" />
      <div className="bg-white p-6 w-full">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
              가게 이름
            </label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="userId" className="block text-gray-700 font-medium mb-1">
              사용자 ID
            </label>
            <Input
              type="text"
              id="userId"
              value={store.userId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
          </div>
          <div>
            <label htmlFor="isApproval" className="block text-gray-700 font-medium mb-1">
              승인 여부
            </label>
            <Input
              type="checkbox"
              id="isApproval"
              checked={isApproval}
              onChange={handleIsApprovalChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="businessNo" className="block text-gray-700 font-medium mb-1">
              사업자 번호
            </label>
            <Input
              type="text"
              id="businessNo"
              value={store.businessNo}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-1">
              이미지 URL
            </label>
            {imageURL && 
              <div className='flex justify-center items-center flex-col'>
                <img src={imageURL} alt={`${store.name} Image`} width={"360px"} height={"360px"} />
                <button onClick={() => setImageURL("")} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                  파일 선택
                </button>
              </div>
            }
            {!imageURL && !selectedFile &&
              <div 
                onClick={() => handleIconClick("store")}
                className='bg-slate-200 w-100 h-100 flex justify-center items-center flex-col py-4 cursor-pointer'
              >
                <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    파일을 선택하세요.
                  </span>
                </p>
              </div>
            }
            {!imageURL && selectedFile && 
              <div className="flex flex-col items-center justify-center text-center mt-4">
                <p className="text-gray-600 dark:text-gray-400">선택된 파일 : {selectedFile.name}</p>
                {selectedFile.type.startsWith('image/') && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="mt-4 max-h-48"
                    width={"360px"}
                    height={"360px"}
                  />
                )}
                <button onClick={() => handleFileCancel("store")} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                  파일 취소
                </button>
              </div>
            }
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
          <div>
            <label htmlFor="postNumber" className="block text-gray-700 font-medium mb-1">
              우편 번호
            </label>
            <Input
              type="text"
              id="postNumber"
              value={postNumber}
              onChange={handlePostNumberChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-700 font-medium mb-1">
              설명
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className='flex w-full space-x-4'>
            <div className="w-auto">
              <label htmlFor="address" className="block text-gray-700 font-medium mb-1">
                주소
              </label>
              <Input
                type="text"
                id="address"
                value={address}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-auto">
              <label htmlFor="addressDetail" className="block text-gray-700 font-medium mb-1">
                주소 상세
              </label>
              <Input
                type="text"
                id="addressDetail"
                value={addressDetail}
                onChange={handleAddressDetailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="businessImageUrl" className="block text-gray-700 font-medium mb-1">
              사업자 이미지 URL
            </label>
            {businessImageUrl && 
              <div className='flex justify-center items-center flex-col'>
                <img src={businessImageUrl} alt={`${store.name} businessImageUrl`} width={"360px"} height={"360px"} />
                <button onClick={() => setBusinessImageUrl("")} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                  파일 선택
                </button>
              </div>
            }
            {!businessImageUrl && !selectedBusinessFile &&
              <div 
                onClick={() => handleIconClick("biz")}
                className='bg-slate-200 w-100 h-100 flex justify-center items-center flex-col py-4 cursor-pointer'
              >
                <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    파일을 선택하세요.
                  </span>
                </p>
              </div>
            }
            {!businessImageUrl && selectedBusinessFile && 
              <div className="flex flex-col items-center justify-center text-center mt-4">
                <p className="text-gray-600 dark:text-gray-400">선택된 파일 : {selectedBusinessFile.name}</p>
                {selectedBusinessFile.type.startsWith('image/') && (
                  <img
                    src={URL.createObjectURL(selectedBusinessFile)}
                    alt="Preview"
                    className="mt-4 max-h-48"
                    width={"360px"}
                    height={"360px"}
                  />
                )}
                <button onClick={() => handleFileCancel("biz")} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                  파일 취소
                </button>
              </div>
            }            
            <input
              type="file"
              className="hidden"
              ref={bizFileInputRef}
              onChange={handleBizFileChange}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              저장하기
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              삭제하기
            </button>
          </div>
        </form>
        <Separator />
        {/* Review Table */}
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
                    <TableRow key={id} onClick={() => handleReview(id)} className="cursor-pointer"> 
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
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const { params } = context;
  const storeId = params?.id as string;

  try {
    const db: Firestore = getFirestore(firebaseApp!);
    const StoredocRef = doc(db, 'stores', storeId);
    const StoredocSnapshot = await getDoc(StoredocRef);

    if (!StoredocSnapshot.exists()) {
      return {
        notFound: true,
      };
    }

    const store: DocumentData = {
      ...StoredocSnapshot.data(),
      id: StoredocSnapshot.id,
      createDt: StoredocSnapshot.data().createDt ? StoredocSnapshot.data().createDt.toDate().toISOString() : null,
    };

    const reviewsRef = collection(db, 'reviews');
    const reviewsQuery = query(reviewsRef, where('storeId', '==', store.id), orderBy('createDt', 'desc'));
    const reviewsSnapshot = await getDocs(reviewsQuery);

    const reviews = reviewsSnapshot.docs.map(doc => ({
      ...doc.data(),
      createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
    }));


    return {
      props: {
        store: store,
        reviews: reviews
      },
    };

  } catch (error) {
    console.error("Error fetching data: ", error);
    return {
      props: {
        store: null,
        reviews: []
      },
    };
  }
};

export default ApprovalsDetailPage;