import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { addAssignment } from '../database/db';
import { getAccuracyStats } from '../database/db';
import { analyzeAssignment } from '../services/aiService';

export default function AddAssignmentScreen({ navigation, classes, refreshData }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('2');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const handleAnalyzeWithAI = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an assignment title first');
      return;
    }
    if (!selectedClass) {
      Alert.alert('Error', 'Please select a class first');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Get the class difficulty
      const classObj = classes.find(c => c.name === selectedClass);
      const classDifficulty = classObj?.difficulty || 'Medium';

      // Call AI to analyze
      const analysis = await analyzeAssignment(
        title,
        description,
        selectedClass,
        classDifficulty
      );

      if (analysis.success) {
        // Auto-fill estimated time
        setEstimatedTime(analysis.estimatedTime.toString());
        setAiAnalysis(analysis);
        
        Alert.alert(
          'AI Analysis Complete',
          `Estimated Time: ${analysis.estimatedTime} hours\nDifficulty: ${analysis.difficulty}\n\n${analysis.reasoning}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('AI Analysis Failed', 'Using default estimates. You can still add the assignment manually.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze assignment. Please enter time manually.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddAssignment = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an assignment title');
      return;
    }
    if (!selectedClass) {
      Alert.alert('Error', 'Please select a class');
      return;
    }
    if (!dueDate.trim()) {
      Alert.alert('Error', 'Please enter a due date');
      return;
    }

    setIsSaving(true);
    try {
      // Create assignment object
      const newAssignment = {
        title: title.trim(),
        description: description.trim(),
        className: selectedClass,
        dueDate: dueDate.trim(),
        estimatedTime: parseFloat(estimatedTime) || 2,
      };

      // Save to database
      await addAssignment(newAssignment);
      
      // Refresh data from database
      await refreshData();

      // Clear form and go back
      setTitle('');
      setDescription('');
      setSelectedClass('');
      setDueDate('');
      setEstimatedTime('2');
      setAiAnalysis(null);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add assignment. Please try again.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Assignment</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Assignment Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Chapter 5 Problem Set"
          placeholderTextColor="#666"
          editable={!isSaving && !isAnalyzing}
        />

        <Text style={styles.label}>Description (AI will analyze this)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Paste assignment details here... Complete problems 1-25, show all work, include graphs"
          placeholderTextColor="#666"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          editable={!isSaving && !isAnalyzing}
        />

        <Text style={styles.label}>Class</Text>
        {classes.length > 0 ? (
          <View style={styles.classSelector}>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={[
                  styles.classOption,
                  selectedClass === cls.name && styles.classOptionActive
                ]}
                onPress={() => setSelectedClass(cls.name)}
                disabled={isSaving || isAnalyzing}
              >
                <Text style={[
                  styles.classOptionText,
                  selectedClass === cls.name && styles.classOptionTextActive
                ]}>
                  {cls.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              No classes added yet. Add a class first!
            </Text>
            <TouchableOpacity 
              style={styles.warningButton}
              onPress={() => navigation.navigate('AddClass')}
            >
              <Text style={styles.warningButtonText}>Add Class</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Analysis Button */}
        <TouchableOpacity 
          style={[styles.aiButton, (isAnalyzing || !title || !selectedClass) && styles.buttonDisabled]}
          onPress={handleAnalyzeWithAI}
          disabled={isAnalyzing || !title || !selectedClass}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.aiButtonIcon}>✨</Text>
              <Text style={styles.aiButtonText}>Analyze with AI</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Show AI Analysis Results */}
        {aiAnalysis && aiAnalysis.success && (
          <View style={styles.aiResultBox}>
            <Text style={styles.aiResultTitle}>AI Analysis:</Text>
            <Text style={styles.aiResultText}>• Estimated: {aiAnalysis.estimatedTime} hours</Text>
            <Text style={styles.aiResultText}>• Difficulty: {aiAnalysis.difficulty}</Text>
            {aiAnalysis.keyTasks && aiAnalysis.keyTasks.length > 0 && (
              <>
                <Text style={styles.aiResultText}>• Key tasks:</Text>
                {aiAnalysis.keyTasks.map((task, i) => (
                  <Text key={i} style={styles.aiTaskText}>  - {task}</Text>
                ))}
              </>
            )}
          </View>
        )}

        <Text style={styles.label}>Due Date</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="e.g., Nov 15 or Friday"
          placeholderTextColor="#666"
          editable={!isSaving && !isAnalyzing}
        />

        <Text style={styles.label}>Estimated Time (hours)</Text>
        <TextInput
          style={styles.input}
          value={estimatedTime}
          onChangeText={setEstimatedTime}
          placeholder="2"
          placeholderTextColor="#666"
          keyboardType="numeric"
          editable={!isSaving && !isAnalyzing}
        />

        <TouchableOpacity 
          style={[styles.primaryButton, (classes.length === 0 || isSaving || isAnalyzing) && styles.buttonDisabled]}
          onPress={handleAddAssignment}
          disabled={classes.length === 0 || isSaving || isAnalyzing}
        >
          <Text style={styles.buttonText}>
            {isSaving ? 'Saving...' : 'Add Assignment'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingBottom: 20,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    fontSize: 16,
    color: '#4a9eff',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  classSelector: {
    gap: 8,
  },
  classOption: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  classOptionActive: {
    backgroundColor: '#4a9eff',
    borderColor: '#4a9eff',
  },
  classOptionText: {
    color: '#888',
    fontSize: 15,
  },
  classOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#2a1a0a',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a3020',
  },
  warningText: {
    color: '#ff9944',
    fontSize: 14,
    marginBottom: 10,
  },
  warningButton: {
    backgroundColor: '#ff9944',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  warningButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  aiButton: {
    backgroundColor: '#9333ea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  aiButtonIcon: {
    fontSize: 20,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aiResultBox: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#9333ea',
  },
  aiResultTitle: {
    color: '#9333ea',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  aiResultText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  aiTaskText: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 2,
  },
  primaryButton: {
    backgroundColor: '#4a9eff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});