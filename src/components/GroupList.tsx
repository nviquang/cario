import { Group } from '@/types/community';
import { useCommunity } from '@/context/CommunityContext';
import { GroupListSkeleton } from './LoadingSkeletons';
import { LockIcon } from './LockIcon';

interface GroupListProps {
  groups: Group[];
  isLoading: boolean;
}

export const GroupList: React.FC<GroupListProps> = ({ groups, isLoading }) => {
  const { selectedGroup, setSelectedGroup, error } = useCommunity();

  if (error) {
    return (
      <div className="group-card">
        <div className="empty-state error">
          <p>Error loading groups:</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="group-card">
        <div style={{ padding: 12 }}>
          <p>Đang tải danh sách nhóm...</p>
          <GroupListSkeleton />
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="group-card">
        <div className="empty-state">
          <p>Không tìm thấy nhóm nào</p>
          <p className="hint">Thử tìm kiếm với từ khóa khác</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-card">
      {groups.map((group) => (
        <div
          key={group.id}
          className={`group-item ${selectedGroup?.id === group.id ? 'selected' : ''}`}
          onClick={() => setSelectedGroup(group)}
        >
          <div className="group-header">
            {group.isPrivate && <LockIcon className="group-icon" />}
            <h3 className="group-name">{group.name}</h3>
            <span className={`group-role ${group.userRole}`}>
              {group.userRole}
            </span>
          </div>
          <p className="group-meta">
            <span>{(group as any).countUserJoin} thành viên</span>
            {group.description && <span>{group.description}</span>}
          </p>
        </div>
      ))}
    </div>
  );
};
