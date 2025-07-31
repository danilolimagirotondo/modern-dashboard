import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { UserPlus, Loader2, Upload, Crown, Shield, User, ChevronDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded?: () => void;
}

interface MemberData {
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
  avatar: string;
  projectAccess: string[];
}

const roles = [
  { 
    id: 'admin', 
    label: 'Admin', 
    description: 'Full access to all features and settings',
    icon: Crown,
    color: 'text-yellow-600'
  },
  { 
    id: 'gestor', 
    label: 'Project Manager', 
    description: 'Manage projects and team assignments',
    icon: Shield,
    color: 'text-blue-600'
  },
  { 
    id: 'colaborador', 
    label: 'Team Member', 
    description: 'Access to assigned projects only',
    icon: User,
    color: 'text-gray-600'
  },
];

const departments = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Operations',
  'HR',
  'Finance'
];

const projects = [
  { id: '1', name: 'Website Redesign' },
  { id: '2', name: 'Mobile App Development' },
  { id: '3', name: 'Marketing Campaign' },
  { id: '4', name: 'Database Migration' },
];

export function AddTeamMemberModal({ isOpen, onClose, onMemberAdded }: AddTeamMemberModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberData, setMemberData] = useState<MemberData>({
    name: '',
    email: '',
    role: 'colaborador',
    phone: '',
    department: '',
    avatar: '',
    projectAccess: []
  });

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const toggleProjectAccess = (projectId: string) => {
    setMemberData(prev => ({
      ...prev,
      projectAccess: prev.projectAccess.includes(projectId)
        ? prev.projectAccess.filter(id => id !== projectId)
        : [...prev.projectAccess, projectId]
    }));
  };

  const generateInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async () => {
    if (!memberData.name.trim()) {
      toast.error('Validation Error', 'Please enter the member name');
      return;
    }

    if (!memberData.email.trim() || !isValidEmail(memberData.email)) {
      toast.error('Validation Error', 'Please enter a valid email address');
      return;
    }

    if (!memberData.role) {
      toast.error('Validation Error', 'Please select a role');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(
        'Member Added!', 
        `${memberData.name} has been added to the team successfully`
      );
      
      onMemberAdded?.();
      onClose();
      
      // Reset form
      setMemberData({
        name: '',
        email: '',
        role: 'colaborador',
        phone: '',
        department: '',
        avatar: '',
        projectAccess: []
      });
    } catch (error) {
      toast.error('Error', 'Failed to add team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = roles.find(role => role.id === memberData.role);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="filter">
      <div className="flex flex-col" style={{ height: '85vh' }}>
        {/* Header - Compact */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                Add Team Member
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Add a new member directly to your team
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
                <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                <CardContent className="p-4 space-y-3">
                  {/* Avatar Preview */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={memberData.avatar} />
                      <AvatarFallback className="bg-green-100 text-green-800 font-semibold text-sm">
                        {memberData.name ? generateInitials(memberData.name) : 'TM'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label className="text-sm font-semibold text-gray-700">Profile Picture</Label>
                      <p className="text-xs text-gray-600 mb-2">Optional - Upload a profile picture</p>
                      <Button variant="outline" size="sm" disabled className="h-8 px-3 text-xs">
                        <Upload className="h-3 w-3 mr-1" />
                        Upload Image
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={memberData.name}
                        onChange={(e) => setMemberData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                        className="h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-green-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={memberData.email}
                        onChange={(e) => setMemberData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                        className="h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-green-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={memberData.phone}
                        onChange={(e) => setMemberData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        className="h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-green-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Department</Label>
                      <Select 
                        value={memberData.department} 
                        onValueChange={(value) => setMemberData(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger className="h-9 bg-white border-gray-300 hover:border-gray-400 text-sm">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-3" />

            {/* Role Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Role Assignment</h3>
              </div>
              
              <div className="space-y-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = memberData.role === role.id;
                  return (
                    <Card
                      key={role.id}
                      className={`cursor-pointer transition-all duration-200 border-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setMemberData(prev => ({ ...prev, role: role.id }))}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              isSelected ? 'text-blue-600' : role.color
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-0.5 text-sm">{role.label}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">{role.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Project Access (only for non-admin roles) */}
            {memberData.role !== 'admin' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                  <h3 className="text-base font-semibold text-gray-900">Project Access</h3>
                </div>
                
                <Card className="border border-gray-200 shadow-sm bg-gray-50/30">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">
                        Select projects this person can access
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {projects.map((project) => (
                          <div 
                            key={project.id} 
                            className="flex items-center space-x-2 p-2.5 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                            onClick={() => toggleProjectAccess(project.id)}
                          >
                            <Checkbox
                              checked={memberData.projectAccess.includes(project.id)}
                              onCheckedChange={() => toggleProjectAccess(project.id)}
                              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            />
                            <Label className="font-medium text-gray-900 cursor-pointer flex-1 text-sm">
                              {project.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Bottom Padding for Scroll */}
            <div className="h-8"></div>
          </div>

          {/* Scroll Indicator Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Footer - Always Visible */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50/80 border-t border-gray-200 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="text-sm text-gray-600">
              {memberData.name && memberData.email && (
                <span>
                  Adding: {memberData.name} • Role: {selectedRole?.label}
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
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
                disabled={isSubmitting || !memberData.name.trim() || !memberData.email.trim()}
                className="sm:w-auto h-9 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 mr-2" />
                    Add Member
                  </>
                )}
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