import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  Users, 
  Building2, 
  CheckCircle2,
  RotateCcw,
  Search
} from 'lucide-react';
import { format } from '../utils/date';

export interface ProjectFilters {
  status: string[];
  assignees: string[];
  clients: string[];
  startDate?: Date;
  endDate?: Date;
  search: string;
}

interface ProjectFiltersProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  availableAssignees: { id: string; name: string }[];
  availableClients: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appliedFiltersCount: number;
}

const statusOptions = [
  { value: 'planning', label: 'Planejamento', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
  { value: 'review', label: 'Em Revisão', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Concluído', color: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: 'Pausado', color: 'bg-red-100 text-red-800' },
];

export function ProjectFilters({
  filters,
  onFiltersChange,
  availableAssignees,
  availableClients,
  isOpen,
  onOpenChange,
  appliedFiltersCount
}: ProjectFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProjectFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...localFilters.status, status]
      : localFilters.status.filter(s => s !== status);
    
    const newFilters = { ...localFilters, status: newStatus };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAssigneeChange = (assigneeId: string, checked: boolean) => {
    const newAssignees = checked
      ? [...localFilters.assignees, assigneeId]
      : localFilters.assignees.filter(a => a !== assigneeId);
    
    const newFilters = { ...localFilters, assignees: newAssignees };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClientChange = (client: string, checked: boolean) => {
    const newClients = checked
      ? [...localFilters.clients, client]
      : localFilters.clients.filter(c => c !== client);
    
    const newFilters = { ...localFilters, clients: newClients };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateChange = (type: 'start' | 'end', date?: Date) => {
    const newFilters = {
      ...localFilters,
      [type === 'start' ? 'startDate' : 'endDate']: date
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (search: string) => {
    const newFilters = { ...localFilters, search };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: ProjectFilters = {
      status: [],
      assignees: [],
      clients: [],
      startDate: undefined,
      endDate: undefined,
      search: ''
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = appliedFiltersCount > 0;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative h-10 px-4 gap-2">
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <Badge 
              variant="secondary" 
              className="ml-1 h-5 px-2 bg-blue-600 text-white border-blue-600 text-xs"
            >
              {appliedFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-full sm:w-[480px] max-w-[90vw] p-0 overflow-y-auto bg-white"
      >
        {/* Header with generous padding */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <SheetHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Filter className="h-4 w-4 text-blue-600" />
                </div>
                Filtrar Projetos
              </SheetTitle>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3 gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Limpar
                </Button>
              )}
            </div>
            <SheetDescription className="text-gray-600 leading-relaxed">
              Use os filtros abaixo para encontrar projetos específicos de forma rápida e precisa.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Content with generous padding */}
        <div className="px-8 py-6 space-y-8">
          {/* Search Section */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Search className="h-4 w-4 text-gray-600" />
              Busca Rápida
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nome do projeto, cliente..."
                value={localFilters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300"
              />
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Status Filter */}
          <div className="space-y-5">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <CheckCircle2 className="h-4 w-4 text-gray-600" />
              Status do Projeto
            </Label>
            <div className="space-y-4">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center space-x-3 py-1">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={localFilters.status.includes(status.value)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(status.value, checked as boolean)
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label 
                    htmlFor={`status-${status.value}`}
                    className="flex items-center cursor-pointer flex-1"
                  >
                    <Badge variant="outline" className={`${status.color} border font-medium`}>
                      {status.label}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
            {localFilters.status.length > 0 && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                {localFilters.status.length} status selecionado{localFilters.status.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <Separator className="bg-gray-200" />

          {/* Assignee Filter */}
          <div className="space-y-5">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Users className="h-4 w-4 text-gray-600" />
              Responsável
            </Label>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
              {availableAssignees.length > 0 ? (
                availableAssignees.map((assignee) => (
                  <div key={assignee.id} className="flex items-center space-x-3 py-1">
                    <Checkbox
                      id={`assignee-${assignee.id}`}
                      checked={localFilters.assignees.includes(assignee.id)}
                      onCheckedChange={(checked) => 
                        handleAssigneeChange(assignee.id, checked as boolean)
                      }
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label 
                      htmlFor={`assignee-${assignee.id}`}
                      className="cursor-pointer font-medium text-gray-700 flex-1"
                    >
                      {assignee.name}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-4 rounded-lg text-center">
                  Nenhum responsável encontrado
                </div>
              )}
            </div>
            {localFilters.assignees.length > 0 && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                {localFilters.assignees.length} responsável{localFilters.assignees.length > 1 ? 'eis' : ''} selecionado{localFilters.assignees.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <Separator className="bg-gray-200" />

          {/* Client Filter */}
          <div className="space-y-5">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Building2 className="h-4 w-4 text-gray-600" />
              Cliente
            </Label>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
              {availableClients.length > 0 ? (
                availableClients.map((client) => (
                  <div key={client} className="flex items-center space-x-3 py-1">
                    <Checkbox
                      id={`client-${client}`}
                      checked={localFilters.clients.includes(client)}
                      onCheckedChange={(checked) => 
                        handleClientChange(client, checked as boolean)
                      }
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label 
                      htmlFor={`client-${client}`}
                      className="cursor-pointer font-medium text-gray-700 flex-1"
                    >
                      {client}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-4 rounded-lg text-center">
                  Nenhum cliente encontrado
                </div>
              )}
            </div>
            {localFilters.clients.length > 0 && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                {localFilters.clients.length} cliente{localFilters.clients.length > 1 ? 's' : ''} selecionado{localFilters.clients.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <Separator className="bg-gray-200" />

          {/* Date Range Filter */}
          <div className="space-y-5">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <CalendarIcon className="h-4 w-4 text-gray-600" />
              Período de Entrega
            </Label>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Data Inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-11 bg-gray-50 border-gray-200 hover:bg-white"
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-gray-400" />
                      {localFilters.startDate ? (
                        format(localFilters.startDate, "dd/MM/yyyy")
                      ) : (
                        <span className="text-gray-500">Selecionar data inicial</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.startDate}
                      onSelect={(date) => handleDateChange('start', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Data Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-11 bg-gray-50 border-gray-200 hover:bg-white"
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-gray-400" />
                      {localFilters.endDate ? (
                        format(localFilters.endDate, "dd/MM/yyyy")
                      ) : (
                        <span className="text-gray-500">Selecionar data final</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.endDate}
                      onSelect={(date) => handleDateChange('end', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {(localFilters.startDate || localFilters.endDate) && (
              <div className="flex flex-wrap gap-2">
                {localFilters.startDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateChange('start', undefined)}
                    className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                  >
                    <X className="h-3 w-3" />
                    Remover início
                  </Button>
                )}
                {localFilters.endDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateChange('end', undefined)}
                    className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                  >
                    <X className="h-3 w-3" />
                    Remover fim
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-900">Filtros Aplicados:</Label>
              <div className="flex flex-wrap gap-2">
                {localFilters.status.map(status => {
                  const statusOption = statusOptions.find(s => s.value === status);
                  return (
                    <Badge 
                      key={status} 
                      variant="secondary" 
                      className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                    >
                      {statusOption?.label}
                    </Badge>
                  );
                })}
                {localFilters.assignees.map(assigneeId => {
                  const assignee = availableAssignees.find(a => a.id === assigneeId);
                  return (
                    <Badge 
                      key={assigneeId} 
                      variant="secondary" 
                      className="text-xs bg-purple-100 text-purple-800 border-purple-200"
                    >
                      {assignee?.name}
                    </Badge>
                  );
                })}
                {localFilters.clients.map(client => (
                  <Badge 
                    key={client} 
                    variant="secondary" 
                    className="text-xs bg-green-100 text-green-800 border-green-200"
                  >
                    {client}
                  </Badge>
                ))}
                {localFilters.search && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-orange-100 text-orange-800 border-orange-200"
                  >
                    Busca: "{localFilters.search}"
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}