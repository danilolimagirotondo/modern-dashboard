import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { CalendarIcon, Filter, X, RotateCcw, ChevronDown } from 'lucide-react';
import { format } from '../utils/date';

interface ReportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ReportFilters) => void;
  currentFilters: ReportFilters;
}

export interface ReportFilters {
  types: string[];
  status: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const reportTypes = [
  { id: 'performance', label: 'Performance' },
  { id: 'status', label: 'Status' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'financial', label: 'Financial' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'resources', label: 'Resources' },
];

const reportStatuses = [
  { id: 'ready', label: 'Ready' },
  { id: 'processing', label: 'Processing' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'failed', label: 'Failed' },
];

const sortOptions = [
  { id: 'name', label: 'Name' },
  { id: 'date', label: 'Date' },
  { id: 'type', label: 'Type' },
  { id: 'status', label: 'Status' },
];

export function ReportFilterModal({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters 
}: ReportFilterModalProps) {
  const [filters, setFilters] = useState<ReportFilters>(currentFilters);

  const handleTypeChange = (typeId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      types: checked 
        ? [...prev.types, typeId]
        : prev.types.filter(t => t !== typeId)
    }));
  };

  const handleStatusChange = (statusId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      status: checked 
        ? [...prev.status, statusId]
        : prev.status.filter(s => s !== statusId)
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: ReportFilters = {
      types: [],
      status: [],
      dateRange: {},
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(resetFilters);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="filter">
      <div className="flex flex-col" style={{ height: '85vh' }}>
        {/* Header - Compact */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                Advanced Filters
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Customize your report view with precise filtering options
              </p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable with Visual Indicators */}
        <div className="flex-1 overflow-y-auto relative" style={{ minHeight: 0 }}>
          {/* Scroll Indicator Top */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
          
          <div className="px-6 py-4 space-y-4">
            
            {/* Report Types Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Report Types</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {reportTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2 p-2.5 rounded-lg hover:bg-white/60 transition-colors">
                        <Checkbox
                          id={type.id}
                          checked={filters.types.includes(type.id)}
                          onCheckedChange={(checked) => 
                            handleTypeChange(type.id, checked as boolean)
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label htmlFor={type.id} className="font-medium text-gray-900 cursor-pointer flex-1 text-sm">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-3" />

            {/* Status Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Status</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {reportStatuses.map((status) => (
                      <div key={status.id} className="flex items-center space-x-2 p-2.5 rounded-lg hover:bg-white/60 transition-colors">
                        <Checkbox
                          id={status.id}
                          checked={filters.status.includes(status.id)}
                          onCheckedChange={(checked) => 
                            handleStatusChange(status.id, checked as boolean)
                          }
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        <Label htmlFor={status.id} className="font-medium text-gray-900 cursor-pointer flex-1 text-sm">
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-3" />

            {/* Date Range Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
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
                            {filters.dateRange.from ? (
                              <span className="text-gray-900">{format(filters.dateRange.from, "dd/MM/yyyy")}</span>
                            ) : (
                              <span className="text-gray-500">Select start date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.from}
                            onSelect={(date) => 
                              setFilters(prev => ({
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
                            {filters.dateRange.to ? (
                              <span className="text-gray-900">{format(filters.dateRange.to, "dd/MM/yyyy")}</span>
                            ) : (
                              <span className="text-gray-500">Select end date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.to}
                            onSelect={(date) => 
                              setFilters(prev => ({
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

            {/* Sorting Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Sorting</h3>
              </div>
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Sort by</Label>
                      <Select 
                        value={filters.sortBy} 
                        onValueChange={(value) => 
                          setFilters(prev => ({ ...prev, sortBy: value }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-white border-gray-300 hover:border-gray-400 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Order</Label>
                      <Select 
                        value={filters.sortOrder} 
                        onValueChange={(value: 'asc' | 'desc') => 
                          setFilters(prev => ({ ...prev, sortOrder: value }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-white border-gray-300 hover:border-gray-400 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
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
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <Button
              variant="outline"
              onClick={handleReset}
              className="sm:w-auto h-9 px-4 border-gray-300 hover:bg-gray-50 text-sm"
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              Reset All
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="sm:w-auto h-9 px-6 border-gray-300 hover:bg-gray-50 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                className="sm:w-auto h-9 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg text-sm"
              >
                <Filter className="h-3 w-3 mr-2" />
                Apply Filters
              </Button>
            </div>
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