"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Users, TrendingUp, AlertTriangle, DollarSign, BarChart3 } from "lucide-react";

export default function ManagerAIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Hello! I'm your AI assistant for team management. I can help you analyze team spending patterns, identify potential issues, and provide insights to optimize your team's expense management. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    {
      title: "Team spending analysis",
      description: "Get insights on team expense patterns",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: "Identify budget issues",
      description: "Find potential budget overruns",
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      title: "Team performance review",
      description: "Analyze individual team member spending",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Cost optimization",
      description: "Find ways to reduce team expenses",
      icon: <DollarSign className="h-5 w-5" />
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "ai",
        content: "I understand your question about " + inputMessage.toLowerCase() + ". Let me analyze your team's data and provide you with comprehensive insights. Based on your team's spending patterns, I can see some areas for optimization...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickAction = (action: string) => {
    const quickMessage = {
      id: messages.length + 1,
      type: "user",
      content: action,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, quickMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "ai",
        content: `I'll help you with ${action.toLowerCase()}. Let me analyze your team's data and provide you with actionable insights and recommendations...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team AI Assistant</h1>
        <p className="text-gray-600 mt-2">Get AI-powered insights for your team's expense management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>Chat with AI</span>
              </CardTitle>
              <CardDescription>Ask questions about your team's expenses and get instant insights</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your team's expenses..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common team management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleQuickAction(action.title)}
                >
                  <div className="flex items-center space-x-3">
                    {action.icon}
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Insights</CardTitle>
              <CardDescription>Current team status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Team Members</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Spending</span>
                  <span className="font-medium">$12,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Approvals</span>
                  <span className="font-medium text-yellow-600">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fraud Alerts</span>
                  <span className="font-medium text-red-600">2</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Capabilities</CardTitle>
              <CardDescription>What I can help you with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Team spending analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Budget optimization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Fraud detection alerts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Performance insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Cost reduction strategies</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}