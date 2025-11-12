import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

export default function AddClassScreen({ navigation, classes, setClasses }) {
  const [className, setClassName] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');

  const handleAddClass = () => {
    if (className.trim()) {
      // Add new class to the list
      const newClass = {
        name: className,
        difficulty: difficulty,
        id: Date.now() // Simple unique ID
      };
      
      setClasses([...classes, newClass]);
      
      // Clear form and go back
      setClassName('');
      setDifficulty('Medium');
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Class</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Class Name</Text>
        <TextInput
          style={styles.input}
          value={className}
          onChangeText={setClassName}
          placeholder="e.g., AP Calculus BC"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Difficulty Level</Text>
        <View style={styles.difficultyContainer}>
          {['Easy', 'Medium', 'Hard'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.difficultyButton,
                difficulty === level && styles.difficultyButtonActive
              ]}
              onPress={() => setDifficulty(level)}
            >
              <Text style={[
                styles.difficultyText,
                difficulty === level && styles.difficultyTextActive
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleAddClass}
        >
          <Text style={styles.buttonText}>Add Class</Text>
        </TouchableOpacity>
      </View>

      {/* List of existing classes */}
      {classes.length > 0 && (
        <View style={styles.classList}>
          <Text style={styles.sectionTitle}>Your Classes</Text>
          {classes.map((cls) => (
            <View key={cls.id} style={styles.classCard}>
              <Text style={styles.className}>{cls.name}</Text>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyBadgeText}>{cls.difficulty}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  difficultyContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  difficultyButtonActive: {
    backgroundColor: '#4a9eff',
    borderColor: '#4a9eff',
  },
  difficultyText: {
    color: '#888',
    fontSize: 14,
  },
  difficultyTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#4a9eff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  classList: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  classCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  className: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  difficultyBadge: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});