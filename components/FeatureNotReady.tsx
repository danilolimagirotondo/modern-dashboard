import { ReactNode } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Construction, Clock, Sparkles, Zap } from 'lucide-react';

interface FeatureNotReadyProps {
  children?: ReactNode;
  featureName?: string;
  description?: string;
  showCard?: boolean;
  expectedDate?: string;
}

export function FeatureNotReady({
  children,
  featureName = 'esta funcionalidade',
  description = 'Estamos trabalhando duro para trazer esta funcionalidade para você!',
  showCard = true,
  expectedDate,
}: FeatureNotReadyProps) {
  const { toast } = useToast();

  const handleClick = () => {
    toast.info(
      `${featureName} em desenvolvimento`,
      'Esta funcionalidade estará disponível em breve. Fique ligado nas atualizações!',
      { duration: 4000 }
    );
  };

  if (!showCard) {
    return (
      <Button variant="outline" onClick={handleClick} className="border-dashed">
        <Construction className="h-4 w-4 mr-2" />
        {children || 'Em breve'}
      </Button>
    );
  }

  return (
    <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Construction className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-blue-900">
          {featureName.charAt(0).toUpperCase() + featureName.slice(1)} em Desenvolvimento
        </CardTitle>
        <CardDescription className="text-blue-700">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {expectedDate && (
          <div className="bg-white rounded-lg p-3 inline-block">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              Previsão de lançamento: <strong className="ml-1">{expectedDate}</strong>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" onClick={handleClick} className="border-blue-300 text-blue-700">
            <Zap className="h-4 w-4 mr-2" />
            Notificar quando estiver pronto
          </Button>
        </div>
        
        <div className="bg-blue-100 rounded-lg p-3 text-sm text-blue-800">
          <Sparkles className="h-4 w-4 inline mr-2" />
          Enquanto isso, explore as outras funcionalidades disponíveis!
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for easily showing "feature not ready" toasts
export function useFeatureNotReady() {
  const { toast } = useToast();

  const showNotReady = (
    featureName: string = 'Esta funcionalidade',
    customMessage?: string
  ) => {
    toast.info(
      `${featureName} em desenvolvimento`,
      customMessage || 'Estamos trabalhando para disponibilizar esta funcionalidade em breve. Aguarde as próximas atualizações!',
      { duration: 4000 }
    );
  };

  return { showNotReady };
}

// Higher-order component to wrap components that aren't ready
export function withFeatureFlag<T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  isReady: boolean = false,
  featureName?: string,
  expectedDate?: string
) {
  return function FeatureFlaggedComponent(props: T) {
    if (!isReady) {
      return (
        <FeatureNotReady
          featureName={featureName}
          expectedDate={expectedDate}
        />
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Button that shows "not ready" behavior
interface NotReadyButtonProps {
  children: ReactNode;
  featureName?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

export function NotReadyButton({
  children,
  featureName,
  className,
  variant = 'outline',
  size = 'default',
}: NotReadyButtonProps) {
  const { showNotReady } = useFeatureNotReady();

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} border-dashed opacity-75`}
      onClick={() => showNotReady(featureName)}
    >
      <Construction className="h-4 w-4 mr-2" />
      {children}
    </Button>
  );
}