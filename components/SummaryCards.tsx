import { Clock, CheckCircle, AlertCircle, Calendar, TrendingUp, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { useMemo } from "react";
import { format, isAfter, isBefore, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  due_date: string;
  progress: number;
  priority: 'low' | 'medium' | 'high';
  client: string;
  budget: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  totalUsers: number;
  totalBudget: number;
  averageProgress: number;
}

interface SummaryCardsProps {
  stats: Stats;
  projects?: Project[];
}

export function SummaryCards({ stats, projects = [] }: SummaryCardsProps) {
  // 📊 Calculate real-time data from projects
  const calculatedData = useMemo(() => {
    const today = new Date();
    const thisMonth = {
      start: startOfMonth(today),
      end: endOfMonth(today)
    };

    // Active projects (not completed or on hold)
    const activeProjects = projects.filter(p => 
      p.status !== 'completed' && p.status !== 'on_hold'
    );

    // Status breakdown
    const statusCounts = {
      planning: projects.filter(p => p.status === 'planning').length,
      in_progress: projects.filter(p => p.status === 'in_progress').length,
      review: projects.filter(p => p.status === 'review').length,
      completed: projects.filter(p => p.status === 'completed').length,
      on_hold: projects.filter(p => p.status === 'on_hold').length
    };

    // Completed this month
    const completedThisMonth = projects.filter(p => {
      if (p.status !== 'completed') return false;
      const updatedAt = new Date(p.updated_at);
      return updatedAt >= thisMonth.start && updatedAt <= thisMonth.end;
    });

    // Priority breakdown for completed projects this month
    const completedByPriority = {
      high: completedThisMonth.filter(p => p.priority === 'high').length,
      medium: completedThisMonth.filter(p => p.priority === 'medium').length,
      low: completedThisMonth.filter(p => p.priority === 'low').length
    };

    // Upcoming deadlines
    const upcomingDeadlines = {
      today: projects.filter(p => {
        if (p.status === 'completed') return false;
        const dueDate = new Date(p.due_date);
        return format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      }).length,
      thisWeek: projects.filter(p => {
        if (p.status === 'completed') return false;
        const dueDate = new Date(p.due_date);
        return isAfter(dueDate, today) && isBefore(dueDate, addDays(today, 7));
      }).length,
      nextWeek: projects.filter(p => {
        if (p.status === 'completed') return false;
        const dueDate = new Date(p.due_date);
        return isAfter(dueDate, addDays(today, 7)) && isBefore(dueDate, addDays(today, 14));
      }).length
    };

    // Team performance metrics
    const totalProjectsWithDeadlines = projects.filter(p => p.due_date).length;
    const onTimeProjects = projects.filter(p => {
      if (p.status !== 'completed' || !p.due_date) return false;
      const dueDate = new Date(p.due_date);
      const completedDate = new Date(p.updated_at);
      return completedDate <= dueDate;
    }).length;

    const onTimeDeliveryRate = totalProjectsWithDeadlines > 0 
      ? Math.round((onTimeProjects / totalProjectsWithDeadlines) * 100)
      : 0;

    // Average quality score (based on completion rate)
    const qualityScore = projects.length > 0 
      ? Math.round(stats.averageProgress)
      : 0;

    // Client satisfaction (estimated based on on-time delivery and completion rate)
    const clientSatisfaction = Math.round((onTimeDeliveryRate + qualityScore) / 2);
    const teamPerformance = Math.round((onTimeDeliveryRate + qualityScore + clientSatisfaction) / 3);

    // Budget calculations
    const totalBudgetAllocated = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const averageBudgetUtilization = projects.length > 0
      ? Math.round((projects.reduce((sum, p) => sum + (p.progress * (p.budget || 0) / 100), 0) / totalBudgetAllocated) * 100) || 0
      : 0;
    const budgetSpent = Math.round(totalBudgetAllocated * (averageBudgetUtilization / 100));
    const budgetRemaining = totalBudgetAllocated - budgetSpent;

    return {
      activeProjects: activeProjects.length,
      statusCounts,
      completedThisMonth: completedThisMonth.length,
      completedByPriority,
      upcomingDeadlines,
      totalDeadlines: upcomingDeadlines.today + upcomingDeadlines.thisWeek + upcomingDeadlines.nextWeek,
      teamPerformance,
      onTimeDeliveryRate,
      qualityScore,
      clientSatisfaction,
      totalBudgetAllocated,
      budgetSpent,
      budgetRemaining,
      averageBudgetUtilization
    };
  }, [projects, stats]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // If no projects, show zeros
  if (projects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Visão Geral dos Projetos</h2>
          <p className="text-muted-foreground">Insights rápidos sobre seus projetos e prazos atuais</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Empty State Cards */}
          <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projetos Ativos</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">0</div>
              <p className="text-xs text-muted-foreground">Nenhum projeto ativo ainda</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos Este Mês</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">0</div>
              <p className="text-xs text-muted-foreground">Comece criando projetos</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prazos Próximos</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">0</div>
              <p className="text-xs text-muted-foreground">Nenhum prazo próximo</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Visão Geral dos Projetos</h2>
        <p className="text-muted-foreground">Insights rápidos sobre seus projetos e prazos atuais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 📂 Active Projects Card */}
        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projetos Ativos</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-3">{calculatedData.activeProjects}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Em Progresso</span>
                <span className="font-medium text-success">{calculatedData.statusCounts.in_progress}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Em Revisão</span>
                <span className="font-medium text-warning">{calculatedData.statusCounts.review}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Planejamento</span>
                <span className="font-medium text-info">{calculatedData.statusCounts.planning}</span>
              </div>
            </div>
            {projects.length > 0 && (
              <>
                <Progress value={stats.averageProgress} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.averageProgress}% progresso médio
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* ✅ Completed This Month Card */}
        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos Este Mês</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-3">{calculatedData.completedThisMonth}</div>
            {calculatedData.completedThisMonth > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Alta Prioridade</span>
                  <Badge className="badge-danger text-xs">{calculatedData.completedByPriority.high}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Média Prioridade</span>
                  <Badge className="badge-warning text-xs">{calculatedData.completedByPriority.medium}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Baixa Prioridade</span>
                  <Badge className="badge-success text-xs">{calculatedData.completedByPriority.low}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhum projeto concluído ainda este mês</p>
            )}
            {calculatedData.completedThisMonth > 0 && (
              <div className="mt-3 p-2 bg-success/10 rounded-md">
                <p className="text-xs text-success">
                  {calculatedData.completedThisMonth} projeto{calculatedData.completedThisMonth > 1 ? 's' : ''} concluído{calculatedData.completedThisMonth > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 📅 Upcoming Deadlines Card */}
        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prazos Próximos</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-3">{calculatedData.totalDeadlines}</div>
            {calculatedData.totalDeadlines > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Para Hoje</span>
                  </div>
                  <Badge className="badge-danger text-xs">{calculatedData.upcomingDeadlines.today}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Esta Semana</span>
                  </div>
                  <Badge className="badge-warning text-xs">{calculatedData.upcomingDeadlines.thisWeek}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Próxima Semana</span>
                  </div>
                  <Badge className="badge-info text-xs">{calculatedData.upcomingDeadlines.nextWeek}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-muted-foreground">Nenhum prazo próximo</p>
                <p className="text-xs text-success">Todos os projetos estão em dia! 🎉</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 👥 Team Performance Card */}
        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance da Equipe</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-3">{calculatedData.teamPerformance}%</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entrega no Prazo</span>
                <span className="font-medium text-success">{calculatedData.onTimeDeliveryRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Score de Qualidade</span>
                <span className="font-medium text-primary">{calculatedData.qualityScore}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Satisfação Cliente</span>
                <span className="font-medium text-purple">{calculatedData.clientSatisfaction}%</span>
              </div>
            </div>
            <Progress value={calculatedData.teamPerformance} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-2">Eficiência geral da equipe</p>
          </CardContent>
        </Card>

        {/* 💰 Budget Overview Card */}
        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visão Geral do Orçamento</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-3">
              {formatCurrency(calculatedData.budgetSpent)}
            </div>
            {calculatedData.totalBudgetAllocated > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Orçamento Total</span>
                  <span className="font-medium">{formatCurrency(calculatedData.totalBudgetAllocated)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gasto</span>
                  <span className="font-medium">{formatCurrency(calculatedData.budgetSpent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Restante</span>
                  <span className="font-medium text-success">{formatCurrency(calculatedData.budgetRemaining)}</span>
                </div>
                <Progress value={calculatedData.averageBudgetUtilization} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {calculatedData.averageBudgetUtilization}% do orçamento utilizado
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhum orçamento definido ainda</p>
            )}
          </CardContent>
        </Card>

        {/* 📊 Project Overview Card */}
        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resumo dos Projetos</CardTitle>
            <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {calculatedData.statusCounts.completed} Concluído{calculatedData.statusCounts.completed !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calculatedData.statusCounts.completed > 0 ? 'Projetos finalizados' : 'Nenhum concluído ainda'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {calculatedData.statusCounts.in_progress} Em Progresso
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calculatedData.statusCounts.in_progress > 0 ? 'Desenvolvimento ativo' : 'Nenhum em andamento'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {calculatedData.statusCounts.review} Em Revisão
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calculatedData.statusCounts.review > 0 ? 'Aguardando aprovação' : 'Nenhuma revisão pendente'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}