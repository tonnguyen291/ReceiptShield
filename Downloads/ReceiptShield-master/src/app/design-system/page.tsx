"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { 
  LoadingGrid, 
  LoadingTable, 
  LoadingList, 
  LoadingChart, 
  LoadingSpinner,
  LoadingButton,
  LoadingOverlay 
} from "@/components/ui/loading-states";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NoSSR } from "@/components/shared/no-ssr";
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Plus,
  BarChart3,
  Lightbulb,
  User,
  Settings,
  Bell
} from "lucide-react";

export default function DesignSystemPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display">Origin Design System</h1>
            <p className="text-caption">Comprehensive UI/UX components for ReceiptShield</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Typography */}
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Typography Hierarchy</CardTitle>
            <CardDescription>Origin-style text sizing and hierarchy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h1 className="text-display">Display Text</h1>
              <h2>Heading 2</h2>
              <h3>Heading 3</h3>
              <h4>Heading 4</h4>
              <h5>Heading 5</h5>
              <h6>Heading 6</h6>
              <p className="text-body">Body text with proper line height and spacing</p>
              <p className="text-caption">Caption text for secondary information</p>
              <p className="text-small">Small text for fine details</p>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Origin-style button variants and interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button className="origin-button">Primary Button</Button>
              <Button variant="outline" className="origin-button-secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Card Components</CardTitle>
            <CardDescription>Origin-style card layouts and interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="data-card">
                <CardHeader>
                  <CardTitle className="text-sm">Data Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="data-summary">$2,847.50</div>
                  <p className="data-subtitle">Total Amount</p>
                </CardContent>
              </Card>
              
              <Card className="origin-card origin-card-hover">
                <CardHeader>
                  <CardTitle className="text-sm">Hover Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Hover to see interaction</p>
                </CardContent>
              </Card>

              <Card className="origin-card">
                <CardHeader>
                  <CardTitle className="text-sm">Standard Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Basic card layout</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Comprehensive loading components and animations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Loading Spinners</h4>
              <div className="flex items-center gap-4">
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Loading Grid</h4>
              <NoSSR>
                <LoadingGrid count={3} />
              </NoSSR>
            </div>

            <div>
              <h4 className="font-medium mb-4">Loading Table</h4>
              <NoSSR>
                <LoadingTable rows={3} columns={4} />
              </NoSSR>
            </div>

            <div>
              <h4 className="font-medium mb-4">Loading List</h4>
              <NoSSR>
                <LoadingList items={3} />
              </NoSSR>
            </div>

            <div>
              <h4 className="font-medium mb-4">Loading Chart</h4>
              <NoSSR>
                <LoadingChart />
              </NoSSR>
            </div>

            <div>
              <h4 className="font-medium mb-4">Loading Button</h4>
              <LoadingButton loading={isLoading}>
                <Button onClick={() => setIsLoading(!isLoading)}>
                  Toggle Loading
                </Button>
              </LoadingButton>
            </div>

            <div>
              <h4 className="font-medium mb-4">Loading Overlay</h4>
              <div className="relative h-32 bg-muted rounded-lg">
                <LoadingOverlay 
                  loading={showOverlay} 
                  message="Processing data..."
                >
                  <div className="p-4">
                    <p>Content behind overlay</p>
                    <Button onClick={() => setShowOverlay(!showOverlay)}>
                      Toggle Overlay
                    </Button>
                  </div>
                </LoadingOverlay>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty States */}
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Empty States</CardTitle>
            <CardDescription>User-friendly empty state components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <EmptyState
              icon={FileText}
              title="No Receipts Found"
              description="Upload your first receipt to get started with expense tracking"
              buttonText="Upload Receipt"
              buttonLink="/upload"
            />
            
            <EmptyState
              icon={BarChart3}
              title="No Analytics Data"
              description="Submit some receipts to see your spending insights"
            />
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Origin-style form inputs and controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  className="origin-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="0.00"
                  className="origin-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Micro-interactions */}
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Micro-interactions</CardTitle>
            <CardDescription>Subtle animations and hover effects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button className="micro-interaction">Hover Me</Button>
              <Button variant="outline" className="micro-interaction">Scale Effect</Button>
              <div className="p-4 rounded-lg bg-muted/50 micro-interaction cursor-pointer">
                <p className="text-sm">Hover for scale effect</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Visualization */}
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
            <CardDescription>Charts and data display components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="data-card">
                  <div className="data-summary">$2,847.50</div>
                  <div className="data-subtitle">Total Expenses</div>
                </div>
                <div className="data-card">
                  <div className="data-summary">24</div>
                  <div className="data-subtitle">Receipts Submitted</div>
                </div>
              </div>
              <div className="space-y-4">
                <LoadingChart />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Examples */}
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Navigation Components</CardTitle>
            <CardDescription>Navigation patterns and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
