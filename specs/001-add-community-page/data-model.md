# Data Models: Community Page

## Group
```typescript
interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  createdAt: string;
  // Additional fields as provided by API
}
```

## Post
```typescript
interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  groupId: string;
  createdAt: string;
  // Additional fields as provided by API
}
```

## API Response Types
```typescript
interface GroupSearchResponse {
  groups: Group[];
  total: number;
  // Pagination fields if any
}

interface UserGroupsResponse {
  groups: Group[];
  // Additional metadata if any
}

interface GroupPostsResponse {
  posts: Post[];
  total: number;
  // Pagination fields if any
}
```

## Context Types
```typescript
interface CommunityContextType {
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  isLoading: boolean;
  error: Error | null;
}
```
