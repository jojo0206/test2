import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Input, Textarea, DetailPageHeader } from "@/components/ui"
import { firebaseApp, storage } from "@/firebase/firebaseClient";
import { Firestore, DocumentData,getFirestore, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { Alarm } from '@/interface';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { UploadIcon } from '../../components/icon/UploadIcon';

const hourItems = Array.from({ length: 24 }, (_, index) => index + 1);

interface HourDropdownProps {
  title: number
}

const HourDropdown = ({title}: HourDropdownProps) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button>{title} 시</button>
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal>
      <DropdownMenu.Content
      style={{
        maxHeight: '325px',
        overflowY: 'auto'
      }}
      >
        {hourItems.map((item) => (
          <DropdownMenu.Item 
            key={item}
            style={{ height: '50px', width: '100px' }}
            className="flex items-center px-4 bg-white"          
          >
            {item.toString().padStart(2, '0')}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);

const minItems = Array.from({ length: 60 }, (_, index) => index);

interface MinDropdownProps {
  title: number
}

const MinDropdown = ({title}: MinDropdownProps) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button>{title} 분</button>
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal>
      <DropdownMenu.Content
      style={{
        maxHeight: '325px',
        overflowY: 'auto'
      }}
      >
        {minItems.map((item) => (
          <DropdownMenu.Item 
            key={item}
            style={{ height: '50px', width: '100px' }}
            className="flex items-center px-4 bg-white"          
          >
            {item.toString().padStart(2, '0')}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);

interface AlarmProps {
  alarm: Alarm
}
  
const AlarmDetailPage = ({alarm}: AlarmProps) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hour, setHour] = useState<number | null>(alarm.hour);
  const [minute, setMinute] = useState<number | null>(alarm.minute);
  const [weekDays, setWeekDays] = useState<number>(alarm.weekDays || 1);

  const [sendUserIdList, setSendUserIdList] = useState<string>(alarm.sendUserIdList || "")
  
  const [repeat, setRepeat] = useState<boolean>(alarm.repeat || false);
  const [sendType, setSendType] = useState<number>(alarm.sendType || 1);
  const [name, setName] = useState<string>(alarm.name || "")
  const [content, setContent] = useState<string>(alarm.contents || "")

  const [imageURL, setImageURL] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isSun = () => {
    return weekDays >= 64;
  }
  const isSat = () => {
    return (isSun() ? weekDays - 64 : weekDays) >= 32;
  }
  const isFri = () => {
    var weekDaysVal = weekDays;
    if (weekDaysVal >= 64) {
      weekDaysVal -=  64;
    }
    if (weekDaysVal >= 32) {
      weekDaysVal -=  32;
    }
    return weekDaysVal >= 16;
  }
  const isThu = () => {
    var weekDaysVal = weekDays;
    if (weekDaysVal >= 64) {
      weekDaysVal -=  64;
    }
    if (weekDaysVal >= 32) {
      weekDaysVal -=  32;
    }
    if (weekDaysVal >= 16) {
      weekDaysVal -=  16;
    }
    return weekDaysVal >= 8;
  }
  const isWed = () => {
    var weekDaysVal = weekDays;
    if (weekDaysVal >= 64) {
      weekDaysVal -=  64;
    }
    if (weekDaysVal >= 32) {
      weekDaysVal -=  32;
    }
    if (weekDaysVal >= 16) {
      weekDaysVal -=  16;
    }
    if (weekDaysVal >= 8) {
      weekDaysVal -=  8;
    }
    return weekDaysVal >= 4;
  }
  const isTue = () => {
    var weekDaysVal = weekDays;
    if (weekDaysVal >= 64) {
      weekDaysVal -=  64;
    }
    if (weekDaysVal >= 32) {
      weekDaysVal -=  32;
    }
    if (weekDaysVal >= 16) {
      weekDaysVal -=  16;
    }
    if (weekDaysVal >= 8) {
      weekDaysVal -=  8;
    }
    if (weekDaysVal >= 4) {
      weekDaysVal -=  4;
    }
    return weekDaysVal >= 2;
  }
  const isMon = () => {
    var weekDaysVal = weekDays;
    if (weekDaysVal >= 64) {
      weekDaysVal -=  64;
    }
    if (weekDaysVal >= 32) {
      weekDaysVal -=  32;
    }
    if (weekDaysVal >= 16) {
      weekDaysVal -=  16;
    }
    if (weekDaysVal >= 8) {
      weekDaysVal -=  8;
    }
    if (weekDaysVal >= 4) {
      weekDaysVal -=  4;
    }
    if (weekDaysVal >= 2) {
      weekDaysVal -=  2;
    }
    return weekDaysVal >= 1;
  }

  const handleIsSendTypeAllChange = () => setSendType(1);
  const handleIsSendTypeResChange = () => setSendType(2);
  const handleIsSendTypeIdListChange = () => setSendType(3);  

  const isSendTypeAll = () => {
    return sendType == 1;
  }  
  const isSendTypeRes = () => {
    return sendType == 2;
  }  
  const isSendTypeIdList = () => {
    return sendType == 3;
  }  

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
        if (alarm.imageUrl) {
          const imageRef = ref(storage, alarm.imageUrl);
          const url = await getDownloadURL(imageRef);
          setImageURL(url);
        }
      } catch (error) {
        console.error("Error fetching images: ", error);
      }
    };

    fetchImages();
  }, [alarm.imageUrl]);

  const handleIsMonChange = () => setWeekDays(weekDays + (isMon() ? -1 : 1));
  const handleIsTueChange = () => setWeekDays(weekDays + (isTue() ? -2 : 2));
  const handleIsWedChange = () => setWeekDays(weekDays + (isWed() ? -4 : 4));
  const handleIsThuChange = () => setWeekDays(weekDays + (isThu() ? -8 : 8));
  const handleIsFriChange = () => setWeekDays(weekDays + (isFri() ? -16 : 16));
  const handleIsSatChange = () => setWeekDays(weekDays + (isSat() ? -32 : 32));
  const handleIsSunChange = () => setWeekDays(weekDays + (isSun() ? -64 : 64));

  const handleRepeatChange = () => setRepeat(!repeat);

  const handleContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      // const { id,name,sendType,sendUserIdList,contents, repeat, weekDays, hour, minute, imageUrl } = req.body.data;
      const response = await axios.post('/api/alarms/update', {
        data: {
          id: alarm.id,
          contents: content,
          sendUserIdList: sendUserIdList,
          imageUrl: imageURL,
          hour: hour,
          minute: minute,
          weekDays: weekDays,
          sendType: sendType,
          name: name,
          repeat: repeat
        }
      });
      if(response.status === 200){
        router.back();
      }
    } catch (error) {
      console.error('Error Update Alarm:', error);
    }
  }

  const handleDelete = async () => {
    try {
      const response = await axios.delete('/api/alarms/delete', {
        data: {
          id: alarm.id
        }
      })
      if(response.status === 200){
        router.back();
      }
    } catch (error) {
      console.error('Error Delete Alarm:', error);
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
            value={alarm.name}
          />
        </div>


        <div className=''>
          <label htmlFor="sendType" className="block text-gray-700 font-medium mb-1">
            대상 선택
          </label>
          <div className='flex w-full space-x-4'>
            <div className="w-auto">
              <label htmlFor="isSendTypeAll" className="block text-gray-700 font-regular mb-1">
                전체 회원 
              </label>
              <Input
                type="checkbox"
                id="isSendTypeAll"
                checked={isSendTypeAll()}
                onChange={handleIsSendTypeAllChange}
                className="flex w-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-auto">
              <label htmlFor="isSendTypeRes" className="block text-gray-700 font-regular mb-1">
                식당 회원 
              </label>
              <Input
                type="checkbox"
                id="isSendTypeRes"
                checked={isSendTypeRes()}
                onChange={handleIsSendTypeResChange}
                className="flex w-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="w-auto">
              <label htmlFor="isSendTypeIdList" className="block text-gray-700 font-regular mb-1">
              특정ID만 
              </label>
              <Input
                type="checkbox"
                id="isSendTypeIdList"
                checked={isSendTypeIdList()}
                onChange={handleIsSendTypeIdListChange}
                className="flex w-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>


        <div>
          <label htmlFor="body" className="block text-gray-700 font-medium mb-1">
            내용
          </label>
          <Textarea
            id="body"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={content}
            onChange={handleContent}
          />
        </div>


        <div>
            <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-1">
              이미지 URL
            </label>
            {imageURL && 
              <div className='flex justify-center items-center flex-col'>
                <img src={imageURL} alt={`${alarm.name} Image`} width={"360px"} height={"360px"} />
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




        <div className=''>
          <label htmlFor="repeat" className="block text-gray-700 font-medium mb-1">
                반복 여부
              </label>
          <Input
            type="checkbox"
            id="repeat"
            checked={repeat}
            onChange={handleRepeatChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className=''>
          <label htmlFor="time" className="block text-gray-700 font-medium mb-1">
              시 선택
          </label>
          <HourDropdown title={hour || 12}/>
        </div>
        <div className=''>
          <label htmlFor="time" className="block text-gray-700 font-medium mb-1">
              분 선택
          </label>
          <MinDropdown title={minute || 0}/>
        </div>
        <div className=''>
          <label htmlFor="weekdays" className="block text-gray-700 font-medium mb-1">
            요일 선택
          </label>
          <div className='flex w-full space-x-4'>
            <div className="w-auto">
              <label htmlFor="isMon" className="block text-gray-700 font-regular mb-1">
                월요일
              </label>
              <Input
                type="checkbox"
                id="isMon"
                checked={isMon()}
                onChange={handleIsMonChange}
                className="flex w-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-auto">
              <label htmlFor="isTue" className="block text-gray-700 font-regular mb-1">
                화요일
              </label>
              <Input
                type="checkbox"
                id="isTue"
                checked={isTue()}
                onChange={handleIsTueChange}
                className="flex w-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="w-auto">
              <label htmlFor="isWed" className="block text-gray-700 font-regular mb-1">
              수요일
              </label>
              <Input
                type="checkbox"
                id="isWed"
                checked={isWed()}
                onChange={handleIsWedChange}
                className="flex w-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-auto">
              <label htmlFor="isThu" className="block text-gray-700 font-regular mb-1">
              목요일
              </label>
              <Input
                type="checkbox"
                id="isThu"
                checked={isThu()}
                onChange={handleIsThuChange}
                className="flex w-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-auto">
              <label htmlFor="isFri" className="block text-gray-700 font-regular mb-1">
              금요일
              </label>
              <Input
                type="checkbox"
                id="isFri"
                checked={isFri()}
                onChange={handleIsFriChange}
                className="flex w-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-auto">
              <label htmlFor="isSat" className="block text-gray-700 font-regular mb-1">
              토요일
              </label>
              <Input
                type="checkbox"
                id="isSat"
                checked={isSat()}
                onChange={handleIsSatChange}
                className="flex w-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-auto">
              <label htmlFor="isSun" className="block text-gray-700 font-regular mb-1">
              일요일
              </label>
              <Input
                type="checkbox"
                id="isSun"
                checked={isSun()}
                onChange={handleIsSunChange}
                className="flex w-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
  const alarmId = params?.id as string; // 고유 ID 사용

  try {
      const db: Firestore = getFirestore(firebaseApp!);
      const docRef = doc(db, 'alarms', alarmId); // 고유 ID를 사용하여 문서 참조
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        return {
          notFound: true,
        };
      }

      const alarm: DocumentData = {
          ...docSnapshot.data(),
          id: docSnapshot.id,
          createDt: docSnapshot.data().createDt ? docSnapshot.data().createDt.toDate().toISOString() : null,
      };

      return {
          props: {
              alarm: alarm,
          },
      };

  } catch (error) {
      console.error("Error fetching data: ", error);
      return {
          props: {
            alarm: null,
          },
      };
  }
};


export default AlarmDetailPage;