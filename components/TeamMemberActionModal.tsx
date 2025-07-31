import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  User, 
  Settings, 
  UserX, 
  MessageSquare, 
  Crown, 
  Shield, 
  Mail, 
  Phone, 
  Calendar,
  Loader2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface TeamMemberActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
    initials: string;
    status: string;
    projects: number;
    lastActive: string;
  } | null;
  actionType: 'profile' | 'edit' | 'remove' | 'message';
  onActionComplete?: () => void;
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
  { id: '1', name: 'Website Redesign', status: 'Active' },
  { id: '2', name: 'Mobile App Development', status: 'In Progress' },
  { id: '3', name: 'Marketing Campaign', status: 'Completed' },
];

export function TeamMemberActionModal({ 
  isOpen, 
  onClose, 
  member, 
  actionType, 
  onActionComplete 
}: TeamMemberActionModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState(member?.role || '');
  const [message, setMessage] = useState('');
  const [confirmText, setConfirmText] = useState('');

  if (!member) return null;

  const handleRoleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Role Updated', `${member.name}'s role has been updated successfully`);
      onActionComplete?.();
      onClose();
    } catch (error) {
      toast.error('Error', 'Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (confirmText !== member.name) {
      toast.error('Confirmation Error', 'Please type the member name exactly as shown');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Member Removed', `${member.name} has been removed from the team`);
      onActionComplete?.();
      onClose();
    } catch (error) {
      toast.error('Error', 'Failed to remove member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Validation Error', 'Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Message Sent', `Your message has been sent to ${member.name}`);
      setMessage('');
      onActionComplete?.();
      onClose();
    } catch (error) {
      toast.error('Error', 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalConfig = () => {
    switch (actionType) {
      case 'profile':
        return {
          title: 'Member Profile',
          subtitle: 'View detailed information about this team member',
          icon: User,
          color: 'blue'
        };
      case 'edit':
        return {
          title: 'Edit Permissions',
          subtitle: 'Update role and access permissions',
          icon: Settings,
          color: 'green'
        };
      case 'remove':
        return {
          title: 'Remove Member',
          subtitle: 'Remove this member from the team',
          icon: UserX,
          color: 'red'
        };
      case 'message':
        return {
          title: 'Send Message',
          subtitle: 'Send a direct message to this team member',
          icon: MessageSquare,
          color: 'purple'
        };
      default:
        return {
          title: 'Member Actions',
          subtitle: '',
          icon: User,
          color: 'blue'
        };
    }
  };

  const config = getModalConfig();
  const Icon = config.icon;

  const selectedRole = roles.find(role => role.id === newRole);
  const currentRole = roles.find(role => role.label === member.role);

  // Determine if content needs scroll based on action type
  const needsScroll = actionType === 'profile' || actionType === 'edit';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={actionType === 'profile' ? 'lg' : 'md'}>
      <div className="flex flex-col" style={{ height: needsScroll ? '85vh' : 'auto', maxHeight: '85vh' }}>
        {/* Header - Compact */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {config.title}
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {config.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 ${needsScroll ? 'overflow-y-auto relative' : 'overflow-visible'} p-6`} style={needsScroll ? { minHeight: 0 } : {}}>
          {needsScroll && (
            <>
              {/* Scroll Indicator Top */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
            </>
          )}

          <div className={needsScroll ? "space-y-4" : "space-y-6"}>
            {actionType === 'profile' && (
              <>
                {/* Member Info */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="font-semibold">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                        <p className="text-gray-600 mb-2">{member.email}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            {member.role}
                          </Badge>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>Last active: {member.lastActive}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span>{member.projects} active projects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentRole?.icon && <currentRole.icon className={`h-3 w-3 ${currentRole.color}`} />}
                        <span>{member.role}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Projects */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Active Projects</h4>
                    <div className="space-y-2">
                      {projects.slice(0, member.projects > 3 ? 3 : member.projects).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900 text-sm">{project.name}</span>
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 text-xs">
                            {project.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {actionType === 'edit' && (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-gray-600 text-sm">{member.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Select New Role</Label>
                    <div className="space-y-2">
                      {roles.map((role) => {
                        const RoleIcon = role.icon;
                        const isSelected = newRole === role.id;
                        return (
                          <div
                            key={role.id}
                            className={`cursor-pointer p-3 border-2 rounded-lg transition-all ${
                              isSelected
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setNewRole(role.id)}
                          >
                            <div className="flex items-start gap-2">
                              <RoleIcon className={`h-4 w-4 mt-0.5 ${role.color}`} />
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">{role.label}</h4>
                                <p className="text-xs text-gray-600">{role.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {actionType === 'remove' && (
              <>
                <Card className="border border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-red-900 mb-2">Remove Team Member</h3>
                        <p className="text-red-700 mb-3 text-sm">
                          This action will permanently remove {member.name} from the team and revoke all access permissions. 
                          This cannot be undone.
                        </p>
                        <div className="bg-white p-3 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                              <p className="text-xs text-gray-600">{member.email}</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">
                            <p>• Will lose access to {member.projects} active projects</p>
                            <p>• All permissions will be revoked immediately</p>
                            <p>• Member will be notified via email</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <Label className="text-sm font-semibold text-gray-700">
                      Type "{member.name}" to confirm removal
                    </Label>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={member.name}
                      className="mt-2 h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-red-500 text-sm"
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {actionType === 'message' && (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-gray-600 text-sm">{member.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Message</Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={6}
                      className="bg-white border-gray-300 hover:border-gray-400 focus:border-purple-500 resize-none text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      This message will be sent directly to {member.name}'s email address.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {needsScroll && <div className="h-8"></div>}
          </div>

          {needsScroll && (
            <>
              {/* Scroll Indicator Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
            </>
          )}
        </div>

        {/* Footer - Always Visible */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50/80 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 h-9 text-sm"
            >
              {actionType === 'profile' ? 'Close' : 'Cancel'}
            </Button>
            
            {actionType === 'edit' && (
              <Button
                onClick={handleRoleUpdate}
                disabled={isSubmitting || newRole === member.role}
                className="px-6 h-9 bg-green-600 hover:bg-green-700 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Role'
                )}
              </Button>
            )}

            {actionType === 'remove' && (
              <Button
                onClick={handleRemoveMember}
                disabled={isSubmitting || confirmText !== member.name}
                className="px-6 h-9 bg-red-600 hover:bg-red-700 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove Member'
                )}
              </Button>
            )}

            {actionType === 'message' && (
              <Button
                onClick={handleSendMessage}
                disabled={isSubmitting || !message.trim()}
                className="px-6 h-9 bg-purple-600 hover:bg-purple-700 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            )}
          </div>

          {needsScroll && (
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
              <ChevronDown className="h-3 w-3 mr-1 animate-bounce" />
              Scroll up to see all options
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}