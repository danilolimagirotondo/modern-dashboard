import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { CalendarIcon, FileText, BarChart3, Users, DollarSign, Target, Loader2, ChevronDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { format } from '../utils/date';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated?: () => void;
}

interface ReportConfig {
  name: string;
  type: string;
  description: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  includeProjects: string[];
  metrics: string[];
  format: string;
  includeCharts: boolean;
  includeDetails: boolean;
  priority: string;
}

const reportTypes = [
  { 
    id: 'performance', 
    label: 'Performance Report',
    icon: BarChart3,
    description: 'Analyze team and project performance metrics',
    color: 'blue'
  },
  { 
    id: 'status', 
    label: 'Project Status Summary',
    icon: Target,
    description: 'Overview of all project statuses and progress',
    color: 'green'
  },
  { 
    id: 'financial', 
    label: 'Financial Report',
    icon: DollarSign,
    description: 'Budget utilization and financial analysis',
    color: 'emerald'
  },
  { 
    id: 'team', 
    label: 'Team Analytics',
    icon: Users,
    description: 'Team productivity and resource allocation',
    color: 'purple'
  },
];

const availableMetrics = [
  { id: 'completion_rate', label: 'Project Completion Rate' },
  { id: 'budget_utilization', label: 'Budget Utilization' },
  { id: 'team_productivity', label: 'Team Productivity' },
  { id: 'timeline_adherence', label: 'Timeline Adherence' },
  { id: 'client_satisfaction', label: 'Client Satisfaction' },
  { id: 'resource_allocation', label: 'Resource Allocation' },
];

const projects = [
  { id: '1', name: 'Website Redesign', client: 'TechCorp' },
  { id: '2', name: 'Mobile App Development', client: 'StartupXYZ' },
  { id: '3', name: 'Marketing Campaign', client: 'RetailCo' },
  { id: '4', name: 'Database Migration', client: 'FinanceInc' },
];

