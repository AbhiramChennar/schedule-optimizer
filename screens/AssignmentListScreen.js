import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { markAssignmentComplete } from '../database/db';

export default function AssignmentListScreen({ navigation, assignments, refreshData }) {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [actualTime, setActualTime] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Sort assignments by due date
  const sortedAssignments = [...assignments].sort((a, b) => {
    return a.dueDate.localeCompare(b.dueDate);
  });

  const handleCompletePress = (assignment) => {
    setSelectedAssignment(assignment);
    setActualTime(assignment.estimatedTime.toString());
    setModalVisible(true);
  };

  const handleConfirmComplete = async () => {
    if (!actualTime || parseFloat(actualTime) <= 0) {
      Alert.alert('Error', 'Please enter a valid time');
      return;
    }

    try {
      await markAssignmentComplete(selectedAssignment.id, parseFloat(actualTime));
      await refreshData();
      
      const estimated = selectedAssignment.estimatedTime;
      const actual = parseFloat(actualTime);
      const diff = Math.abs(estimated - actual);
      const accuracy = diff <= 0.5 ? 'spot on' : estimated > actual ? 'overestimated' : 'underestimated';
      
      Alert.alert(
        'Assignment Completed! 🎉',
        `Estimated: ${estimated}h\nActual: ${actual}h\n\nAI was ${accuracy}! This helps improve future estimates.`
      );
      
      setModalVisible(false);
      setSelectedAssignment(null);
      setActualTime('');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete assignment');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
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
      <ScrollView style={styles.scrollView}>
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
                  
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={() => handleCompletePress(assignment)}
                  >
                    <Text style={styles.completeButtonText}>✓ Complete</Text>
                  </TouchableOpacity>
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

      {/* Complete Assignment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Assignment</Text>
            
            {selectedAssignment && (
              <>
                <Text style={styles.modalAssignmentTitle}>{selectedAssignment.title}</Text>
                
                <View style={styles.estimateBox}>
                  <Text style={styles.estimateLabel}>AI Estimated:</Text>
                  <Text style={styles.estimateValue}>{selectedAssignment.estimatedTime} hours</Text>
                </View>

                <Text style={styles.inputLabel}>How long did it actually take?</Text>
                <TextInput
                  style={styles.timeInput}
                  value={actualTime}
                  onChangeText={setActualTime}
                  placeholder="Enter hours"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                />

                <Text style={styles.helpText}>
                  This helps the AI learn and improve future estimates!
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={handleConfirmComplete}
                  >
                    <Text style={styles.confirmButtonText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  scrollView: {
    flex: 1,
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
  completeButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  modalAssignmentTitle: {
    fontSize: 18,
    color: '#4a9eff',
    marginBottom: 16,
  },
  estimateBox: {
    backgroundColor: '#0a0a0a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  estimateLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: '#fff',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});