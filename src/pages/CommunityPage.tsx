import { useState, useEffect } from 'react';
import { CommunityLayout } from '@/components/CommunityLayout';
import { GroupSearchCard } from '@/components/GroupSearchCard';
import { GroupList } from '@/components/GroupList';
import { GroupPosts } from '@/components/GroupPosts';
import { CommunityProvider, useCommunity } from '@/context/CommunityContext';
import { 
  Group, 
  Post
} from '@/types/community';
import { apiService, COMMUNITY_API } from '@/services/api';
import logo from '@/assets/logo.png';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CommunityPageContent: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const { selectedGroup, setError } = useCommunity();

  const validateGroups = (groups: unknown): Group[] => {
    if (!Array.isArray(groups)) {
      console.warn('Groups data is not an array:', groups);
      return [];
    }
    
    return groups.filter((group): group is Group => {
      const isValid = 
        typeof group === 'object' &&
        group !== null &&
        // API provides numeric id
        (typeof (group as any).id === 'number' || typeof (group as any).id === 'string') &&
        typeof group.name === 'string' &&
        // description may be empty or omitted
        (typeof (group as any).description === 'string' || typeof (group as any).description === 'undefined') &&
        typeof group.isPrivate === 'boolean' &&
        typeof group.createdAt === 'string' &&
        // accept lowercase roles like 'admin' or 'member' or null
        ((group as any).userRole === null || typeof (group as any).userRole === 'string') &&
        // API field is countUserJoin
        typeof (group as any).countUserJoin === 'number';
      
      if (!isValid) {
  console.warn('Invalid group data:', JSON.stringify(group, null, 2));
      }
      
      return isValid;
    });
  };

  const validatePosts = (posts: unknown): Post[] => {
    // Accept raw post arrays from API and map them into our internal Post shape.
    if (!Array.isArray(posts)) {
      console.warn('Posts data is not an array:', posts);
      return [];
    }

    const mapped: Post[] = (posts as any[]).map((raw) => {
      const userOfPost = raw?.userOfPost || { username: raw?.user?.username || 'Người dùng', urlAvatar: null };

      return {
        id: String(raw?.id ?? raw?._id ?? ''),
        title: String(raw?.title ?? raw?.subject ?? ''),
        content: String(raw?.content ?? raw?.body ?? ''),
        createdAt: String(raw?.createdAt ?? raw?.timestamp ?? new Date().toISOString()),
        updatedAt: String(raw?.updatedAt ?? raw?.createdAt ?? new Date().toISOString()),
        userOfPost: {
          username: String(userOfPost.username ?? 'Người dùng'),
          urlAvatar: userOfPost.urlAvatar ?? null,
        },
        countLike: Number(raw?.countLike ?? raw?.likes ?? 0),
        countComment: Number(raw?.countComment ?? raw?.comments ?? 0),
        userIsLike: Boolean(raw?.userIsLike ?? raw?.isLiked ?? false),
      } as Post;
    });

    // Basic validation on mapped posts
    const validated = mapped.filter((p) => {
      const ok =
        typeof p.id === 'string' &&
        typeof p.title === 'string' &&
        typeof p.content === 'string' &&
        typeof p.createdAt === 'string' &&
        typeof p.updatedAt === 'string' &&
        p.userOfPost && typeof p.userOfPost.username === 'string' &&
        (p.userOfPost.urlAvatar === null || typeof p.userOfPost.urlAvatar === 'string') &&
        typeof p.countLike === 'number' &&
        typeof p.countComment === 'number' &&
        typeof p.userIsLike === 'boolean';

      if (!ok) {
        console.warn('Invalid mapped post:', JSON.stringify(p, null, 2));
      }

      return ok;
    });

    return validated;
  };

  const handleApiError = (error: unknown, errorMessage: string) => {
    if (error instanceof Error) {
      setError(error);
    } else if (typeof error === 'string') {
      setError(new Error(error));
    } else {
      setError(new Error(errorMessage));
    }
  };

  const searchGroups = async (query: string) => {
    setIsLoadingGroups(true);
    setError(null);
    try {
      const currentUsername = localStorage.getItem('username') || '';
      const endpoint = COMMUNITY_API.searchGroups(query, currentUsername);
      console.log('Calling searchGroups endpoint:', endpoint, 'with username:', currentUsername);

      const response = await apiService.request<{ groups: Group[]; total: number }>(
        endpoint,
        {},
        'searchGroups'
      );
      
      console.log('Search groups response:', JSON.stringify(response, null, 2));

      if (!response.success) {
        throw new Error(response.error || 'Failed to search groups');
      }

      // API sometimes returns data as an array (data: Group[]) or wrapped { groups: Group[], total }
      const raw = response.data;
      let rawGroups: any[] = [];

      if (Array.isArray(raw)) {
        rawGroups = raw;
      } else if (raw && Array.isArray((raw as any).groups)) {
        rawGroups = (raw as any).groups;
      } else if (raw && Array.isArray((raw as any).data)) {
        // handle double-wrapped structures just in case
        rawGroups = (raw as any).data;
      } else {
        console.warn('Unexpected groups payload shape:', raw);
        rawGroups = [];
      }

      if (!Array.isArray(rawGroups)) {
        console.error('Groups is not an array:', rawGroups);
        throw new Error('Invalid response format: groups is not an array');
      }

      const validatedGroups = validateGroups(rawGroups);

      if (validatedGroups.length === 0 && rawGroups.length > 0) {
        console.error('All groups failed validation. Sample group:', JSON.stringify(rawGroups[0], null, 2));
        throw new Error('Failed to validate any groups from the response');
      }

      console.log('Validated', validatedGroups.length, 'out of', rawGroups.length, 'groups.');

      setGroups(validatedGroups);
    } catch (error) {
      handleApiError(error, 'Error searching groups');
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchUserGroups = async () => {
    setIsLoadingGroups(true);
    setError(null);
    
    const currentUsername = localStorage.getItem('username');
    if (!currentUsername) {
      setError(new Error('No username found in local storage'));
      setIsLoadingGroups(false);
      return;
    }
    
    try {
      const response = await apiService.request<Group[]>(
        COMMUNITY_API.getUserGroups(currentUsername),
        {},
        'getUserGroups'
      );
      
      console.log('Raw API response:', JSON.stringify(response, null, 2));
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user groups');
      }
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: groups array not found');
      }

      const validatedGroups = validateGroups(response.data as Group[]);
      console.log('Validated groups:', validatedGroups);
      
      if (validatedGroups.length === 0 && response.data.length > 0) {
        console.error('All groups failed validation. Sample group:', 
          JSON.stringify(response.data[0], null, 2)
        );
        throw new Error('Failed to validate any groups from the response');
      }
      
      setGroups(validatedGroups);
    } catch (error) {
      handleApiError(error, 'Error fetching user groups');
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchGroupPosts = async (groupId: string | number) => {
    setIsLoadingPosts(true);
    setError(null);
    try {
      const response = await apiService.request<any>(
        COMMUNITY_API.getGroupPosts(String(groupId)),
        {},
        'getGroupPosts'
      );

      console.log('Group posts response:', JSON.stringify(response, null, 2));

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch group posts');
      }

      // API may return data as an array (data: Post[]) or wrapped (data: { posts: Post[] })
      const raw = response.data;
      let rawPosts: any[] = [];

      if (Array.isArray(raw)) {
        rawPosts = raw;
      } else if (raw && Array.isArray(raw.posts)) {
        rawPosts = raw.posts;
      } else if (raw && Array.isArray((raw as any).data)) {
        // handle double-wrapped just in case
        rawPosts = (raw as any).data;
      } else {
        console.warn('Unexpected posts payload shape:', raw);
        rawPosts = [];
      }

      if (!Array.isArray(rawPosts)) {
        console.error('Posts data is not an array:', rawPosts);
        throw new Error('Invalid response format: posts is not an array');
      }

      const validatedPosts = validatePosts(rawPosts);
      console.log('Validated posts:', validatedPosts);

      if (validatedPosts.length === 0 && rawPosts.length > 0) {
        console.error('All posts failed validation. Sample post:', JSON.stringify(rawPosts[0], null, 2));
        // still set empty to avoid stale UI
        setPosts([]);
      } else {
        setPosts(validatedPosts);
      }
    } catch (error) {
      handleApiError(error, 'Error fetching group posts');
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupPosts(selectedGroup.id);
    } else {
      setPosts([]);
    }
  }, [selectedGroup]);

  // create post state and handler
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const handleCreateGroupPost = async () => {
    if (!selectedGroup) return;
    if (!newPostTitle.trim() || !newPostContent.trim() || isCreatingPost) return;
    setIsCreatingPost(true);
    try {
      const payload = {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        type: 'blog',
        groupId: selectedGroup.id,
      } as any;

      const res = await apiService.createPostInGroup(payload);
      if (!res.success) {
        throw new Error(res.error || 'Failed to create post');
      }

      // clear inputs
      setNewPostTitle('');
      setNewPostContent('');

      // reload posts for the current group
      await fetchGroupPosts(selectedGroup.id);
    } catch (e) {
      handleApiError(e, 'Error creating post');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const contentNode = (
    <div>
      {selectedGroup && (
        <div className="group-header-card">
          <div className="group-avatar">
            <img src={logo} alt={selectedGroup.name} />
          </div>
          <div className="group-info">
            <h2 className="group-name">{selectedGroup.name}</h2>
            <p className="group-description">{selectedGroup.description || 'Không có mô tả'}</p>
          </div>
        </div>
      )}

      {selectedGroup && (
        <div className="create-post-card">
          <input
            className="post-title-input"
            placeholder="Tiêu đề..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
          />
          <textarea
            className="post-content-input"
            placeholder="Nội dung..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={4}
          />
          <div className="post-actions">
            <button onClick={handleCreateGroupPost} disabled={isCreatingPost || !newPostTitle.trim() || !newPostContent.trim()}>
              {isCreatingPost ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>
        </div>
      )}

      <GroupPosts posts={posts} isLoading={isLoadingPosts} />
    </div>
  );

  return (
    <CommunityLayout
      sidebar={
        <>
          <GroupSearchCard onSearch={searchGroups} isLoading={isLoadingGroups} />
          <GroupList groups={groups} isLoading={isLoadingGroups} />
        </>
      }
      content={contentNode}
    />
  );
};

export const CommunityPage: React.FC = () => {
  return (
    <div className="community-page">
      <ErrorBoundary>
        <CommunityProvider>
          <CommunityPageContent />
        </CommunityProvider>
      </ErrorBoundary>
    </div>
  );
};
