import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PermissionButton } from './PermissionGuard';
import { 
  Calendar, 
  DollarSign, 
  User, 
  Building2, 
  Target, 
  Clock, 
  Edit, 
  Trash2,
  Users,
  History,
  FileText,
  AlertCircle,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  ArrowLeft,
  ExternalLink,
  Share2
} from 'lucide-react';
import { Project } from '../contexts/AppContext';
import { format } from '../utils/date';

interface ProjectDetailsViewProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onClose?: () => void;
  showBackButton?: boolean;
  className?: string;
  isModal?: boolean;
}

const statusInfo = {
  planning: {
    label: 'Planejamento',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: FileText,
    description: 'Projeto em fase de planejamento'
  },
  in_progress: {
    label: 'Em Andamento',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Play,
    description: 'Projeto sendo desenvolvido ativamente'
  },
  review: {
    label: 'Em Revisão',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
    description: 'Projeto em processo de revisão'
  },
  completed: {
    label: 'Concluído',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    description: 'Projeto finalizado com sucesso'
  },
  on_hold: {
    label: 'Pausado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: Pause,
    description: 'Projeto temporariamente pausado'
  }
};

const priorityInfo = {
  low: {
    label: 'Baixa',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  medium: {
    label: 'Média',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  high: {
    label: 'Alta',
    color: 'bg-red-100 text-red-800 border-red-200'
  }
};

// Mock data for team members and history
const mockTeamMembers = [
  {
    id: '1',
    name: 'João Silva',
    role: 'Project Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    email: 'joao@company.com'
  },
  {
    id: '2',
    name: 'Maria Santos',
    role: 'Developer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d33b33?w=100&h=100&fit=crop&crop=face',
    email: 'maria@company.com'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    role: 'Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    email: 'pedro@company.com'
  },
  {
    id: '4',
    name: 'Ana Silva',
    role: 'QA Analyst',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    email: 'ana@company.com'
  }
];

const mockHistory = [
  {
    id: '1',
    action: 'Projeto criado',
    user: 'João Silva',
    date: new Date('2024-01-15T10:00:00'),
    details: 'Projeto inicial criado com todas as configurações básicas'
  },
  {
    id: '2',
    action: 'Status atualizado',
    user: 'Maria Santos',
    date: new Date('2024-01-20T14:30:00'),
    details: 'Status alterado de "Planejamento" para "Em Andamento"'
  },
  {
    id: '3',
    action: 'Progresso atualizado',
    user: 'Pedro Costa',
    date: new Date('2024-01-25T09:15:00'),
    details: 'Progresso atualizado para 45%'
  },
  {
    id: '4',
    action: 'Membro adicionado',
    user: 'João Silva',
    date: new Date('2024-01-30T16:45:00'),
    details: 'Ana Silva foi adicionada à equipe como QA Analyst'
  },
  {
    id: '5',
    action: 'Orçamento atualizado',
    user: 'João Silva',
    date: new Date('2024-02-05T11:20:00'),
    details: 'Orçamento do projeto foi revisado e atualizado'
  }
];

export function ProjectDetailsView({
  project,
  onEdit,
  onDelete,
  onClose,
  showBackButton = false,
  className = "",
  isModal = false
}: ProjectDetailsViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');

  const currentStatus = statusInfo[project.status] || statusInfo.planning;
  const currentPriority = priorityInfo[project.priority] || priorityInfo.medium;
  const StatusIcon = currentStatus.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(project);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      onDelete(project.id);
      toast.success('Projeto excluído', 'O projeto foi removido com sucesso');
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

  return (
    <div className={`flex flex-col bg-white ${isModal ? 'h-full max-h-[85vh]' : 'min-h-screen'} ${className}`}>
      {/* Header - Fixed */}
      <div className={`flex-shrink-0 border-b border-gray-100 bg-gray-50/50 ${isModal ? 'px-6 py-6' : 'px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12'}`}>
        <div className="space-y-6">
          {/* Top Row with Back Button and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-10 px-4 flex-shrink-0 border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-10 px-4 border-gray-300 hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {isModal ? 'Copiar' : 'Compartilhar'}
              </Button>
              
              {!isModal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="h-10 px-4 border-gray-300 hover:bg-gray-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Nova Aba
                </Button>
              )}
              
              <PermissionButton
                requiredRole={['admin', 'gestor']}
                onClick={handleEdit}
                variant="outline"
                size="sm"
                className="h-10 px-4 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </PermissionButton>
              
              <PermissionButton
                requiredRole="admin"
                onClick={handleDelete}
                variant="outline"
                size="sm"
                className="h-10 px-4 text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </PermissionButton>
            </div>
          </div>

          {/* Project Title and Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={`${isModal ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl lg:text-4xl'} font-semibold text-gray-900 leading-tight`}>
                {project.name}
              </h1>
              <Badge variant="outline" className={`${currentStatus.color} font-medium text-sm px-3 py-1.5`}>
                <StatusIcon className="h-3.5 w-3.5 mr-2" />
                {currentStatus.label}
              </Badge>
              <Badge variant="outline" className={`${currentPriority.color} font-medium text-sm px-3 py-1.5`}>
                Prioridade {currentPriority.label}
              </Badge>
            </div>
            <p className="text-gray-700 text-base leading-relaxed">
              {project.description || 'Sem descrição disponível'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs - Fixed */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className={`${isModal ? 'px-6' : 'px-6 sm:px-8 lg:px-12'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-transparent border-0 rounded-none h-14 gap-6">
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-2 px-4 py-3 text-base font-medium bg-transparent border-b-2 border-transparent rounded-none data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-600 hover:bg-gray-50 transition-all duration-200"
              >
                <FileText className="h-4 w-4" />
                Detalhes
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="flex items-center gap-2 px-4 py-3 text-base font-medium bg-transparent border-b-2 border-transparent rounded-none data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-600 hover:bg-gray-50 transition-all duration-200"
              >
                <Users className="h-4 w-4" />
                Equipe ({mockTeamMembers.length})
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex items-center gap-2 px-4 py-3 text-base font-medium bg-transparent border-b-2 border-transparent rounded-none data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-600 hover:bg-gray-50 transition-all duration-200"
              >
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Details Tab */}
          <TabsContent value="details" className={`${isModal ? 'p-6' : 'p-6 sm:p-8 lg:p-12'} space-y-8 m-0`}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Project Overview */}
              <Card className="shadow-sm border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    Visão Geral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-700 font-medium">Progresso</span>
                      <span className="font-semibold text-xl text-gray-900">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3 bg-gray-200" />
                  </div>
                  
                  <Separator className="bg-gray-200" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        Cliente
                      </span>
                      <span className="font-medium text-gray-900">{project.client}</span>
                    </div>
                    
                    {project.budget && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          Orçamento
                        </span>
                        <span className="font-semibold text-green-700">
                          {formatCurrency(project.budget)}
                        </span>
                      </div>
                    )}
                    
                    {project.due_date && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          Entrega
                        </span>
                        <span className="font-medium text-gray-900">
                          {format(new Date(project.due_date), "dd/MM/yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Project Status */}
              <Card className="shadow-sm border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className={`w-12 h-12 rounded-lg ${currentStatus.color.replace('text-', 'bg-').replace('border-', '')} flex items-center justify-center`}>
                      <StatusIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900">{currentStatus.label}</h4>
                      <p className="text-gray-600 text-sm">{currentStatus.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Criado em</span>
                      <span className="text-gray-900 font-medium">
                        {format(new Date(project.created_at), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Atualizado</span>
                      <span className="text-gray-900 font-medium">
                        {format(new Date(project.updated_at), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assignee Info */}
            {project.assignee && (
              <Card className="shadow-sm border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    Responsável Principal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={project.assignee.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {project.assignee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{project.assignee.name}</h4>
                      <p className="text-gray-600 text-sm">{project.assignee.email}</p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-1">
                        {project.assignee.role === 'admin' ? 'Admin' : 
                         project.assignee.role === 'gestor' ? 'Gestor' : 'Colaborador'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className={`${isModal ? 'p-6' : 'p-6 sm:p-8 lg:p-12'} m-0`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Equipe do Projeto</h3>
                <Button variant="outline" size="sm" className="h-9 px-4">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTeamMembers.map((member) => (
                  <Card key={member.id} className="border border-gray-200 bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-blue-600 text-sm">{member.role}</p>
                          <p className="text-gray-500 text-xs">{member.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className={`${isModal ? 'p-6' : 'p-6 sm:p-8 lg:p-12'} m-0`}>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Histórico de Atividades</h3>
              
              <div className="space-y-6">
                {mockHistory.map((entry, index) => (
                  <div key={entry.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <RotateCcw className="h-4 w-4 text-blue-600" />
                      </div>
                      {index < mockHistory.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{entry.action}</h4>
                          <span className="text-xs text-gray-500">
                            {format(entry.date, "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{entry.details}</p>
                        <p className="text-xs text-gray-500">por {entry.user}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}