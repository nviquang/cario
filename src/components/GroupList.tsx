import { Group } from '@/types/community';
import { useCommunity } from '@/context/CommunityContext';
import { useState } from 'react';
import { GroupListSkeleton } from './LoadingSkeletons';
import { LockIcon } from './LockIcon';

interface GroupListProps {
  groups: Group[];
  isLoading: boolean;
  onReload?: () => Promise<void> | void;
}

export const GroupList: React.FC<GroupListProps> = ({ groups, isLoading, onReload }) => {
  const { selectedGroup, setSelectedGroup, error } = useCommunity();
  const [openMenuFor, setOpenMenuFor] = useState<number | null>(null);
  const [deleteGroupTarget, setDeleteGroupTarget] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // current username
  const currentUsername = localStorage.getItem('username') || '';

  const handleDeleteConfirm = async () => {
    if (!deleteGroupTarget) return;
    setIsDeleting(true);
    try {
      const res = await (await import('@/services/api')).apiService.request<any>(`/group/delete/${deleteGroupTarget.id}`, { method: 'DELETE' }, 'deleteGroupFromList');
      if (!res.success) throw new Error(res.error || 'Failed to delete group');
      setDeleteGroupTarget(null);
      if (typeof onReload === 'function') await onReload();
    } catch (err) {
      console.error('Delete group failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

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
      {groups.map((group) => {
        const isOwner = (group as any).creator?.username === currentUsername || group.userRole === 'owner' || (group as any).creator === currentUsername;
        return (
          <div
            key={group.id}
            className={`group-item ${selectedGroup?.id === group.id ? 'selected' : ''}`}
            onClick={() => setSelectedGroup(group)}
            style={{ position: 'relative' }}
          >
            <div className="group-header">
              {group.isPrivate && <LockIcon className="group-icon" />}
              <h3 className="group-name">{group.name}</h3>
              <span className={`group-role ${group.userRole}`}>
                {group.userRole}
              </span>
            </div>

            {isOwner && (
              <div style={{ position: 'absolute', right: 10, top: 8, zIndex: 80 }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="group-item-menu-button"
                  onClick={() => setOpenMenuFor(openMenuFor === group.id ? null : group.id)}
                  aria-haspopup="true"
                  aria-expanded={openMenuFor === group.id}
                >
                  ⋯
                </button>
                {openMenuFor === group.id && (
                  <div className="post-menu" role="menu">
                    <button
                      className="menu-item"
                      onClick={() => {
                        setDeleteGroupTarget(group);
                        setOpenMenuFor(null);
                      }}
                    >
                      <span className="menu-item-text">Xóa nhóm</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <p className="group-meta">
              <span>{(group as any).countUserJoin} thành viên</span>
              {group.description && <span>{group.description}</span>}
            </p>

            {deleteGroupTarget && (
              <div className="modal-backdrop" role="dialog" aria-modal="true">
                <div className="modal-card">
                  <h3 className="create-post-title">Xác nhận xóa nhóm</h3>
                  <div className="create-post-card">
                    <p>Bạn chắc chắn muốn xóa nhóm "{deleteGroupTarget.name}"?</p>
                    <div className="post-actions">
                      <button onClick={handleDeleteConfirm} disabled={isDeleting}>{isDeleting ? 'Đang xóa...' : 'Xác nhận'}</button>
                      <button onClick={() => setDeleteGroupTarget(null)}>Hủy</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
