import { MoreHorizontal, Eye, Edit, Trash2, Filter, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const projectData = [
  {
    id: "PRJ-001",
    name: "Website Redesign",
    client: "Acme Corp",
    status: "In Progress",
    priority: "High",
    assignee: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2d33b33?w=32&h=32&fit=crop&crop=face",
      initials: "SJ"
    },
    dueDate: "2025-08-15",
    budget: "$25,000",
    progress: 75
  },
  {
    id: "PRJ-002", 
    name: "Mobile App Development",
    client: "TechStart Inc",
    status: "Planning",
    priority: "Medium",
    assignee: {
      name: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
      initials: "MC"
    },
    dueDate: "2025-09-30",
    budget: "$45,000",
    progress: 20
  },
  {
    id: "PRJ-003",
    name: "E-commerce Platform",
    client: "RetailMax",
    status: "Review",
    priority: "High",
    assignee: {
      name: "Emily Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
      initials: "ED"
    },
    dueDate: "2025-08-05",
    budget: "$60,000",
    progress: 90
  },
  {
    id: "PRJ-004",
    name: "Brand Identity",
    client: "Creative Studios",
    status: "Completed",
    priority: "Low",
    assignee: {
      name: "James Wilson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      initials: "JW"
    },
    dueDate: "2025-07-20",
    budget: "$15,000",
    progress: 100
  },
  {
    id: "PRJ-005",
    name: "Data Analytics Dashboard",
    client: "DataFlow Corp",
    status: "In Progress",
    priority: "High",
    assignee: {
      name: "Lisa Rodriguez",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face",
      initials: "LR"
    },
    dueDate: "2025-08-25",
    budget: "$35,000",
    progress: 45
  },
  {
    id: "PRJ-006",
    name: "Cloud Migration",
    client: "Enterprise Solutions",
    status: "Planning",
    priority: "Medium",
    assignee: {
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
      initials: "DK"
    },
    dueDate: "2025-10-15",
    budget: "$80,000",
    progress: 15
  }
];

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'planning':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function DataTable() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Recent Projects</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Manage and track your project progress</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Project ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectData.map((project) => (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-blue-600">{project.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{project.client}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={project.assignee.avatar} />
                          <AvatarFallback className="text-xs">{project.assignee.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-900">{project.assignee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(project.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{project.budget}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}