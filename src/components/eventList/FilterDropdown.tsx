import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, FilterType } from "@/interface";


interface FilterProps {
  filter: Filter;
  onSelectFilter: (newFilter: Filter) => void;
}

export const FilterDropdown = ({ filter, onSelectFilter }: FilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{filter}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem
          checked={filter === FilterType[0]}
          onCheckedChange={() => onSelectFilter(FilterType[0])}
        >
          최신순
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filter === FilterType[1]}
          onCheckedChange={() => onSelectFilter(FilterType[1])}
        >
          가격순
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filter === FilterType[2]}
          onCheckedChange={() => onSelectFilter(FilterType[2])}
        >
          참여인원순
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
