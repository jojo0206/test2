import { TableCell } from "@/components/ui/table"
import { StoreEvent } from "@/interface";

interface Props {
    storeEvents: Array<StoreEvent>;
}

export const AverageList = ({ storeEvents } : Props) => {
    let menuCountMap:any = {};
    let totalMenuPrice = 0;
    let totalParticipants = 0;
    let categoryCountMap:any = {};
    
    storeEvents.forEach((entry:StoreEvent) => {
        let menuName = entry.menu.name;
        if (menuName in menuCountMap) {
            menuCountMap[menuName] += 1;
        } else {
            menuCountMap[menuName] = 1;
        }
        
        totalMenuPrice += entry.menu.price;      
        totalParticipants += entry.menuCount;
        
        let category = entry.menu.category;
        if (category in categoryCountMap) {
            categoryCountMap[category] += 1;
        } else {
            categoryCountMap[category] = 1;
        }
    });
    
    const mostOrderedMenuName = Object.keys(menuCountMap).reduce((a, b) => menuCountMap[a] > menuCountMap[b] ? a : b);
    const averagePrice = totalMenuPrice / storeEvents.length;
    const averageParticipants = totalParticipants / storeEvents.length;
    const mostCommonCategory = Object.keys(categoryCountMap).reduce((a, b) => categoryCountMap[a] > categoryCountMap[b] ? a : b);
  
    return (
        <>
            <TableCell>{mostOrderedMenuName}</TableCell>
            <TableCell>{averagePrice}</TableCell>
            <TableCell>{averageParticipants}</TableCell>
            <TableCell>{mostCommonCategory}</TableCell>
        </>
    )
};

export default AverageList;
