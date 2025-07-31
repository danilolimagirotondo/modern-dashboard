import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  Users, 
  BarChart3, 
  Calendar, 
  FolderPlus,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps = [
  {
    icon: FolderPlus,
    title: 'Crie seu primeiro projeto',
    description: 'Comece organizando suas ideias em projetos. Defina objetivos, prazos e responsáveis.',
    action: 'Criar Projeto',
    color: 'bg-blue-500'
  },
  {
    icon: Users,
    title: 'Monte sua equipe',
    description: 'Convide colaboradores e defina permissões. Trabalhe em conjunto de forma eficiente.',
    action: 'Convidar Membros',
    color: 'bg-green-500'
  },
  {
    icon: Target,
    title: 'Defina metas e KPIs',
    description: 'Estabeleça métricas de sucesso e acompanhe o progresso dos seus projetos.',
    action: 'Ver Analytics',
    color: 'bg-purple-500'
  },
  {
    icon: BarChart3,
    title: 'Acompanhe resultados',
    description: 'Use dashboards e relatórios para tomar decisões baseadas em dados.',
    action: 'Ver Relatórios',
    color: 'bg-orange-500'
  }
];

const roleFeatures = {
  admin: [
    'Acesso completo a todos os recursos',
    'Gerenciar usuários e permissões',
    'Visualizar todos os projetos',
    'Configurar integrações e settings'
  ],
  gestor: [
    'Criar e gerenciar projetos',
    'Convidar e gerenciar equipe',
    'Acessar analytics e relatórios',
    'Definir metas e KPIs'
  ],
  colaborador: [
    'Visualizar projetos atribuídos',
    'Atualizar status e progresso',
    'Colaborar com a equipe',
    'Acompanhar suas tarefas'
  ]
};

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
      onClose();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  if (!user) return null;

  const userFeatures = roleFeatures[user.role] || [];
  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-[99px] py-[0px]">
          <DialogTitle className="text-center text-2xl">
            Bem-vindo ao ProjectManager, {user.name}! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            Vamos te ajudar a configurar seu workspace e conhecer as principais funcionalidades da plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Welcome Section */}
          {currentStep === 0 && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-10 w-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl text-gray-900 mb-2">Sua conta foi criada com sucesso!</h3>
                <p className="text-gray-600">
                  Você começa com um workspace completamente limpo. 
                  Vamos te ajudar a configurar tudo do zero.
                </p>
              </div>

              {/* Role Badge */}
              <div className="flex justify-center">
                <Badge 
                  variant="outline" 
                  className="px-4 py-2 text-sm capitalize bg-blue-50 text-blue-700 border-blue-200"
                >
                  {user.role === 'admin' ? 'Administrador' : 
                   user.role === 'gestor' ? 'Gestor' : 'Colaborador'}
                </Badge>
              </div>

              {/* User Role Features */}
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="text-lg">O que você pode fazer:</CardTitle>
                  <CardDescription>
                    Com seu perfil de {user.role === 'admin' ? 'Administrador' : 
                                      user.role === 'gestor' ? 'Gestor' : 'Colaborador'}, 
                    você tem acesso a:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {userFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step Content */}
          {currentStep > 0 && currentStepData && (
            <div className="text-center space-y-6">
              {/* Step Progress */}
              <div className="flex justify-center items-center gap-2 mb-6">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Step Icon */}
              <div className={`w-16 h-16 ${currentStepData.color} rounded-full flex items-center justify-center mx-auto`}>
                <IconComponent className="h-8 w-8 text-white" />
              </div>

              {/* Step Content */}
              <div>
                <h3 className="text-xl text-gray-900 mb-2">{currentStepData.title}</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {currentStepData.description}
                </p>
              </div>

              {/* Step-specific content */}
              {currentStep === 1 && (
                <Card className="text-left bg-blue-500 border-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">💡</span>
                      </div>
                      <div>
                        <h5 className="text-sm text-white">Dica para começar</h5>
                        <p className="text-sm text-white">
                          Clique no botão "Novo Projeto" na navegação superior para criar seu primeiro projeto. 
                          Você pode definir nome, descrição, prazo e responsável.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && user.role !== 'colaborador' && (
                <Card className="text-left bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">👥</span>
                      </div>
                      <div>
                        <h5 className="text-sm text-white">Gestão de equipe</h5>
                        <p className="text-sm text-white">
                          Na página "Team", você pode convidar membros por email ou adicioná-los manualmente. 
                          Defina permissões adequadas para cada membro.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Pular tour
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={isCompleting}
                className="min-w-[120px]"
              >
                {isCompleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Finalizando...
                  </div>
                ) : currentStep === onboardingSteps.length - 1 ? (
                  'Começar!'
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="text-center text-sm text-gray-500">
            Passo {Math.max(1, currentStep)} de {onboardingSteps.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}