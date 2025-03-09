import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Input, Textarea, DetailPageHeader } from "@/components/ui"
import { firebaseApp, storage } from "@/firebase/firebaseClient";
import { collection, getDocs, query, where, orderBy, Firestore, DocumentData,getFirestore, doc, getDoc } from 'firebase/firestore';

// import { collection, getDocs, Firestore, DocumentData,getFirestore, orderBy, query } from 'firebase/firestore';

import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { Keyword, Kimage } from '@/interface';
import { UploadIcon } from '../../components/icon/UploadIcon';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const hourItems = Array.from({ length: 24 }, (_, index) => index + 1);

interface HourDropdownProps {
  onSelectFilter: (newFilter: number) => void,
  title: number
}

const HourDropdown = ({title, onSelectFilter}: HourDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">{title} 시</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent 
      className="w-56"
      style={{
        maxHeight: '500px',
        overflowY: 'auto'
      }}
    >
      {hourItems.map((item) => (
        <DropdownMenuCheckboxItem 
          checked={title === item}
          onCheckedChange={() => onSelectFilter(item)}
          // key={item}
          // style={{ height: '50px', width: '100px' }}
          // className="flex items-center px-4 bg-white"          
        >
          {item.toString().padStart(2, '0')}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const minItems = Array.from({ length: 12 }, (_, index) => index * 5);

interface MinDropdownProps {
  onSelectFilter: (newFilter: number) => void,
  title: number
}

const MinDropdown = ({title, onSelectFilter}: MinDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">{title} 분</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent 
      className="w-56"
      style={{
        maxHeight: '500px',
        overflowY: 'auto'
      }}
    >
      {minItems.map((item) => (
        <DropdownMenuCheckboxItem 
          checked={title === item}
          onCheckedChange={() => onSelectFilter(item)}
          // key={item}
          // style={{ height: '50px', width: '100px' }}
          // className="flex items-center px-4 bg-white"          
        >
          {item.toString().padStart(2, '0')}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

interface KimageProps {
  kimage: Kimage
  keywords: Array<Keyword>
}
  
const KimageDetailPage = ({kimage}: KimageProps) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState<string>(kimage.name || "")
  const [desc, setDesc] = useState<string>(kimage.desc || "")

  const [imageURL, setImageURL] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file, "store");
    }
  };
  const handleFileSelect = (file: File, type:string) => {
    setSelectedFile(file);
  };
  const handleIconClick = (type:string) => {
    fileInputRef.current?.click();
  };
  const handleFileCancel = (type: string) => {
    setSelectedFile(null);
  };
  useEffect(() => {
    const fetchImages = async () => {
      try {
        if (kimage.imageUrl) {
          const imageRef = ref(storage, kimage.imageUrl);
          const url = await getDownloadURL(imageRef);
          setImageURL(url);
        }
      } catch (error) {
        console.error("Error fetching images: ", error);
      }
    };

    fetchImages();
  }, [kimage.imageUrl]);

  const handleNameChange = ({target: { value }}: React.ChangeEvent<HTMLInputElement>) => setName(value);

  const handleDescChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDesc(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let imageUrl = kimage.imageUrl;

    if (selectedFile) {
      const storageRef = ref(storage, `/store/image/${selectedFile}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    try {
      // const { id,name,sendType,sendUserIdList,contents, repeat, weekDays, hour, minute, imageUrl } = req.body.data;
      const response = await axios.post('/api/kimages/update', {
        data: {
          id: kimage.id,
          desc: desc,
          imageUrl: imageUrl,
          name: name
        }
      });
      if(response.status === 200){
        router.back();
      }
    } catch (error) {
      console.error('Error Update Kimage:', error);
    }
  }

  const handleDelete = async () => {
    try {
      const response = await axios.delete('/api/kimages/delete', {
        data: {
          id: kimage.id
        }
      })
      if(response.status === 200){
        router.back();
      }
    } catch (error) {
      console.error('Error Delete Kimage:', error);
    }
  };

  return (
    <div>
      <DetailPageHeader title='알람'/>
      <div className="bg-white p-6 w-full">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
            이름
          </label>
          <Input
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={kimage.name}
            onChange={handleNameChange}
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-gray-700 font-medium mb-1">
            설명
          </label>
          <Textarea
            id="desc"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={desc}
            onChange={handleDescChange}
          />
        </div>


        <div>
            <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-1">
              이미지 URL
            </label>
            {imageURL && 
              <div className='flex justify-center items-center flex-col'>
                <img src={imageURL} alt={`${kimage.name} Image`} width={"360px"} height={"360px"} />
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
    </div>
  </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context:GetServerSidePropsContext) => {
  const { params } = context;
  const kimageId = params?.id as string; // 고유 ID 사용

  // export interface Kimage {
  //   id: string;
  //   name: string;
  //   sendType: number;//1 전체, 2 식당, 3 특정 
  //   sendUserIdList: string;
  //   contents: string;
  
  //   repeat: boolean;
  
  //   weekDays: number;
  //   hour: number;
  //   minute: number;
  
  //   imageUrl: string;
  
  //   createDt: string;
  // }
  
  if (kimageId == 'new') {
        return {
            props: {
                kimage: {

                },
                keywords: null,
            },
        };
  } else {
    try {
        const db: Firestore = getFirestore(firebaseApp!);
        const docRef = doc(db, 'kimages', kimageId); // 고유 ID를 사용하여 문서 참조
        const docSnapshot = await getDoc(docRef);

        if (!docSnapshot.exists()) {
          return {
            notFound: true,
          };
        }

        const keywordCollection = collection(db, 'keywords');
        // collection(db, "cities"), where("capital", "==", true)
        const keywordQuerySnapshot = await getDocs(query(keywordCollection, where("imageId", "==", kimageId), orderBy("createDt","desc")));
        const keywords: DocumentData[] = keywordQuerySnapshot.docs.map(doc => ({
            ...doc.data(),
            createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
            id: doc.id,
        }));
  
        const kimage: DocumentData = {
            ...docSnapshot.data(),
            id: docSnapshot.id,
            createDt: docSnapshot.data().createDt ? docSnapshot.data().createDt.toDate().toISOString() : null,
        };

        kimage.keywords = keywords;
        
        return {
            props: {
                kimage: kimage,
                keywords: keywords,
            },
        };

    } catch (error) {
        console.error("Error fetching data: ", error);
        return {
            props: {
              kimage: null,
              keywords: null,
            },
        };
    }
  }
};


export default KimageDetailPage;