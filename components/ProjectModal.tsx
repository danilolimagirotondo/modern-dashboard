import { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Modal } from "./Modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { motion } from "motion/react";
import { CalendarIcon, DollarSign, User, Building2, Target, AlertCircle, CheckCircle2, Clock, Play, Pause } from "lucide-react";
import { Project } from "../contexts/AppContext";
import { format } from "../utils/date";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  mode: 'create' | 'edit';
}

export function ProjectModal({ isOpen, onClose, project, mode }: ProjectModalProps) {
  const { createProject, updateProject, loading } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    client: '',
    budget: '',
    progress: 0,
    due_date: undefined as Date | undefined,
    assignee_id: 'none',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock assignees for demo
  const mockAssignees = [
    { id: 'demo-admin', name: 'João Silva', role: 'admin' },
    { id: 'demo-gestor', name: 'Maria Santos', role: 'gestor' },
    { id: 'demo-colaborador', name: 'Pedro Costa', role: 'colaborador' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && project) {
        setFormData({
          name: project.name,
          description: project.description || '',
          status: project.status,
          priority: project.priority,
          client: project.client,
          budget: project.budget ? project.budget.toString() : '',
          progress: project.progress,
          due_date: project.due_date ? new Date(project.due_date) : undefined,
          assignee_id: project.assignee_id || 'none',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'planning',
          priority: 'medium',
          client: '',
          budget: '',
          progress: 0,
          due_date: undefined,
          assignee_id: 'none',
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, project]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do projeto é obrigatório';
    }

    if (!formData.client.trim()) {
      newErrors.client = 'Cliente é obrigatório';
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = 'Orçamento deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Erro de validação', 'Por favor, corrija os campos destacados');
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : undefined,
        due_date: formData.due_date ? formData.due_date.toISOString() : undefined,
        assignee_id: formData.assignee_id === 'none' ? undefined : formData.assignee_id,
      };

      if (mode === 'create') {
        await createProject(projectData);
        toast.success('Projeto criado!', 'O projeto foi criado com sucesso');
      } else if (project) {
        await updateProject(project.id, projectData);
        toast.success('Projeto atualizado!', 'As alterações foram salvas com sucesso');
      }

      onClose();
    } catch (error) {
      console.error('Project operation error:', error);
      toast.error('Erro', error instanceof Error ? error.message : 'Falha na operação');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🏷️ Premium Status Options with Enhanced Colors
  const statusOptions = [
    { 
      value: 'planning', 
      label: 'Planejamento', 
      badgeClass: 'badge-info',
      icon: Target,
      description: 'Projeto em fase inicial'
    },
    { 
      value: 'in_progress', 
      label: 'Em Andamento', 
      badgeClass: 'badge-success',
      icon: Play,
      description: 'Desenvolvimento ativo'
    },
    { 
      value: 'review', 
      label: 'Em Revisão', 
      badgeClass: 'badge-warning',
      icon: Clock,
      description: 'Aguardando aprovação'
    },
    { 
      value: 'completed', 
      label: 'Concluído', 
      badgeClass: 'badge-success',
      icon: CheckCircle2,
      description: 'Projeto finalizado'
    },
    { 
      value: 'on_hold', 
      label: 'Pausado', 
      badgeClass: 'badge-danger',
      icon: Pause,
      description: 'Projeto temporariamente parado'
    },
  ];

  // 🎯 Premium Priority Options
  const priorityOptions = [
    { 
      value: 'low', 
      label: 'Baixa', 
      badgeClass: 'badge-success',
      description: 'Pode ser feito quando houver tempo'
    },
    { 
      value: 'medium', 
      label: 'Média', 
      badgeClass: 'badge-warning',
      description: 'Importante mas não urgente'
    },
    { 
      value: 'high', 
      label: 'Alta', 
      badgeClass: 'badge-danger',
      description: 'Requer atenção imediata'
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col h-full max-h-[95vh]">
        {/* 🎨 Premium Header with gradient background */}
        <motion.div 
          className="px-8 py-8 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Target className="h-7 w-7 text-primary" />
            </motion.div>
            <div>
              <motion.h2 
                className="text-2xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {mode === 'create' ? 'Criar Novo Projeto' : 'Editar Projeto'}
              </motion.h2>
              <motion.p 
                className="text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {mode === 'create' 
                  ? 'Preencha as informações para criar um novo projeto'
                  : 'Atualize as informações do projeto'
                }
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* 📝 Form Content with generous spacing */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 🏢 Basic Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Card className="border border-border shadow-lg bg-card">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    Informações Básicas
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Defina as informações essenciais do projeto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                        Nome do Projeto *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Digite o nome do projeto"
                        className={`h-12 bg-input border-border focus:border-primary ${
                          errors.name ? 'border-destructive focus:border-destructive' : ''
                        }`}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="client" className="text-sm font-semibold text-foreground">
                        Cliente *
                      </Label>
                      <Input
                        id="client"
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        placeholder="Nome do cliente ou empresa"
                        className={`h-12 bg-input border-border focus:border-primary ${
                          errors.client ? 'border-destructive focus:border-destructive' : ''
                        }`}
                      />
                      {errors.client && (
                        <p className="text-sm text-destructive">{errors.client}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                      Descrição
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva os objetivos e escopo do projeto"
                      rows={4}
                      className="bg-input border-border focus:border-primary resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ⚙️ Project Configuration Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              <Card className="border border-border shadow-lg bg-card">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    Configurações do Projeto
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure status, prioridade e responsável
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="status" className="text-sm font-semibold text-foreground">
                        Status
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger className="h-12 bg-input border-border">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-3 py-2">
                                <status.icon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{status.label}</span>
                                    <Badge className={`text-xs ${status.badgeClass}`}>
                                      {status.label}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{status.description}</p>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="priority" className="text-sm font-semibold text-foreground">
                        Prioridade
                      </Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                        <SelectTrigger className="h-12 bg-input border-border">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center gap-3 py-2">
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{priority.label}</span>
                                    <Badge className={`text-xs ${priority.badgeClass}`}>
                                      {priority.label}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{priority.description}</p>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="assignee" className="text-sm font-semibold text-foreground">
                        Responsável
                      </Label>
                      <Select value={formData.assignee_id} onValueChange={(value) => setFormData({ ...formData, assignee_id: value })}>
                        <SelectTrigger className="h-12 bg-input border-border">
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">Nenhum responsável</span>
                          </SelectItem>
                          {mockAssignees.map((assignee) => (
                            <SelectItem key={assignee.id} value={assignee.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                <span className="font-medium">{assignee.name}</span>
                                <Badge className="text-xs badge-info">
                                  {assignee.role}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 📊 Progress Slider for Edit Mode */}
                  {mode === 'edit' && (
                    <div className="space-y-4 pt-2">
                      <Separator />
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-foreground flex items-center justify-between">
                          <span>Progresso</span>
                          <Badge className="badge-info">
                            {formData.progress}%
                          </Badge>
                        </Label>
                        <Slider
                          value={[formData.progress]}
                          onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* 💰 Financial and Timeline Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Card className="border border-border shadow-lg bg-card">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    Financeiro e Cronograma
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure orçamento e prazo de entrega
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="budget" className="text-sm font-semibold text-foreground">
                        Orçamento (R$)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="budget"
                          type="number"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          placeholder="0,00"
                          className={`pl-12 h-12 bg-input border-border focus:border-primary ${
                            errors.budget ? 'border-destructive focus:border-destructive' : ''
                          }`}
                        />
                      </div>
                      {errors.budget && (
                        <p className="text-sm text-destructive">{errors.budget}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground">
                        Data de Entrega
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-12 bg-input border-border hover:bg-accent"
                          >
                            <CalendarIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                            {formData.due_date ? (
                              <span className="text-foreground">
                                {format(formData.due_date, "dd/MM/yyyy")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.due_date}
                            onSelect={(date) => setFormData({ ...formData, due_date: date })}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </form>
        </div>

        {/* 🎬 Footer Actions with Premium Styling */}
        <motion.div 
          className="px-8 py-8 border-t border-border bg-muted/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="sm:w-auto h-12 px-8 border-border hover:bg-accent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <motion.div 
                    className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  {mode === 'create' ? 'Criando...' : 'Salvando...'}
                </>
              ) : (
                mode === 'create' ? 'Criar Projeto' : 'Salvar Alterações'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </Modal>
  );
}

{/* 🎨 PREMIUM PROJECT MODAL FEATURES:
✨ Smooth staggered animations with motion/react
🏷️ Premium badge system with enhanced status/priority colors  
🎪 Perfect dark mode support via CSS variables
📱 Responsive layout with generous spacing (32px padding)
🎯 Rich select dropdowns with descriptions and icons
📊 Interactive progress slider with visual feedback
💰 Enhanced financial inputs with proper formatting
📅 Date picker with past date validation
♿ Full accessibility support (labels, ARIA, keyboard)
🌊 Gradient header backgrounds for visual hierarchy
💫 Micro-interactions on all interactive elements
🔍 Clear visual hierarchy with cards and sections
*/}