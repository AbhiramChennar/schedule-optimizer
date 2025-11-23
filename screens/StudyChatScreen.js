import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { chatWithAI } from '../services/aiService';
import FormattedMessage from '../components/FormattedMessage';

export default function StudyChatScreen({ navigation, route }) {
  const { currentTask, studyPlan } = route.params;
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `I'm here to help you with **${currentTask.assignment}**!\n\nYou have ${currentTask.duration} hour${currentTask.duration !== 1 ? 's' : ''} allocated for this task. Feel free to ask me anything about this assignment!`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build enhanced context about the current task
      const context = {
        currentTask: {
          assignment: currentTask.assignment,
          duration: currentTask.duration,
          priority: currentTask.priority,
          tip: currentTask.tip,
          timeBlock: currentTask.timeBlock
        },
        studyPlan: {
          totalTime: studyPlan.totalPlannedTime,
          taskCount: studyPlan.tasks.length
        }
      };

      // Enhanced system message for context-aware chat
      const enhancedContext = {
        ...context,
        systemMessage: `You are helping a student who is currently working on: "${currentTask.assignment}". They have ${currentTask.duration} hour(s) allocated for this task (${currentTask.timeBlock}). Priority: ${currentTask.priority}. ${currentTask.tip ? `Tip for this task: ${currentTask.tip}` : ''} Focus your help specifically on this assignment. Be concise but helpful.

CRITICAL - MATH FORMATTING:
- ALWAYS use LaTeX for ALL mathematical expressions
- Inline math: $x^2$ NOT "x^2"
- Display equations: $\\frac{a}{b}$ 
- Fractions: $\\frac{5}{4}$ NOT "5/4"
- Square roots: $\\sqrt{16}$ NOT "√16"
- NEVER write formulas as plain text`
      };

      const response = await chatWithAI(
        inputText.trim(),
        null,
        messages.slice(-5),
        enhancedContext
      );

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back to Study</Text>
        </TouchableOpacity>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{currentTask.assignment}</Text>
          <Text style={styles.taskTime}>{currentTask.duration}h • {currentTask.timeBlock}</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userMessage : styles.aiMessage
            ]}
          >
            <FormattedMessage 
              content={message.content}
              isUser={message.role === 'user'}
            />
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        
        {isLoading && (
          <View style={[styles.messageBubble, styles.aiMessage]}>
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Questions */}
      <View style={styles.quickQuestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.quickQuestion}
            onPress={() => setInputText("How do I get started with this?")}
          >
            <Text style={styles.quickQuestionText}>🚀 How to start?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickQuestion}
            onPress={() => setInputText("Break this down into steps")}
          >
            <Text style={styles.quickQuestionText}>📝 Break it down</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickQuestion}
            onPress={() => setInputText("Give me an example")}
          >
            <Text style={styles.quickQuestionText}>💡 Example please</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickQuestion}
            onPress={() => setInputText("I'm stuck, help!")}
          >
            <Text style={styles.quickQuestionText}>🆘 I'm stuck</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about this assignment..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
        />

        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    fontSize: 16,
    color: '#4a9eff',
    marginBottom: 12,
  },
  taskInfo: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9333ea',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 13,
    color: '#888',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4a9eff',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  messageTime: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  quickQuestion: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickQuestionText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a9eff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});