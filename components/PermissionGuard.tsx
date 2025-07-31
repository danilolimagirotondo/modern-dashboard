import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'gestor' | 'colaborador';
  requiredRoles?: ('admin' | 'gestor' | 'colaborador')[];
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function PermissionGuard({
  children,
  requiredRole,
  requiredRoles = [],
  fallback,
  showFallback = true,
}: PermissionGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return showFallback ? (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Acesso Necessário
          </CardTitle>
          <CardDescription className="text-orange-600">
            Você precisa estar logado para acessar este conteúdo.
          </CardDescription>
        </CardHeader>
      </Card>
    ) : null;
  }

  // Build allowed roles list
  const allowedRoles = requiredRole ? [requiredRole] : requiredRoles;
  
  // If no specific role required, allow access
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has required permission
  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallback) {
      return null;
    }

    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-800">
            <Shield className="h-5 w-5 mr-2" />
            Acesso Restrito
          </CardTitle>
          <CardDescription className="text-red-600">
            Você não tem permissão para acessar esta funcionalidade. 
            {allowedRoles.length === 1 ? (
              <>Necessário nível: <strong>{getRoleDisplayName(allowedRoles[0])}</strong></>
            ) : (
              <>Necessário um dos níveis: <strong>{allowedRoles.map(getRoleDisplayName).join(', ')}</strong></>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-4">
            Seu nível atual: <strong>{getRoleDisplayName(user.role)}</strong>
          </p>
          <div className="bg-red-100 rounded-lg p-3">
            <p className="text-sm text-red-700">
              💡 <strong>Dica:</strong> Entre em contato com um administrador para solicitar permissões adicionais.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

export function usePermission() {
  const { user } = useAuth();
  const { toast } = useToast();

  const hasRole = (role: 'admin' | 'gestor' | 'colaborador') => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: ('admin' | 'gestor' | 'colaborador')[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const checkPermission = (
    requiredRole: 'admin' | 'gestor' | 'colaborador' | ('admin' | 'gestor' | 'colaborador')[],
    showToast = true
  ) => {
    if (!user) {
      if (showToast) {
        toast.warning('Login Necessário', 'Você precisa estar logado para realizar esta ação');
      }
      return false;
    }

    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasPermission = allowedRoles.includes(user.role);

    if (!hasPermission && showToast) {
      const roleNames = allowedRoles.map(getRoleDisplayName).join(', ');
      toast.error(
        'Acesso Restrito',
        `Esta ação requer nível: ${roleNames}. Seu nível atual: ${getRoleDisplayName(user.role)}`
      );
    }

    return hasPermission;
  };

  const requirePermission = (
    requiredRole: 'admin' | 'gestor' | 'colaborador' | ('admin' | 'gestor' | 'colaborador')[],
    action: () => void,
    showToast = true
  ) => {
    if (checkPermission(requiredRole, showToast)) {
      action();
    }
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    checkPermission,
    requirePermission,
  };
}

// Helper function to get user-friendly role names
function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'gestor':
      return 'Gestor';
    case 'colaborador':
      return 'Colaborador';
    default:
      return role;
  }
}

// Higher-order component for protecting entire components
export function withPermission<T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  requiredRole: 'admin' | 'gestor' | 'colaborador' | ('admin' | 'gestor' | 'colaborador')[]
) {
  return function ProtectedComponent(props: T) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    return (
      <PermissionGuard requiredRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}

// Button component with built-in permission checking
interface PermissionButtonProps {
  children: ReactNode;
  requiredRole: 'admin' | 'gestor' | 'colaborador' | ('admin' | 'gestor' | 'colaborador')[];
  onClick: () => void;
  showToastOnDenied?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
}

export function PermissionButton({
  children,
  requiredRole,
  onClick,
  showToastOnDenied = true,
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
}: PermissionButtonProps) {
  const { requirePermission, user } = usePermission();
  
  const handleClick = () => {
    requirePermission(requiredRole, onClick, showToastOnDenied);
  };

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasPermission = user ? allowedRoles.includes(user.role) : false;
  const isDisabled = disabled || !user || !hasPermission;

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant={variant}
      size={size}
      disabled={isDisabled}
    >
      {!hasPermission && <Lock className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  );
}