# API Contracts: Community Page

## 1. Search Groups
```typescript
// GET /group/get/all?name={searchQuery}
interface SearchGroupsRequest {
  name: string; // Search query string
  // Pagination parameters if needed
}

interface SearchGroupsResponse {
  success: boolean;
  data: {
    groups: Array<{
      id: string;
      name: string;
      description?: string;
      memberCount?: number;
      createdAt: string;
    }>;
    total: number;
  };
  error?: string;
}
```

## 2. Get User Groups
```typescript
// GET /group/get/by-user?
interface GetUserGroupsResponse {
  success: boolean;
  data: {
    groups: Array<{
      id: string;
      name: string;
      description?: string;
      memberCount?: number;
      createdAt: string;
    }>;
  };
  error?: string;
}
```

## 3. Get Group Posts
```typescript
// GET /posts/get/by-group?groupId={groupId}
interface GetGroupPostsRequest {
  groupId: string;
  // Pagination parameters if needed
}

interface GetGroupPostsResponse {
  success: boolean;
  data: {
    posts: Array<{
      id: string;
      content: string;
      authorId: string;
      authorName: string;
      groupId: string;
      createdAt: string;
    }>;
    total: number;
  };
  error?: string;
}
```
