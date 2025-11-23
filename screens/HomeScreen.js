import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput } from 'react-native';
import { generateTodayStudyPlan } from '../services/aiService';

export default function HomeScreen({ navigation, assignments }) {
  const [studyPlan, setStudyPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [availableHours, setAvailableHours] = useState('3');

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  // Show first 3 upcoming assignments
  const upcomingAssignments = assignments.slice(0, 3);
  
  // Calculate total estimated time
  const totalTime = assignments.reduce((sum, a) => sum + (a.estimatedTime || 0), 0);

  const handleGeneratePlan = () => {
    if (assignments.length === 0) {
      return;
    }
    setModalVisible(true);
  };

  const generatePlan = async () => {
    const hours = parseFloat(availableHours);
    if (isNaN(hours) || hours <= 0 || hours > 12) {
      alert('Please enter a valid number of hours (1-12)');
      return;
    }

    setModalVisible(false);
    setLoadingPlan(true);
    try {
      const plan = await generateTodayStudyPlan(assignments, hours);
      setStudyPlan(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setLoadingPlan(false);
    }
  };

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

      {/* AI Study Plan Section */}
      {assignments.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ Today's AI Study Plan</Text>
            {studyPlan && (
              <TouchableOpacity onPress={handleGeneratePlan} disabled={loadingPlan}>
                <Text style={styles.refreshButton}>
                  {loadingPlan ? '...' : '↻'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingPlan ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9333ea" />
              <Text style={styles.loadingText}>Generating your personalized plan...</Text>
            </View>
          ) : studyPlan?.hasPlan ? (
            <View style={styles.studyPlanCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planTime}>
                  📚 {studyPlan.totalPlannedTime}h planned
                </Text>
              </View>

              {studyPlan.tasks?.map((task, index) => (
                <View key={index} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={styles.taskPriority}>
                      <Text style={[
                        styles.priorityDot,
                        task.priority === 'High' && styles.priorityHigh,
                        task.priority === 'Medium' && styles.priorityMedium,
                        task.priority === 'Low' && styles.priorityLow,
                      ]}>●</Text>
                      <Text style={styles.taskTitle}>{task.assignment}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.taskTime}>🕐 {task.timeBlock}</Text>
                  <Text style={styles.taskDuration}>Duration: {task.duration}h</Text>
                  
                  {task.tip && (
                    <View style={styles.tipBox}>
                      <Text style={styles.tipText}>💡 {task.tip}</Text>
                    </View>
                  )}
                </View>
              ))}

              {studyPlan.motivationalMessage && (
                <View style={styles.motivationBox}>
                  <Text style={styles.motivationText}>
                    {studyPlan.motivationalMessage}
                  </Text>
                </View>
              )}

              {studyPlan.breakReminder && (
                <Text style={styles.breakReminder}>
                  ☕ {studyPlan.breakReminder}
                </Text>
              )}

              <TouchableOpacity
                style={styles.startStudyButton}
                onPress={() => navigation.navigate('StudyMode', { studyPlan })}
              >
                <Text style={styles.startStudyButtonText}>▶️ Start Studying</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noPlanBox}>
              <Text style={styles.noPlanIcon}>🎯</Text>
              <Text style={styles.noPlanTitle}>Ready to plan your study session?</Text>
              <Text style={styles.noPlanText}>
                Tell us how much time you have and we'll create a personalized plan
              </Text>
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={handleGeneratePlan}
              >
                <Text style={styles.generateButtonText}>✨ Generate Study Plan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

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
          style={styles.chatButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.chatButtonEmoji}>🤖</Text>
          <Text style={styles.chatButtonText}>AI Study Buddy</Text>
          <Text style={styles.chatButtonSubtext}>Ask me anything or send homework pics</Text>
        </TouchableOpacity>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.secondaryButton, styles.halfButton]}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Text style={styles.buttonTextSecondary}>📅 Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, styles.halfButton]}
            onPress={() => navigation.navigate('Stats')}
          >
            <Text style={styles.buttonTextSecondary}>📊 AI Stats</Text>
          </TouchableOpacity>
        </View>

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

      {/* Time Input Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How much time do you have?</Text>
            <Text style={styles.modalSubtitle}>
              We'll create a realistic study plan based on your available time
            </Text>

            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                value={availableHours}
                onChangeText={setAvailableHours}
                placeholder="3"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                autoFocus
              />
              <Text style={styles.timeLabel}>hours</Text>
            </View>

            <Text style={styles.modalHint}>
              💡 Be realistic! Quality study time is better than long hours
            </Text>

            <View style={styles.quickOptions}>
              <Text style={styles.quickOptionsLabel}>Quick select:</Text>
              <View style={styles.quickOptionsButtons}>
                {['1', '2', '3', '4'].map(hours => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.quickOptionButton,
                      availableHours === hours && styles.quickOptionButtonActive
                    ]}
                    onPress={() => setAvailableHours(hours)}
                  >
                    <Text style={[
                      styles.quickOptionText,
                      availableHours === hours && styles.quickOptionTextActive
                    ]}>
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={generatePlan}
              >
                <Text style={styles.confirmButtonText}>Generate Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  refreshButton: {
    fontSize: 24,
    color: '#9333ea',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
    fontSize: 14,
  },
  studyPlanCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#9333ea',
  },
  planHeader: {
    marginBottom: 16,
  },
  planTime: {
    fontSize: 16,
    color: '#9333ea',
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#0a0a0a',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  taskHeader: {
    marginBottom: 8,
  },
  taskPriority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityDot: {
    fontSize: 20,
  },
  priorityHigh: {
    color: '#ef4444',
  },
  priorityMedium: {
    color: '#f59e0b',
  },
  priorityLow: {
    color: '#10b981',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  taskTime: {
    fontSize: 14,
    color: '#9333ea',
    marginBottom: 4,
  },
  taskDuration: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  tipBox: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9333ea',
  },
  tipText: {
    fontSize: 12,
    color: '#aaa',
    lineHeight: 16,
  },
  motivationBox: {
    backgroundColor: '#1a2e1a',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  motivationText: {
    fontSize: 14,
    color: '#10b981',
    textAlign: 'center',
    fontWeight: '500',
  },
  breakReminder: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  startStudyButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#14f195',
  },
  startStudyButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  noPlanBox: {
    backgroundColor: '#1a1a1a',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  noPlanIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  noPlanText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  generateButton: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#4a9eff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatButton: {
    backgroundColor: '#9333ea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  chatButtonEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  chatButtonSubtext: {
    color: '#e9d5ff',
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  timeInput: {
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: '#9333ea',
    borderRadius: 12,
    padding: 16,
    fontSize: 32,
    color: '#fff',
    width: 100,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  timeLabel: {
    fontSize: 20,
    color: '#888',
    marginLeft: 12,
  },
  modalHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  quickOptions: {
    marginBottom: 24,
  },
  quickOptionsLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  quickOptionsButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickOptionButton: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  quickOptionButtonActive: {
    backgroundColor: '#9333ea',
    borderColor: '#9333ea',
  },
  quickOptionText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  quickOptionTextActive: {
    color: '#fff',
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
    backgroundColor: '#9333ea',
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