import { Post } from '@/types/community';
import { useCommunity } from '@/context/CommunityContext';
import { PostsSkeleton } from './LoadingSkeletons';

interface GroupPostsProps {
  posts: Post[];
  isLoading: boolean;
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export const GroupPosts: React.FC<GroupPostsProps> = ({ posts, isLoading }) => {
  const { selectedGroup, error } = useCommunity();

  if (error) {
    return (
      <div className="empty-state error">
        <p>Error loading posts:</p>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!selectedGroup) {
    return (
      <div className="empty-state">
        <p>Chọn một nhóm để xem các bài viết</p>
        <p className="hint">Các bài viết trong nhóm sẽ hiển thị ở đây</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <p>Đang tải bài viết...</p>
        <PostsSkeleton />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p>Chưa có bài viết nào trong nhóm này</p>
  {(selectedGroup as any).countUserJoin > 0 && (
          <p className="hint">Hãy là người đầu tiên tạo bài viết!</p>
        )}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    // use relative time similar to ForumPage's getTimeAgo
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  };

  return (
    <div className="post-container">
      {posts.map((post) => (
        <div className="post-card" key={post.id}>
          <div className="post-header">
            <div className="post-author-info">
              <div className="post-avatar">
                {post.userOfPost.urlAvatar ? (
                  <img src={post.userOfPost.urlAvatar} alt={post.userOfPost.username} />
                ) : (
                  <div className="avatar-placeholder">{getInitials(post.userOfPost.username)}</div>
                )}
              </div>
              <div className="post-author-details">
                <div className="post-author">{post.userOfPost.username}</div>
                <div className="post-timestamp">{formatDate(post.createdAt)}</div>
              </div>
            </div>
          </div>

          <div className="post-body">
            <h3 className="post-title">{post.title || ''}</h3>
            <div className="post-content">{post.content}</div>
          </div>

          <div className="post-actions">
            <button className={`action-btn ${post.userIsLike ? 'liked' : ''}`} aria-pressed={post.userIsLike}>
              <span className="action-icon">❤️</span>
              <span className="action-count">{post.countLike}</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">💬</span>
              <span className="action-count">{post.countComment}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
