import { useState } from 'react';
import { useRouter } from 'next/router';
import { Input, Textarea, DetailPageHeader } from "@/components/ui"
import { firebaseApp } from "@/firebase/firebaseClient";
import { Firestore, DocumentData,getFirestore, doc, getDoc } from 'firebase/firestore';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { Alarm } from '@/interface';

interface AlarmProps {
  alarm: Alarm
}
  
const AlarmDetailPage = ({alarm}: AlarmProps) => {
  const router = useRouter()

  const [hour, setHour] = useState<number | null>(alarm.hour);
  const [minute, setMinute] = useState<number | null>(alarm.minute);
  const [weekDays, setWeekDays] = useState<number>(alarm.weekDays || 1);

  const [repeat, setRepeat] = useState<boolean>(alarm.repeat || false);
  const [sendType, setSendType] = useState<number>(alarm.sendType || 1);
  const [name, setName] = useState<string>(alarm.name || "")
  const [content, setContent] = useState<string>(alarm.contents || "")

  const handleRepeatChange = () => setRepeat(!repeat);

  const handleContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/alarms/update', {
        data: {
          id: alarm.id,
          contents: content,
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