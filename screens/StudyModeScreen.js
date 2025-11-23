import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';

export default function StudyModeScreen({ navigation, route }) {
  const { studyPlan } = route.params;
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const timerRef = useRef(null);

  const currentTask = studyPlan.tasks[currentTaskIndex];
  const totalTasks = studyPlan.tasks.length;

  useEffect(() => {
    if (currentTask) {
      // Set initial time (duration in hours * 3600 seconds)
      setTimeRemaining(currentTask.duration * 3600);
    }
  }, [currentTaskIndex]);

  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (isBreak) {
              // Break finished, move to next task
              setIsBreak(false);
              setCurrentTaskIndex(prevIndex => prevIndex + 1);
            } else {
              // Task time finished
              handleTaskComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, timeRemaining, isBreak]);

  const handleTaskComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowFeedbackModal(true);
  };

  const handleFeedback = (wasEnough, needsMore) => {
    const feedback = {
      task: currentTask,
      wasTimeEnough: wasEnough,
      additionalTime: needsMore
    };
    
    setCompletedTasks([...completedTasks, feedback]);
    setShowFeedbackModal(false);

    // Move to next task or finish
    if (currentTaskIndex < totalTasks - 1) {
      // Start 5-minute break
      setIsBreak(true);
      setTimeRemaining(300); // 5 minutes in seconds
      setIsPaused(false); // Make sure timer runs during break
    } else {
      setSessionComplete(true);
    }
  };

  const handleSkipTask = () => {
    Alert.alert(
      'Skip Task?',
      'Are you sure you want to skip this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'destructive',
          onPress: () => {
            setCompletedTasks([...completedTasks, {
              task: currentTask,
              skipped: true
            }]);
            if (currentTaskIndex < totalTasks - 1) {
              setCurrentTaskIndex(currentTaskIndex + 1);
            } else {
              setSessionComplete(true);
            }
          }
        }
      ]
    );
  };

  const handleExtendTime = () => {
    Alert.alert(
      'Extend Time',
      'Add 15 more minutes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add 15 min',
          onPress: () => setTimeRemaining(prev => prev + 900)
        }
      ]
    );
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Study Session?',
      'Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            navigation.navigate('SessionReview', {
              completedTasks,
              studyPlan
            });
          }
        }
      ]
    );
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTaskIndex / totalTasks) * 100;

  if (sessionComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Study Session Complete!</Text>
          <Text style={styles.completeText}>
            You completed {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SessionReview', {
              completedTasks,
              studyPlan
            })}
          >
            <Text style={styles.buttonText}>Review Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isBreak) {
    return (
      <View style={styles.container}>
        <View style={styles.breakContainer}>
          <Text style={styles.breakEmoji}>☕</Text>
          <Text style={styles.breakTitle}>Break Time!</Text>
          <Text style={styles.breakText}>Take a 5-minute break</Text>
          <Text style={styles.breakTimer}>{formatTime(timeRemaining)}</Text>
          <Text style={styles.breakSubtext}>
            Next: {studyPlan.tasks[currentTaskIndex + 1]?.assignment}
          </Text>
          
          <TouchableOpacity
            style={styles.skipBreakButton}
            onPress={() => {
              setIsBreak(false);
              setCurrentTaskIndex(currentTaskIndex + 1);
            }}
          >
            <Text style={styles.skipBreakButtonText}>Skip Break →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEndSession}>
          <Text style={styles.endButton}>End Session</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Task {currentTaskIndex + 1} of {totalTasks}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        <View style={styles.timerSection}>
          <Text style={styles.timerLabel}>Time Remaining</Text>
          <Text style={[
            styles.timer,
            timeRemaining < 300 && styles.timerWarning
          ]}>
            {formatTime(timeRemaining)}
          </Text>
          
          <View style={styles.timerButtons}>
            <TouchableOpacity
              style={styles.timerButton}
              onPress={() => setIsPaused(!isPaused)}
            >
              <Text style={styles.timerButtonText}>
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.timerButton}
              onPress={handleExtendTime}
            >
              <Text style={styles.timerButtonText}>➕ Add 15 min</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.taskSection}>
          <View style={[
            styles.priorityBadge,
            currentTask.priority === 'High' && styles.priorityHigh,
            currentTask.priority === 'Medium' && styles.priorityMedium,
            currentTask.priority === 'Low' && styles.priorityLow
          ]}>
            <Text style={styles.priorityText}>{currentTask.priority} Priority</Text>
          </View>
          
          <Text style={styles.taskTitle}>{currentTask.assignment}</Text>
          <Text style={styles.taskTime}>{currentTask.timeBlock}</Text>
          
          {currentTask.tip && (
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>💡 {currentTask.tip}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('StudyChat', {
              currentTask: currentTask,
              studyPlan: studyPlan
            })}
          >
            <Text style={styles.chatButtonText}>💬 Ask AI About This Assignment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleTaskComplete}
          >
            <Text style={styles.completeButtonText}>✓ Mark Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipTask}
          >
            <Text style={styles.skipButtonText}>Skip Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Task Complete! 🎉</Text>
            <Text style={styles.modalQuestion}>
              Was {currentTask?.duration} hour{currentTask?.duration !== 1 ? 's' : ''} enough time?
            </Text>

            <TouchableOpacity
              style={[styles.feedbackButton, styles.feedbackYes]}
              onPress={() => handleFeedback(true, 0)}
            >
              <Text style={styles.feedbackButtonText}>✓ Perfect Amount</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.feedbackButton, styles.feedbackNo]}
              onPress={() => handleFeedback(false, 0.5)}
            >
              <Text style={styles.feedbackButtonText}>Needed 30 min more</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.feedbackButton, styles.feedbackNo]}
              onPress={() => handleFeedback(false, 1)}
            >
              <Text style={styles.feedbackButtonText}>Needed 1 hour more</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.feedbackButton, styles.feedbackTooMuch]}
              onPress={() => handleFeedback(true, -0.5)}
            >
              <Text style={styles.feedbackButtonText}>Had 30 min left over</Text>
            </TouchableOpacity>
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
    paddingBottom: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  endButton: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  progressText: {
    fontSize: 13,
    color: '#888',
  },
  content: {
    flex: 1,
  },
  timerSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  timerLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#10b981',
    fontVariant: ['tabular-nums'],
  },
  timerWarning: {
    color: '#f59e0b',
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  timerButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  taskSection: {
    padding: 20,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  priorityHigh: {
    backgroundColor: '#ef444420',
  },
  priorityMedium: {
    backgroundColor: '#f59e0b20',
  },
  priorityLow: {
    backgroundColor: '#10b98120',
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  taskTime: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  tipBox: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9333ea',
  },
  tipText: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
  },
  actionSection: {
    padding: 20,
    gap: 12,
  },
  chatButton: {
    backgroundColor: '#9333ea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
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
  modalQuestion: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 24,
    textAlign: 'center',
  },
  feedbackButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  feedbackYes: {
    backgroundColor: '#10b981',
  },
  feedbackNo: {
    backgroundColor: '#f59e0b',
  },
  feedbackTooMuch: {
    backgroundColor: '#4a9eff',
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  breakContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  breakEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  breakTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  breakText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 24,
  },
  breakTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 16,
  },
  breakSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  skipBreakButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  skipBreakButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  completeEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  completeText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 32,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});