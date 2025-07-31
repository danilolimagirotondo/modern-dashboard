import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Mail, Loader2, Plus, X, Crown, Shield, User, ChevronDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface InviteTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent?: () => void;
}

interface InviteData {
  emails: string[];
  role: string;
  message: string;
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

const projects = [
  { id: '1', name: 'Website Redesign' },
  { id: '2', name: 'Mobile App Development' },
  { id: '3', name: 'Marketing Campaign' },
  { id: '4', name: 'Database Migration' },
];

export function InviteTeamMemberModal({ isOpen, onClose, onInviteSent }: InviteTeamMemberModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [inviteData, setInviteData] = useState<InviteData>({
    emails: [],
    role: 'colaborador',
    message: '',
    projectAccess: []
  });

  const addEmail = () => {
    const email = currentEmail.trim();
    if (email && isValidEmail(email) && !inviteData.emails.includes(email)) {
      setInviteData(prev => ({
        ...prev,
        emails: [...prev.emails, email]
      }));
      setCurrentEmail('');
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setInviteData(prev => ({
      ...prev,
      emails: prev.emails.filter(email => email !== emailToRemove)
    }));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  const toggleProjectAccess = (projectId: string) => {
    setInviteData(prev => ({
      ...prev,
      projectAccess: prev.projectAccess.includes(projectId)
        ? prev.projectAccess.filter(id => id !== projectId)
        : [...prev.projectAccess, projectId]
    }));
  };

  const handleSubmit = async () => {
    if (inviteData.emails.length === 0) {
      toast.error('Validation Error', 'Please add at least one email address');
      return;
    }

    if (!inviteData.role) {
      toast.error('Validation Error', 'Please select a role');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(
        'Invitations Sent!', 
        `${inviteData.emails.length} invitation(s) sent successfully`
      );
      
      onInviteSent?.();
      onClose();
      
      // Reset form
      setInviteData({
        emails: [],
        role: 'colaborador',
        message: '',
        projectAccess: []
      });
      setCurrentEmail('');
    } catch (error) {
      toast.error('Error', 'Failed to send invitations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = roles.find(role => role.id === inviteData.role);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="filter">
      <div className="flex flex-col" style={{ height: '85vh' }}>
        {/* Header - Compact */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                Invite Team Members
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Send email invitations to add new team members
              </p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable with Visual Indicators */}
        <div className="flex-1 overflow-y-auto relative" style={{ minHeight: 0 }}>
          {/* Scroll Indicator Top */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
          
          <div className="px-6 py-4 space-y-4">
            
            {/* Email Addresses */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Email Addresses</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Input
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter email address"
                    className="flex-1 h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 text-sm"
                  />
                  <Button 
                    onClick={addEmail} 
                    variant="outline" 
                    className="h-9 px-4 border-gray-300 hover:bg-gray-50 text-sm"
                    disabled={!currentEmail.trim() || !isValidEmail(currentEmail.trim())}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                {inviteData.emails.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Email Recipients ({inviteData.emails.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {inviteData.emails.map((email, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 bg-blue-100 text-blue-800 px-2.5 py-1.5 rounded-lg border border-blue-200 text-sm"
                        >
                          <Mail className="h-3 w-3" />
                          <span className="font-medium">{email}</span>
                          <button
                            onClick={() => removeEmail(email)}
                            className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-200 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Role Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Role Assignment</h3>
              </div>
              
              <div className="space-y-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = inviteData.role === role.id;
                  return (
                    <Card
                      key={role.id}
                      className={`cursor-pointer transition-all duration-200 border-2 ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-100'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setInviteData(prev => ({ ...prev, role: role.id }))}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              isSelected ? 'text-green-600' : role.color
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
            {inviteData.role !== 'admin' && (
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
                              checked={inviteData.projectAccess.includes(project.id)}
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

            <Separator className="my-3" />

            {/* Personal Message */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">Personal Message (Optional)</h3>
              </div>
              
              <Textarea
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal message to the invitation email..."
                rows={3}
                className="bg-white border-gray-300 hover:border-gray-400 focus:border-orange-500 resize-none text-sm"
              />
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
            <div className="text-sm text-gray-600">
              {inviteData.emails.length > 0 && (
                <span>
                  {inviteData.emails.length} recipient(s) • Role: {selectedRole?.label}
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
                disabled={isSubmitting || inviteData.emails.length === 0}
                className="sm:w-auto h-9 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-3 w-3 mr-2" />
                    Send Invitations
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