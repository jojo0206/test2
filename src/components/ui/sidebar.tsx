import Link from 'next/link'
import { useRouter } from 'next/router'
import { Package2Icon, CalendarIcon, CalendarCheckIcon, ApprovalIcon, RestaurantIcon, ReviewIcon, PersonIcon } from '../icon';

interface NavLinkProps {
    href: string;
    icon: JSX.Element;
    text: string;
}

const NavLink = ({ href, icon, text }: NavLinkProps) => {
    const router = useRouter();
    const currentPath = router.pathname;
    const isActive = currentPath === href || (href === '/' && currentPath === '/video');

    return (
        <Link 
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
        >
                {icon}
                {text}
        </Link>
    );
};

export const SideBar = () => {
    return (
        <div className="hidden border-r bg-gray-100/40 lg:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-[60px] items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Package2Icon className="h-6 w-6" />
                        <span>Dashboard</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        <NavLink href="/" icon={<CalendarIcon className="h-4 w-4" />} text="이벤트 목록" />
                        <NavLink href="/users" icon={<PersonIcon className="h-4 w-4" />} text="회원 관리" />
                        <NavLink href="/management" icon={<CalendarCheckIcon className="h-4 w-4" />} text="이벤트 관리" />
                        <NavLink href="/restaurants" icon={<RestaurantIcon className="h-4 w-4" />} text="식당 정보" />
                        <NavLink href="/approvals" icon={<ApprovalIcon className="h-4 w-4" />} text="식당 승인" />
                        <NavLink href="/reviews" icon={<ReviewIcon className="h-4 w-4" />} text="리뷰 관리" />
                        <NavLink href="/alarms" icon={<ReviewIcon className="h-4 w-4" />} text="알림 보내기" />
                        <NavLink href="/kimages" icon={<ReviewIcon className="h-4 w-4" />} text="키워드 이미지" />
                    </nav>
                </div>
            </div>
        </div>
    );
};
