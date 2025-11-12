import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function AssignmentListScreen({ navigation, assignments }) {
  // Sort assignments by due date (you'll improve this later)
  const sortedAssignments = [...assignments].sort((a, b) => {
    // Simple sorting - improve this when you add proper date handling
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Assignments</Text>
        <Text style={styles.headerSubtitle}>
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Assignments List */}
      <View style={styles.section}>
        {sortedAssignments.length > 0 ? (
          sortedAssignments.map((assignment) => (
            <View key={assignment.id} style={styles.assignmentCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                <View style={styles.timeChip}>
                  <Text style={styles.timeChipText}>{assignment.estimatedTime}h</Text>
                </View>
              </View>
              
              <Text style={styles.assignmentClass}>{assignment.className}</Text>
              
              {assignment.description ? (
                <Text style={styles.assignmentDescription} numberOfLines={2}>
                  {assignment.description}
                </Text>
              ) : null}
              
              <View style={styles.cardFooter}>
                <Text style={styles.dueDate}>Due: {assignment.dueDate}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No assignments yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first assignment to get started
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddAssignment')}
            >
              <Text style={styles.addButtonText}>+ Add Assignment</Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  assignmentCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  timeChip: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeChipText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  assignmentClass: {
    fontSize: 14,
    color: '#4a9eff',
    marginBottom: 8,
  },
  assignmentDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  dueDate: {
    fontSize: 13,
    color: '#aaa',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});