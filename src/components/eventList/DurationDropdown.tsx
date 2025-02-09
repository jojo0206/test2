import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Duration, DurationType } from "@/interface";

interface DurationProps {
  duration: Duration;
  onSelectDuration: (newDuration: Duration) => void; // onSelectDuration의 파라미터 타입을 Duration으로 변경
}

export const DurationDropdown = ({ duration, onSelectDuration }: DurationProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{duration}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem
          checked={duration === DurationType[0]}
          onCheckedChange={() => onSelectDuration(DurationType[0])}
        >
          일별
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={duration === DurationType[1]}
          onCheckedChange={() => onSelectDuration(DurationType[1])}
        >
          주별
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={duration === DurationType[2]}
          onCheckedChange={() => onSelectDuration(DurationType[2])}
        >
          월별
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
