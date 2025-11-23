import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function SessionReviewScreen({ navigation, route }) {
  const { completedTasks, studyPlan } = route.params;
  const [methodRating, setMethodRating] = useState(null);
  const [preferences, setPreferences] = useState([]);

  const handleSubmitFeedback = async () => {
    if (!methodRating) {
      Alert.alert('Rate the method', 'Please rate how well the time blocking worked for you');
      return;
    }

    // Here we'll save feedback to database for AI learning
    const feedback = {
      studyPlan,
      completedTasks,
      methodRating,
      preferences,
      timestamp: new Date().toISOString()
    };

    // TODO: Save to database for AI learning
    console.log('Session feedback:', feedback);

    Alert.alert(
      'Feedback Saved! 🎉',
      'The AI will use this to improve future study plans',
      [
        {
          text: 'Done',
          onPress: () => navigation.navigate('Home')
        }
      ]
    );
  };

  const togglePreference = (pref) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter(p => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const totalPlanned = studyPlan.totalPlannedTime;
  const totalActual = completedTasks.reduce((sum, task) => {
    if (task.skipped) return sum;
    return sum + task.task.duration + (task.additionalTime || 0);
  }, 0);

  const completedCount = completedTasks.filter(t => !t.skipped).length;
  const skippedCount = completedTasks.filter(t => t.skipped).length;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📊</Text>
        <Text style={styles.headerTitle}>Session Review</Text>
        <Text style={styles.headerSubtitle}>Help the AI learn your preferences</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Summary</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          {skippedCount > 0 && (
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, styles.statWarning]}>{skippedCount}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
          )}
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalActual.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>

        {Math.abs(totalActual - totalPlanned) > 0.5 && (
          <View style={styles.deltaCard}>
            <Text style={styles.deltaText}>
              {totalActual > totalPlanned 
                ? `Took ${(totalActual - totalPlanned).toFixed(1)}h longer than planned`
                : `Finished ${(totalPlanned - totalActual).toFixed(1)}h earlier than planned`
              }
            </Text>
          </View>
        )}
      </View>

      {/* Task Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task Breakdown</Text>
        
        {completedTasks.map((taskData, index) => (
          <View key={index} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{taskData.task.assignment}</Text>
              {taskData.skipped ? (
                <View style={styles.skippedBadge}>
                  <Text style={styles.skippedText}>Skipped</Text>
                </View>
              ) : taskData.wasTimeEnough ? (
                <View style={styles.goodBadge}>
                  <Text style={styles.goodText}>✓</Text>
                </View>
              ) : (
                <View style={styles.warningBadge}>
                  <Text style={styles.warningText}>Needed more time</Text>
                </View>
              )}
            </View>

            {!taskData.skipped && (
              <View style={styles.taskStats}>
                <Text style={styles.taskStat}>
                  Planned: {taskData.task.duration}h
                </Text>
                {taskData.additionalTime !== 0 && (
                  <Text style={styles.taskStat}>
                    Actual: {(taskData.task.duration + taskData.additionalTime).toFixed(1)}h
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Method Rating */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How was the time blocking method?</Text>
        <Text style={styles.sectionSubtitle}>Rate how well the schedule structure worked</Text>
        
        <View style={styles.ratingButtons}>
          {[
            { value: 5, emoji: '😍', label: 'Perfect' },
            { value: 4, emoji: '😊', label: 'Good' },
            { value: 3, emoji: '😐', label: 'OK' },
            { value: 2, emoji: '😕', label: 'Not great' },
            { value: 1, emoji: '😞', label: 'Poor' }
          ].map(rating => (
            <TouchableOpacity
              key={rating.value}
              style={[
                styles.ratingButton,
                methodRating === rating.value && styles.ratingButtonActive
              ]}
              onPress={() => setMethodRating(rating.value)}
            >
              <Text style={styles.ratingEmoji}>{rating.emoji}</Text>
              <Text style={[
                styles.ratingLabel,
                methodRating === rating.value && styles.ratingLabelActive
              ]}>
                {rating.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What would you prefer next time?</Text>
        <Text style={styles.sectionSubtitle}>Select all that apply</Text>
        
        <View style={styles.preferencesGrid}>
          {[
            { id: 'shorter_blocks', label: '⏱️ Shorter time blocks', desc: '30-45 min sessions' },
            { id: 'longer_blocks', label: '⏰ Longer time blocks', desc: '1.5-2 hour sessions' },
            { id: 'more_breaks', label: '☕ More frequent breaks', desc: 'Break after each task' },
            { id: 'fewer_breaks', label: '⚡ Fewer breaks', desc: 'Work through momentum' },
            { id: 'hardest_first', label: '🔥 Hardest tasks first', desc: 'Tackle difficult work early' },
            { id: 'easiest_first', label: '✨ Easiest tasks first', desc: 'Build momentum gradually' },
          ].map(pref => (
            <TouchableOpacity
              key={pref.id}
              style={[
                styles.preferenceCard,
                preferences.includes(pref.id) && styles.preferenceCardActive
              ]}
              onPress={() => togglePreference(pref.id)}
            >
              <Text style={styles.preferenceLabel}>{pref.label}</Text>
              <Text style={styles.preferenceDesc}>{pref.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.submitSection}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitFeedback}
        >
          <Text style={styles.submitButtonText}>Submit Feedback & Finish</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipFeedbackButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.skipFeedbackText}>Skip feedback</Text>
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
    paddingBottom: 24,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statWarning: {
    color: '#f59e0b',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  deltaCard: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4a9eff',
  },
  deltaText: {
    color: '#aaa',
    fontSize: 14,
  },
  taskCard: {
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  goodBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  goodText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  warningBadge: {
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '600',
  },
  skippedBadge: {
    backgroundColor: '#33333320',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skippedText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  taskStats: {
    flexDirection: 'row',
    gap: 16,
  },
  taskStat: {
    fontSize: 13,
    color: '#888',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#222',
  },
  ratingButtonActive: {
    backgroundColor: '#9333ea',
    borderColor: '#9333ea',
  },
  ratingEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  ratingLabelActive: {
    color: '#fff',
  },
  preferencesGrid: {
    gap: 10,
  },
  preferenceCard: {
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#222',
  },
  preferenceCardActive: {
    backgroundColor: '#4a9eff20',
    borderColor: '#4a9eff',
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  preferenceDesc: {
    fontSize: 12,
    color: '#888',
  },
  submitSection: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  skipFeedbackButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipFeedbackText: {
    color: '#666',
    fontSize: 14,
  },
});