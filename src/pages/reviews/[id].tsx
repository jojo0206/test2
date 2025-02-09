import { useState } from 'react';
import { useRouter } from 'next/router';
import { Input, Textarea, DetailPageHeader } from "@/components/ui"
import { firebaseApp } from "@/firebase/firebaseClient";
import { Firestore, DocumentData,getFirestore, doc, getDoc } from 'firebase/firestore';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { Review } from '@/interface';

interface ReviewProps {
  review: Review
}

const ReviewDetailPage = ({review}: ReviewProps) => {
  const router = useRouter()

  const [cleanRate, setCleanRate] = useState<number | null>(review.cleanRate);
  const [kindRate, setKindRate] = useState<number | null>(review.kindRate);
  const [moodRate, setMoodRate] = useState<number | null>(review.moodRate);
  const [tasteRate, setTasteRate] = useState<number | null>(review.tasteRate);
  const [content, setContent] = useState<string>(review.contents || "")

  const handleContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/reviews/update', {
        data: {
          id: review.id,
          contents: content,
          cleanRate: cleanRate,
          kindRate: kindRate,
          moodRate: moodRate,
          tasteRate: tasteRate
        }
      });
      if(response.status === 200){
        router.back();
      }
    } catch (error) {
      console.error('Error Update Review:', error);
    }
  }

  const handleDelete = async () => {
    try {
      const response = await axios.delete('/api/reviews/delete', {
        data: {
          id: review.id
        }
      })
      if(response.status === 200){
        router.back();
      }
    } catch (error) {
      console.error('Error Delete Review:', error);
    }
  };

  return (
    <div>
      <DetailPageHeader title='리뷰'/>
      <div className="bg-white p-6 w-full">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="user" className="block text-gray-700 font-medium mb-1">
            작성자
          </label>
          <Input
            type="text"
            id="user"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={review.userId}
            readOnly
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
        <div>
          <label htmlFor="body" className="block text-gray-700 font-medium mb-1">
            상점 바로가기
          </label>
          <Input
            id="body"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={review.storeId}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-gray-700 font-medium mb-1">
            이벤트 바로가기
          </label>
          <Textarea
            id="body"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={review.eventId}
            readOnly
          />
        </div>
        <div className=''>
        <Typography component="legend">Clean Rate</Typography>
        <Rating
          name="simple-controlled"
          value={cleanRate}
          onChange={(event, newValue) => {
            setCleanRate(newValue);
          }}
        />
        <Typography component="legend">Kind Rate</Typography>
        <Rating
          name="simple-controlled"
          value={kindRate}
          onChange={(event, newValue) => {
            setKindRate(newValue);
          }}
        />
        <Typography component="legend">Mood Rate</Typography>
        <Rating
          name="simple-controlled"
          value={moodRate}
          onChange={(event, newValue) => {
            setMoodRate(newValue);
          }}
        />
        <Typography component="legend">Taste Rate</Typography>
        <Rating
          name="simple-controlled"
          value={tasteRate}
          onChange={(event, newValue) => {
            setTasteRate(newValue);
          }}
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
  const reviewId = params?.id as string; // 고유 ID 사용

  try {
      const db: Firestore = getFirestore(firebaseApp!);
      const docRef = doc(db, 'reviews', reviewId); // 고유 ID를 사용하여 문서 참조
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        return {
          notFound: true,
        };
      }

      const review: DocumentData = {
          ...docSnapshot.data(),
          id: docSnapshot.id,
          createDt: docSnapshot.data().createDt ? docSnapshot.data().createDt.toDate().toISOString() : null,
      };

      return {
          props: {
              review: review,
          },
      };

  } catch (error) {
      console.error("Error fetching data: ", error);
      return {
          props: {
            review: null,
          },
      };
  }
};


export default ReviewDetailPage;