export function NewReportModal({ isOpen, onClose, onReportCreated }: NewReportModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    type: '',
    description: '',
    dateRange: {},
    includeProjects: [],
    metrics: [],
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    priority: 'medium'
  });

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      includeProjects: checked 
        ? [...prev.includeProjects, projectId]
        : prev.includeProjects.filter(p => p !== projectId)
    }));
  };

  const handleMetricToggle = (metricId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      metrics: checked 
        ? [...prev.metrics, metricId]
        : prev.metrics.filter(m => m !== metricId)
    }));
  };

  const handleSubmit = async () => {
    if (!config.name || !config.type) {
      toast.error('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (config.metrics.length === 0) {
      toast.error('Validation Error', 'Please select at least one metric');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(
        'Report Created!', 
        `${config.name} is being generated and will be ready shortly`
      );
      
      onReportCreated?.();
      onClose();
      
      // Reset form
      setConfig({
        name: '',
        type: '',
        description: '',
        dateRange: {},
        includeProjects: [],
        metrics: [],
        format: 'pdf',
        includeCharts: true,
        includeDetails: true,
        priority: 'medium'
      });
    } catch (error) {
      toast.error('Error', 'Failed to create report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="filter">
      <div className="flex flex-col" style={{ height: '85vh' }}>
        {/* Header - Compact */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                Create New Report
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Generate a custom report with your specific requirements
              </p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable with Visual Indicators */}
        <div className="flex-1 overflow-y-auto relative" style={{ minHeight: 0 }}>
          {/* Scroll Indicator Top */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
          
          <div className="px-6 py-4 space-y-4">
            
            {/* Basic Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Report Information</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="reportName" className="text-sm font-semibold text-gray-700">
                      Report Name *
                    </Label>
                    <Input
                      id="reportName"
                      value={config.name}
                      onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter a descriptive name for your report"
                      className="h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={config.description}
                      onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Briefly describe what this report will cover"
                      rows={2}
                      className="bg-white border-gray-300 hover:border-gray-400 focus:border-purple-500 resize-none text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-3" />

            {/* Report Type */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Report Type *</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = config.type === type.id;
                  return (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all duration-200 border-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setConfig(prev => ({ ...prev, type: type.id }))}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              isSelected ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-0.5 text-sm">{type.label}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">{type.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Date Range */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Date Range</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">From Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-9 bg-white border-gray-300 hover:border-gray-400 text-sm"
                          >
                            <CalendarIcon className="mr-2 h-3 w-3 text-gray-500" />
                            {config.dateRange.from ? (
                              <span className="text-gray-900">{format(config.dateRange.from, "dd/MM/yyyy")}</span>
                            ) : (
                              <span className="text-gray-500">Select start date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={config.dateRange.from}
                            onSelect={(date) => 
                              setConfig(prev => ({
                                ...prev,
                                dateRange: { ...prev.dateRange, from: date }
                              }))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-9 bg-white border-gray-300 hover:border-gray-400 text-sm"
                          >
                            <CalendarIcon className="mr-2 h-3 w-3 text-gray-500" />
                            {config.dateRange.to ? (
                              <span className="text-gray-900">{format(config.dateRange.to, "dd/MM/yyyy")}</span>
                            ) : (
                              <span className="text-gray-500">Select end date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={config.dateRange.to}
                            onSelect={(date) => 
                              setConfig(prev => ({
                                ...prev,
                                dateRange: { ...prev.dateRange, to: date }
                              }))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-3" />

            {/* Projects */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Include Projects</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                    <Checkbox
                      id="all-projects"
                      checked={config.includeProjects.length === projects.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setConfig(prev => ({ 
                            ...prev, 
                            includeProjects: projects.map(p => p.id) 
                          }));
                        } else {
                          setConfig(prev => ({ ...prev, includeProjects: [] }));
                        }
                      }}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label htmlFor="all-projects" className="font-semibold text-blue-900 cursor-pointer text-sm">
                      Select All Projects
                    </Label>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center space-x-2 p-2.5 rounded-lg hover:bg-white/60 transition-colors">
                        <Checkbox
                          id={project.id}
                          checked={config.includeProjects.includes(project.id)}
                          onCheckedChange={(checked) => 
                            handleProjectToggle(project.id, checked as boolean)
                          }
                          className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                        />
                        <Label htmlFor={project.id} className="cursor-pointer flex-1">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{project.name}</div>
                            <div className="text-xs text-gray-600">{project.client}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-3" />

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-teal-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Metrics to Include *</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableMetrics.map((metric) => (
                      <div key={metric.id} className="flex items-center space-x-2 p-2.5 rounded-lg hover:bg-white/60 transition-colors">
                        <Checkbox
                          id={metric.id}
                          checked={config.metrics.includes(metric.id)}
                          onCheckedChange={(checked) => 
                            handleMetricToggle(metric.id, checked as boolean)
                          }
                          className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                        />
                        <Label htmlFor={metric.id} className="font-medium text-gray-900 cursor-pointer flex-1 text-sm">
                          {metric.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-3" />

            {/* Output Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Output Settings</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Format</Label>
                      <Select 
                        value={config.format} 
                        onValueChange={(value) => setConfig(prev => ({ ...prev, format: value }))}
                      >
                        <SelectTrigger className="h-9 bg-white border-gray-300 hover:border-gray-400 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                          <SelectItem value="csv">CSV File</SelectItem>
                          <SelectItem value="html">HTML Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Priority</Label>
                      <Select 
                        value={config.priority} 
                        onValueChange={(value) => setConfig(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger className="h-9 bg-white border-gray-300 hover:border-gray-400 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-white border">
                      <Checkbox
                        id="includeCharts"
                        checked={config.includeCharts}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ ...prev, includeCharts: checked as boolean }))
                        }
                        className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <Label htmlFor="includeCharts" className="font-medium cursor-pointer text-sm">
                        Include charts and visualizations
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-white border">
                      <Checkbox
                        id="includeDetails"
                        checked={config.includeDetails}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ ...prev, includeDetails: checked as boolean }))
                        }
                        className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <Label htmlFor="includeDetails" className="font-medium cursor-pointer text-sm">
                        Include detailed breakdown
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Padding for Scroll */}
            <div className="h-8"></div>
          </div>

          {/* Scroll Indicator Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Footer - Always Visible */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50/80 border-t border-gray-200 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="sm:w-auto h-9 px-6 border-gray-300 hover:bg-gray-50 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="sm:w-auto h-9 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-3 w-3 mr-2" />
                  Create Report
                </>
              )}
            </Button>
          </div>
          
          {/* Scroll Hint */}
          <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
            <ChevronDown className="h-3 w-3 mr-1 animate-bounce" />
            Scroll up to see all options
          </div>
        </div>
      </div>
    </Modal>
  );
}