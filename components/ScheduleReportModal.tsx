import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { CalendarIcon, Clock, Mail, Calendar as CalendarLucide, X, Loader2, ChevronDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { format } from '../utils/date';

interface ScheduleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScheduleConfig {
  reportName: string;
  reportType: string;
  frequency: string;
  startDate: Date | undefined;
  time: string;
  recipients: string[];
  format: string;
  includeCharts: boolean;
  description: string;
}

const reportTypes = [
  { id: 'performance', label: 'Performance Report' },
  { id: 'status', label: 'Project Status Summary' },
  { id: 'analytics', label: 'Team Analytics' },
  { id: 'financial', label: 'Financial Report' },
  { id: 'resources', label: 'Resource Allocation' },
];

const frequencies = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
];

const formats = [
  { id: 'pdf', label: 'PDF Document' },
  { id: 'excel', label: 'Excel Spreadsheet' },
  { id: 'csv', label: 'CSV File' },
  { id: 'html', label: 'HTML Report' },
];

export function ScheduleReportModal({ isOpen, onClose }: ScheduleReportModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<ScheduleConfig>({
    reportName: '',
    reportType: '',
    frequency: 'weekly',
    startDate: undefined,
    time: '09:00',
    recipients: [],
    format: 'pdf',
    includeCharts: true,
    description: ''
  });

  const [newRecipient, setNewRecipient] = useState('');

  const addRecipient = () => {
    if (newRecipient && !config.recipients.includes(newRecipient)) {
      setConfig(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient]
      }));
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setConfig(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const handleSubmit = async () => {
    if (!config.reportName || !config.reportType || !config.startDate) {
      toast.error('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(
        'Report Scheduled!', 
        `${config.reportName} has been scheduled to run ${config.frequency}`
      );
      onClose();
      
      // Reset form
      setConfig({
        reportName: '',
        reportType: '',
        frequency: 'weekly',
        startDate: undefined,
        time: '09:00',
        recipients: [],
        format: 'pdf',
        includeCharts: true,
        description: ''
      });
    } catch (error) {
      toast.error('Error', 'Failed to schedule report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="filter">
      <div className="flex flex-col" style={{ height: '85vh' }}>
        {/* Header - Compact */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CalendarLucide className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                Schedule Report
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Set up automated report generation and delivery
              </p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable with Visual Indicators */}
        <div className="flex-1 overflow-y-auto relative" style={{ minHeight: 0 }}>
          {/* Scroll Indicator Top */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
          
          <div className="px-6 py-4 space-y-4">
            
            {/* Report Configuration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Report Configuration</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="reportName" className="text-sm font-semibold text-gray-700">
                        Report Name *
                      </Label>
                      <Input
                        id="reportName"
                        value={config.reportName}
                        onChange={(e) => setConfig(prev => ({ ...prev, reportName: e.target.value }))}
                        placeholder="Enter report name"
                        className="h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-green-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Report Type *</Label>
                      <Select 
                        value={config.reportType} 
                        onValueChange={(value) => setConfig(prev => ({ ...prev, reportType: value }))}
                      >
                        <SelectTrigger className="h-9 bg-white border-gray-300 hover:border-gray-400 text-sm">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={config.description}
                      onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what this report covers"
                      className="h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-green-500 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-3" />

            {/* Schedule Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Schedule Settings</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Frequency</Label>
                      <Select 
                        value={config.frequency} 
                        onValueChange={(value) => setConfig(prev => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger className="h-9 bg-white border-gray-300 hover:border-gray-400 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map((freq) => (
                            <SelectItem key={freq.id} value={freq.id}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-9 bg-white border-gray-300 hover:border-gray-400 text-sm"
                          >
                            <CalendarIcon className="mr-2 h-3 w-3 text-gray-500" />
                            {config.startDate ? (
                              <span className="text-gray-900">{format(config.startDate, "dd/MM/yyyy")}</span>
                            ) : (
                              <span className="text-gray-500">Select date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={config.startDate}
                            onSelect={(date) => setConfig(prev => ({ ...prev, startDate: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-sm font-semibold text-gray-700">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={config.time}
                        onChange={(e) => setConfig(prev => ({ ...prev, time: e.target.value }))}
                        className="h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-3" />

            {/* Output Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Output Settings</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">File Format</Label>
                    <Select 
                      value={config.format} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, format: value }))}
                    >
                      <SelectTrigger className="h-9 bg-white border-gray-300 hover:border-gray-400 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format.id} value={format.id}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-white border">
                    <Checkbox
                      id="includeCharts"
                      checked={config.includeCharts}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, includeCharts: checked as boolean }))
                      }
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <Label htmlFor="includeCharts" className="font-medium cursor-pointer text-sm">
                      Include charts and visualizations
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-3" />

            {/* Email Recipients */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Email Recipients</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <Input
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-orange-500 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                    />
                    <Button 
                      onClick={addRecipient} 
                      variant="outline" 
                      className="h-9 px-4 border-gray-300 hover:bg-gray-50 text-sm"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>

                  {config.recipients.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Recipients ({config.recipients.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {config.recipients.map((email, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-2 bg-orange-100 text-orange-800 px-2.5 py-1.5 rounded-lg border border-orange-200 text-sm"
                          >
                            <Mail className="h-3 w-3" />
                            <span className="font-medium">{email}</span>
                            <button
                              onClick={() => removeRecipient(email)}
                              className="text-orange-600 hover:text-orange-800 p-0.5 rounded hover:bg-orange-200 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
              className="sm:w-auto h-9 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarLucide className="h-3 w-3 mr-2" />
                  Schedule Report
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