# Quickstart Guide: Community Page

## Development Setup

1. **Branch Checkout**
```bash
git checkout 001-add-community-page
```

2. **Install Dependencies**
```bash
# No additional dependencies required - using existing React + TypeScript setup
```

3. **Component Development Order**
   1. Create `CommunityLayout` component
   2. Implement `GroupSearchCard` component
   3. Build `GroupList` component
   4. Develop `GroupPosts` component
   5. Set up community context
   6. Add routing configuration

4. **Running the Development Server**
```bash
npm run dev
```

5. **Testing the Feature**
   - Access `/community` route in browser
   - Test group search functionality
   - Verify group selection and post display
   - Check responsive layout at different screen sizes
   - Validate error states and loading indicators

## Key Files

```
src/
├── pages/
│   └── CommunityPage.tsx
├── components/
│   ├── CommunityLayout.tsx
│   ├── GroupSearchCard.tsx
│   ├── GroupList.tsx
│   └── GroupPosts.tsx
└── context/
    └── CommunityContext.tsx
```

## API Integration

1. Group Search:
```typescript
const searchGroups = async (query: string) => {
  const response = await fetch(`/group/get/all?name=${query}`);
  return response.json();
};
```

2. User Groups:
```typescript
const getUserGroups = async () => {
  const response = await fetch('/group/get/by-user');
  return response.json();
};
```

3. Group Posts:
```typescript
const getGroupPosts = async (groupId: string) => {
  const response = await fetch(`/posts/get/by-group?groupId=${groupId}`);
  return response.json();
};
```
