import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { ProjectDetailsView } from './ProjectDetailsView';
import { Project } from '../contexts/AppContext';

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: ProjectDetailsModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync internal state with prop
  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  // Don't render if no project
  if (!project) return null;

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleEdit = (proj: Project) => {
    if (onEdit) {
      onEdit(proj);
    }
  };

  const handleDelete = (projectId: string) => {
    if (onDelete) {
      onDelete(projectId);
      handleClose(); // Close modal after deletion
    }
  };

  return (
    <Modal 
      isOpen={isModalOpen} 
      onClose={handleClose} 
      size="xl"
      showClose={true}
      className="animate-in fade-in-0 zoom-in-95 duration-200"
    >
      <div className="h-full bg-white rounded-xl overflow-hidden">
        <ProjectDetailsView
          project={project}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={handleClose}
          showBackButton={false}
          isModal={true}
          className="h-full"
        />
      </div>
    </Modal>
  );
}