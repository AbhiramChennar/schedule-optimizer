import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function HomeScreen({ navigation, assignments }) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Show first 3 upcoming assignments
  const upcomingAssignments = assignments.slice(0, 3);
  
  // Calculate total estimated time
  const totalTime = assignments.reduce((sum, a) => sum + (a.estimatedTime || 0), 0);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule Optimizer</Text>
        <Text style={styles.headerDate}>{today}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{assignments.length}</Text>
          <Text style={styles.statLabel}>Active Tasks</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalTime}h</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
      </View>

      {/* Upcoming Assignments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Assignments</Text>
        {upcomingAssignments.length > 0 ? (
          upcomingAssignments.map((assignment, index) => (
            <View key={index} style={styles.assignmentCard}>
              <Text style={styles.assignmentTitle}>{assignment.title}</Text>
              <Text style={styles.assignmentDetails}>
                {assignment.className} • Due {assignment.dueDate}
              </Text>
              <Text style={styles.assignmentTime}>
                Est. {assignment.estimatedTime}h
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            No assignments yet. Add one to get started!
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AddAssignment')}
        >
          <Text style={styles.buttonText}>+ Add Assignment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Text style={styles.buttonTextSecondary}>📅 View Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('AddClass')}
        >
          <Text style={styles.buttonTextSecondary}>+ Add Class</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('AssignmentList')}
        >
          <Text style={styles.buttonTextSecondary}>View All Assignments</Text>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a9eff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  assignmentCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  assignmentDetails: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  assignmentTime: {
    fontSize: 13,
    color: '#4a9eff',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#4a9eff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#4a9eff',
    fontSize: 16,
    fontWeight: '600',
  },
});