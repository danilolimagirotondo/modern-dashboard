import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { ProjectModal } from './ProjectModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useApp } from '../contexts/AppContext';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import { Project } from '../contexts/AppContext';

interface ProjectActionMenuProps {
  project: Project;
  triggerClassName?: string;
  align?: 'start' | 'center' | 'end';
  onActionComplete?: () => void;
  showModal?: boolean;
}

export function ProjectActionMenu({ 
  project, 
  triggerClassName = "h-8 w-8 p-0",
  align = "end",
  onActionComplete,
  showModal = true
}: ProjectActionMenuProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { deleteProject } = useApp();
  const navigate = useNavigate();
  
  // Separate state for each modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = () => {
    console.log('Opening details modal for project:', project.id);
    if (showModal) {
      setIsDetailsModalOpen(true);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };

  const handleViewDetailsPage = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = () => {
    if (!user || !['admin', 'gestor'].includes(user.role)) {
      toast.error('Sem permissão', 'Você não tem permissão para editar projetos');
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Sem permissão', 'Apenas administradores podem excluir projetos');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      try {
        setIsDeleting(true);
        await deleteProject(project.id);
        toast.success('Projeto excluído', 'O projeto foi removido com sucesso');
        onActionComplete?.();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Erro', 'Não foi possível excluir o projeto');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/projects/${project.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copiado', 'Link do projeto copiado para área de transferência');
    }).catch(() => {
      toast.error('Erro', 'Não foi possível copiar o link');
    });
  };

  const handleOpenInNewTab = () => {
    const url = `${window.location.origin}/projects/${project.id}`;
    window.open(url, '_blank');
  };

  const handleCloseDetailsModal = () => {
    console.log('Closing details modal');
    setIsDetailsModalOpen(false);
  };

  const handleEditFromModal = (proj: Project) => {
    console.log('Edit triggered from modal');
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    onActionComplete?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`hover:bg-gray-100 transition-colors duration-200 ${triggerClassName}`}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu de ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align={align} 
          className="w-52 bg-white shadow-lg border border-gray-200 rounded-lg py-2"
        >
          <DropdownMenuItem 
            onClick={handleViewDetails}
            className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors duration-150"
          >
            <Eye className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-gray-700">
              {showModal ? 'Ver Detalhes (Modal)' : 'Ver Detalhes'}
            </span>
          </DropdownMenuItem>

          {showModal && (
            <DropdownMenuItem 
              onClick={handleViewDetailsPage}
              className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <ArrowUpRight className="mr-3 h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Abrir Página Completa</span>
            </DropdownMenuItem>
          )}
          
          {user && ['admin', 'gestor'].includes(user.role) && (
            <DropdownMenuItem 
              onClick={handleEditProject}
              className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <Edit className="mr-3 h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Editar Projeto</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="my-1 bg-gray-100" />
          
          <DropdownMenuItem 
            onClick={handleCopyLink}
            className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors duration-150"
          >
            <Copy className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Copiar Link</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleOpenInNewTab}
            className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors duration-150"
          >
            <ExternalLink className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Abrir em Nova Aba</span>
          </DropdownMenuItem>

          {user && user.role === 'admin' && (
            <>
              <DropdownMenuSeparator className="my-1 bg-gray-100" />
              <DropdownMenuItem 
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="px-3 py-2 text-sm hover:bg-red-50 cursor-pointer transition-colors duration-150 text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-3 h-4 w-4" />
                <span>{isDeleting ? 'Excluindo...' : 'Excluir Projeto'}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Details Modal - Always render when showModal is true */}
      {showModal && (
        <ProjectDetailsModal
          project={project}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          onEdit={handleEditFromModal}
          onDelete={handleDeleteProject}
        />
      )}

      {/* Edit Modal */}
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        project={project}
        mode="edit"
      />
    </>
  );
}