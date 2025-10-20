"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, MessageCircle, Lightbulb, TrendingUp, DollarSign } from "lucide-react";

export default function EmployeeAIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Hello! I'm your AI assistant. I can help you with expense management, budget optimization, and answer questions about your receipts. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    {
      title: "Analyze my spending",
      description: "Get insights on your expense patterns",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      title: "Budget optimization",
      description: "Find ways to save money",
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      title: "Receipt help",
      description: "Get help with receipt submission",
      icon: <MessageCircle className="h-5 w-5" />
    },
    {
      title: "Smart tips",
      description: "Get personalized recommendations",
      icon: <Lightbulb className="h-5 w-5" />
    }
  ];

  const generateAIResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("spending") || message.includes("expense")) {
      return "Based on your spending data, I can see you've spent $2,450 this month. Your top category is Meals (49%), followed by Transportation (24%). I recommend setting up budget alerts for your highest spending categories to help manage your expenses better.";
    }
    
    if (message.includes("budget") || message.includes("limit")) {
      return "Your current budget status: Meals (75% used), Transportation (64% used), Office Supplies (93% used - approaching limit!). I suggest reviewing your Office Supplies spending and consider bulk purchasing to stay within budget.";
    }
    
    if (message.includes("receipt") || message.includes("submit")) {
      return "To submit a receipt, go to the Submit Receipt page and upload a clear photo. Make sure the receipt shows the vendor name, date, amount, and items purchased. The system will automatically categorize it for you.";
    }
    
    if (message.includes("save") || message.includes("optimize")) {
      return "Here are some savings opportunities I found: 1) Switch to bulk office supplies (save 15%), 2) Use company cafeteria for meals (save $200/month), 3) Consider monthly transit passes for regular commutes. Would you like me to set up alerts for these categories?";
    }
    
    if (message.includes("help") || message.includes("how")) {
      return "I can help you with: expense analysis, budget optimization, receipt submission guidance, spending pattern insights, and fraud detection alerts. What specific area would you like assistance with?";
    }
    
    return "I understand your question about " + userMessage + ". Let me analyze your expense data and provide personalized insights. Based on your spending patterns, I can see some opportunities for optimization. Would you like me to dive deeper into any specific area?";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    // Generate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "ai",
        content: generateAIResponse(currentInput),
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
        content: `I'll help you with ${action.toLowerCase()}. Let me analyze your data and provide you with actionable insights...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-gray-600 mt-2">Get personalized help with your expense management</p>
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
              <CardDescription>Ask questions about your expenses and get instant help</CardDescription>
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
                  placeholder="Ask me anything about your expenses..."
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
              <CardDescription>Common tasks and questions</CardDescription>
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
              <CardTitle>AI Capabilities</CardTitle>
              <CardDescription>What I can help you with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Expense analysis and insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Budget optimization suggestions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Receipt categorization help</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Spending pattern analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Fraud detection alerts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}