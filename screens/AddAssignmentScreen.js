import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';

export default function AddAssignmentScreen({ navigation, classes, assignments, setAssignments }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('2');

  const handleAddAssignment = () => {
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

    // Create new assignment object
    const newAssignment = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      className: selectedClass,
      dueDate: dueDate.trim(),
      estimatedTime: parseFloat(estimatedTime) || 2,
      createdAt: new Date().toISOString()
    };

    // Add to assignments list
    setAssignments([...assignments, newAssignment]);

    // Clear form
    setTitle('');
    setDescription('');
    setSelectedClass('');
    setDueDate('');
    setEstimatedTime('2');

    // Go back to home
    navigation.goBack();
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
        />

        <Text style={styles.label}>Description (AI will analyze this later)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Paste assignment details here... Complete problems 1-25, show all work, include graphs"
          placeholderTextColor="#666"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
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

        <Text style={styles.label}>Due Date</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="e.g., Nov 15 or Friday"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Estimated Time (hours)</Text>
        <TextInput
          style={styles.input}
          value={estimatedTime}
          onChangeText={setEstimatedTime}
          placeholder="2"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />

        <Text style={styles.hint}>
          💡 Tip: AI will eventually estimate this automatically from your description
        </Text>

        <TouchableOpacity 
          style={[styles.primaryButton, classes.length === 0 && styles.buttonDisabled]}
          onPress={handleAddAssignment}
          disabled={classes.length === 0}
        >
          <Text style={styles.buttonText}>Add Assignment</Text>
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
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
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