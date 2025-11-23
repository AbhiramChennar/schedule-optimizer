import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getAccuracyStats, getCompletedAssignments } from '../database/db';

export default function StatsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [completedAssignments, setCompletedAssignments] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const accuracyData = await getAccuracyStats();
    const completed = await getCompletedAssignments();
    setStats(accuracyData);
    setCompletedAssignments(completed);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Learning Stats</Text>
        <Text style={styles.headerSubtitle}>How accurate is the AI?</Text>
      </View>

      {stats && stats.overall.totalCount > 0 ? (
        <>
          {/* Overall Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Performance</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.overall.accuracyRate}%</Text>
                <Text style={styles.statLabel}>Accuracy Rate</Text>
                <Text style={styles.statSubtext}>
                  {stats.overall.accurateCount} of {stats.overall.totalCount} within 30 min
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.overall.totalCount}</Text>
                <Text style={styles.statLabel}>Completed</Text>
                <Text style={styles.statSubtext}>Assignments tracked</Text>
              </View>
            </View>

            <View style={styles.timeComparisonCard}>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>Avg Estimated:</Text>
                <Text style={styles.timeValue}>
                  {stats.overall.avgEstimated?.toFixed(1) || 0}h
                </Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>Avg Actual:</Text>
                <Text style={styles.timeValue}>
                  {stats.overall.avgActual?.toFixed(1) || 0}h
                </Text>
              </View>
            </View>
          </View>

          {/* By Class Breakdown */}
          {stats.byClass.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance by Class</Text>
              
              {stats.byClass.map((classData, index) => {
                const isAccurate = Math.abs(classData.avgDifference) < 0.5;
                const trend = classData.avgDifference > 0 ? 'slower' : 'faster';
                
                return (
                  <View key={index} style={styles.classCard}>
                    <Text style={styles.className}>{classData.className}</Text>
                    <Text style={styles.classCount}>{classData.count} assignments</Text>
                    
                    <View style={styles.classStats}>
                      <View style={styles.classStatRow}>
                        <Text style={styles.classStatLabel}>Estimated:</Text>
                        <Text style={styles.classStatValue}>
                          {classData.avgEstimated.toFixed(1)}h
                        </Text>
                      </View>
                      <View style={styles.classStatRow}>
                        <Text style={styles.classStatLabel}>Actual:</Text>
                        <Text style={styles.classStatValue}>
                          {classData.avgActual.toFixed(1)}h
                        </Text>
                      </View>
                    </View>

                    <View style={[
                      styles.trendBadge,
                      isAccurate && styles.trendAccurate,
                      !isAccurate && classData.avgDifference > 0 && styles.trendSlow,
                      !isAccurate && classData.avgDifference < 0 && styles.trendFast
                    ]}>
                      <Text style={styles.trendText}>
                        {isAccurate 
                          ? '✓ Very accurate' 
                          : `${Math.abs(classData.avgDifference).toFixed(1)}h ${trend}`
                        }
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Recent Completions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Completions</Text>
            
            {completedAssignments.slice(0, 5).map((assignment) => (
              <View key={assignment.id} style={styles.completionCard}>
                <Text style={styles.completionTitle}>{assignment.title}</Text>
                <Text style={styles.completionClass}>{assignment.className}</Text>
                
                <View style={styles.completionComparison}>
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonLabel}>Estimated</Text>
                    <Text style={styles.comparisonValue}>{assignment.estimatedTime}h</Text>
                  </View>
                  <Text style={styles.comparisonArrow}>→</Text>
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonLabel}>Actual</Text>
                    <Text style={styles.comparisonValue}>{assignment.actualTime}h</Text>
                  </View>
                </View>

                {Math.abs(assignment.estimatedTime - assignment.actualTime) <= 0.5 && (
                  <Text style={styles.accurateBadge}>✓ Accurate estimate!</Text>
                )}
              </View>
            ))}
          </View>

          {/* Learning Message */}
          <View style={styles.learningBox}>
            <Text style={styles.learningTitle}>🧠 AI is Learning!</Text>
            <Text style={styles.learningText}>
              The more assignments you complete and track, the better the AI gets at 
              predicting YOUR specific work patterns. Keep logging your actual completion times!
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Data Yet</Text>
          <Text style={styles.emptyText}>
            Complete some assignments and log your actual time to see AI learning stats!
          </Text>
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
  headerSubtitle: {
    fontSize: 14,
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
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
  },
  statSubtext: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  timeComparisonCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  timeLabel: {
    fontSize: 15,
    color: '#aaa',
  },
  timeValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  classCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  classCount: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  classStats: {
    marginBottom: 12,
  },
  classStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  classStatLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  classStatValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  trendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  trendAccurate: {
    backgroundColor: '#10b98120',
  },
  trendSlow: {
    backgroundColor: '#ef444420',
  },
  trendFast: {
    backgroundColor: '#4a9eff20',
  },
  trendText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  completionCard: {
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  completionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  completionClass: {
    fontSize: 13,
    color: '#4a9eff',
    marginBottom: 10,
  },
  completionComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  comparisonArrow: {
    fontSize: 20,
    color: '#666',
  },
  accurateBadge: {
    fontSize: 12,
    color: '#10b981',
    textAlign: 'center',
    fontWeight: '600',
  },
  learningBox: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9333ea',
  },
  learningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9333ea',
    marginBottom: 10,
  },
  learningText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
});