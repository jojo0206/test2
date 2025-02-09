import { ArrowLeftIcon } from "../icon";
import { Button } from "./button";
import { useRouter } from 'next/router';

interface Props {
    onPrev?: () => void;
    title:string;
}

export const DetailPageHeader = (props: Props) => {
    const router = useRouter();
    const handlePrev = () => {
        router.back();
    }
    return (
        <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
        <Button variant="ghost" size="icon" className="mr-4" onClick={props.onPrev ? props.onPrev : handlePrev}>
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="sr-only">뒤로가기</span>
        </Button>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tighter">{props.title}</h2>
        </div>
      </header>
    )
};

export default DetailPageHeader;

