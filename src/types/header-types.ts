export interface AuthUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  loginName: string;
  image: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  path: string;
}

export interface SearchResponse {
  results: SearchResult[];
  nextCursor: string | null;
  totalCount: number;
}

export interface SidebarContextType {
  isOpen?: boolean;
  isMobile?: boolean;
}

export interface HeaderProps {
  className?: string;
}
