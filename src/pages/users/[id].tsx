import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Input, DetailPageHeader, Separator, Button } from "@/components/ui";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { firebaseApp, storage } from "@/firebase/firebaseClient";
import { Firestore, DocumentData, getFirestore, doc, getDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import axios from "axios";
import dayjs from "dayjs";
import { Point, User } from '@/interface';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter, 
  DialogClose
} from "@/components/ui/dialog"
import { UploadIcon } from '@/components/icon';

interface Props {
  user: User;
  points: Array<Point>;
}

const UserDetail = ({ user, points }: Props) => {
  const router = useRouter();
  const thumbnailRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => setSelectedFile(file);
  const handleIconClick = () => thumbnailRef.current?.click();
  const handleFileCancel = () => setSelectedFile(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname);
  const [phone, setPhone] = useState(user.phone);
  const [gender, setGender] = useState(user.gender);
  const [email, setEmail] = useState(user.email);
  const [birth, setBirth] = useState(user.birth);
  const [fcmToken, setFcmToken] = useState(user.fcmToken);
  const [userTypeExt, setUserTypeExt] = useState(user.userTypeExt);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [normalBirth, setNormalBirth] = useState(user.normalBirth || '');
  const [normalGender, setNormalGender] = useState(user.normalGender || '');
  const [normalName, setNormalName] = useState(user.normalName || '');
  const [normalNickname, setNormalNickname] = useState(user.normalNickname || '');
  const [normalPhone, setNormalPhone] = useState(user.normalPhone || '');
  const [storeGender, setStoreGender] = useState(user.storeGender || '');
  const [storeName, setStoreName] = useState(user.storeName || '');
  const [storeNickname, setStoreNickname] = useState(user.storeNickname || '');
  const [storePhone, setStorePhone] = useState(user.storePhone || '');
  const [storeBirth, setStoreBirth] = useState(user.storeBirth || '');

  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [point, setPoint] = useState<string>('');

  const inputProps = (type: string = "text") => {
    return {
      "type": type,
      "className" : "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    }
  }

  const handleDialog = () => setIsOpenDialog((prev:boolean) => !prev);
  const handlePoint = ( {target: { value }} : React.ChangeEvent<HTMLInputElement>) => setPoint(value);

  const handlePayPoint = async () => {
    try {
      const response = await axios.post(`/api/users/payPoint`, {
        data: {
          point : point,
          userId: user.id,
          currentDate: new Date().toISOString(),
        }
      });
      if (response.status === 200) {
        router.replace(router.asPath);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsOpenDialog(false);
    }
  }

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        if (user.thumbnailUrl) {
          const thumbnailRef = ref(storage, user.thumbnailUrl);
          const url = await getDownloadURL(thumbnailRef);
          setThumbnailUrl(url);
        }
      } catch (error) {
        console.error("Error fetching thumbnail: ", error);
      }
    };

    fetchThumbnail();
  }, [user.thumbnailUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let thumbnailUrl = user.thumbnailUrl;
    if (selectedFile) {
      const storageRef = ref(storage, `/user/image/${selectedFile}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      thumbnailUrl = await getDownloadURL(snapshot.ref);
    }

    try {
      const response = await axios.post('/api/users/update', {
        data: {
          id: user.id,
          name,
          nickname,
          phone,
          storeBirth,
          gender,
          email,
          thumbnailUrl,
          birth,
          fcmToken,
          normalBirth,
          normalGender,
          normalName,
          normalNickname,
          normalPhone,
          storeGender,
          storeName,
          storeNickname,
          storePhone,
          userTypeExt
        }
      });
      if (response.status === 200) {
        router.back();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div>
      <DetailPageHeader title="회원 관리" />
      <div className="bg-white p-6 w-full">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleInputChange(setName, e)}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="nickname" className="block text-gray-700 font-medium mb-1">
              Nickname
            </label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => handleInputChange(setNickname, e)}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
              Phone
            </label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => handleInputChange(setPhone, e)}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-gray-700 font-medium mb-1">
              Gender
            </label>
            <Input
              id="gender"
              value={gender}
              onChange={(e) => handleInputChange(setGender, e)}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              value={email}
              onChange={(e) => handleInputChange(setEmail, e)}
              {...inputProps("email")}
            />
          </div>
          <div>
            <label htmlFor="birth" className="block text-gray-700 font-medium mb-1">
              Birth
            </label>
            <Input
              id="birth"
              value={birth}
              onChange={(e) => handleInputChange(setBirth, e)}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="fcmToken" className="block text-gray-700 font-medium mb-1">
              FCM Token
            </label>
            <Input
              id="fcmToken"
              value={fcmToken}
              onChange={(e) => handleInputChange(setFcmToken, e)}
              placeholder={'FCM TOKEN 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="normalBirth" className="block text-gray-700 font-medium mb-1">
              Normal Birth
            </label>
            <Input
              id="normalBirth"
              value={normalBirth}
              onChange={(e) => handleInputChange(setNormalBirth, e)}
              placeholder={'Normal Birth 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="normalGender" className="block text-gray-700 font-medium mb-1">
              Normal Gender
            </label>
            <Input
              id="normalGender"
              value={normalGender}
              onChange={(e) => handleInputChange(setNormalGender, e)}
              placeholder={'Normal Gender 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="normalName" className="block text-gray-700 font-medium mb-1">
              Normal Name
            </label>
            <Input
              id="normalName"
              value={normalName}
              onChange={(e) => handleInputChange(setNormalName, e)}
              placeholder={'Normal Name 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="normalNickname" className="block text-gray-700 font-medium mb-1">
              Normal Nickname
            </label>
            <Input
              id="normalNickname"
              value={normalNickname}
              onChange={(e) => handleInputChange(setNormalNickname, e)}
              placeholder={'Normal Nickname 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="normalPhone" className="block text-gray-700 font-medium mb-1">
              Normal Phone
            </label>
            <Input
              id="normalPhone"
              value={normalPhone}
              onChange={(e) => handleInputChange(setNormalPhone, e)}
              placeholder={'Normal Phone 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="storeGender" className="block text-gray-700 font-medium mb-1">
              Store Gender
            </label>
            <Input
              id="storeGender"
              value={storeGender}
              onChange={(e) => handleInputChange(setStoreGender, e)}
              placeholder={'Store Gender 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="storeName" className="block text-gray-700 font-medium mb-1">
              Store Name
            </label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => handleInputChange(setStoreName, e)}
              placeholder={'Store Name 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="storeNickname" className="block text-gray-700 font-medium mb-1">
              Store Nickname
            </label>
            <Input
              id="storeNickname"
              value={storeNickname}
              onChange={(e) => handleInputChange(setStoreNickname, e)}
              placeholder={'Store Nickname 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="storePhone" className="block text-gray-700 font-medium mb-1">
              Store Phone
            </label>
            <Input
              id="storePhone"
              value={storePhone}
              onChange={(e) => handleInputChange(setStorePhone, e)}
              placeholder={'Store Phone 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="storeBirth" className="block text-gray-700 font-medium mb-1">
              Store Birth
            </label>
            <Input
              id="storeBirth"
              value={storeBirth}
              onChange={(e) => handleInputChange(setStoreBirth, e)}
              placeholder={'Store Birth 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="userTypeExt" className="block text-gray-700 font-medium mb-1">
              User Type Extension
            </label>
            <Input
              id="userTypeExt"
              value={userTypeExt}
              onChange={(e) => handleInputChange(setUserTypeExt, e)}
              placeholder={'User Type Extension 값이 비어있습니다.'}
              {...inputProps()}
            />
          </div>
          <div>
            <label htmlFor="thumbnailUrl" className="block text-gray-700 font-medium mb-1">
              Thumbnail
            </label>
            {thumbnailUrl &&
              <div className='flex justify-center items-center flex-col'>
                <img src={thumbnailUrl} alt={`${name} Thumbnail`} width={"360px"} height={"360px"} />
                <button onClick={() => setThumbnailUrl(null)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                    파일 선택
                </button>
              </div>
            }  
            {!thumbnailUrl && !selectedFile &&
              <div onClick={handleIconClick} className='bg-slate-200 w-100 h-100 flex justify-center items-center flex-col py-4 cursor-pointer'>
                <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    파일을 선택하세요.
                  </span>
                </p>
              </div>
            }
            {!thumbnailUrl && selectedFile && 
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
                <button onClick={handleFileCancel} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                  파일 취소
                </button>
              </div>
            }                        
            <input
              type="file"
              className="hidden"
              ref={thumbnailRef}
              onChange={handleFileChange}
            /> 
          </div>
          <div className="flex justify-end gap-4">
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
              저장하기
            </button>
          </div>
        </form>
        <Separator/>
        <div className="py-4">
          <h2 className="text-2xl font-bold tracking-tighter">포인트 적립 내용</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4">
          <div className="flex justify-end gap-4">
            <button type="button" onClick={handleDialog} className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-medium py-2 px-4 rounded-md">
              포인트 지급하기
            </button>
          </div>
          <Dialog open={isOpenDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>포인트 지급</DialogTitle>
                <DialogDescription>
                  유저에게 지급할 포인트를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <label htmlFor="thumbnailUrl" className="block text-gray-700 font-medium mb-1">
                Point
              </label>
              <Input value={point} onChange={handlePoint} placeholder='지급할 포인트를 입력해주세요.'/>
              <DialogFooter className="justify-end"> 
                <div className="flex gap-4">
                  <Button type="button" onClick={handlePayPoint}>
                    지급하기
                  </Button>
                  <DialogClose>
                    <Button type="button" variant="secondary" onClick={() => setIsOpenDialog(false)}>
                      닫기
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="border shadow-sm rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className='pointer-events-none'>
                  <TableHead>Id</TableHead>
                  <TableHead>User Id</TableHead>
                  <TableHead>Reserve Id</TableHead>
                  <TableHead>Point</TableHead>
                  <TableHead>CreatedAt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point: Point) => {
                  console.log(point);
                  const createdAt = dayjs(point.createDt).format("YYYY-MM-DD")
                  return (
                    <TableRow key={point.id}> 
                      <TableCell>{point.id}</TableCell>
                      <TableCell>{point.userId}</TableCell>
                      <TableCell>{point.reserveId}</TableCell>
                      <TableCell>{point.point}</TableCell>
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
  const userId = params?.id as string;

  try {
    const db: Firestore = getFirestore(firebaseApp!);
    const userDocRef = doc(db, 'users', userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) {
      return {
        notFound: true,
      };
    }

    const user: DocumentData = {
      ...userDocSnapshot.data(),
      id: userDocSnapshot.id,
      createDt: userDocSnapshot.data().createDt ? userDocSnapshot.data().createDt.toDate().toISOString() : null,
    };

    const pointsRef = collection(db, 'points');
    const pointsQuery = query(pointsRef, where('userId', '==', user.id), orderBy('createDt', 'desc'));
    const pointsSnapshot = await getDocs(pointsQuery);

    const points: DocumentData[] = pointsSnapshot.docs.map(doc => ({
      ...doc.data(),
      createDt: doc.data().createDt ? doc.data().createDt.toDate().toISOString() : null,
    }));


    return {
      props: {
        user: user,
        points: points,
      },
    };

  } catch (error) {
    console.error("Error fetching user data: ", error);
    return {
      props: {
        user: null,
        points: [],
      },
    };
  }
};

export default UserDetail;
