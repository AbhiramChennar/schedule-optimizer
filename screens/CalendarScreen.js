import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarScreen({ navigation, assignments }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Convert assignments to calendar marked dates
  const markedDates = useMemo(() => {
    const marked = {};
    
    assignments.forEach(assignment => {
      // Parse various date formats - this is simplified
      // You might want to improve date parsing
      const dateKey = parseDateToKey(assignment.dueDate);
      
      if (!marked[dateKey]) {
        marked[dateKey] = {
          marked: true,
          dots: [{ color: '#4a9eff' }],
          assignments: []
        };
      }
      marked[dateKey].assignments.push(assignment);
    });

    // Highlight selected date
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = '#4a9eff';
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#333',
        assignments: []
      };
    }

    return marked;
  }, [assignments, selectedDate]);

  // Get assignments for selected date
  const selectedDateAssignments = markedDates[selectedDate]?.assignments || [];

  // Simple date parser - converts various formats to YYYY-MM-DD
  function parseDateToKey(dateStr) {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Handle "Nov 18", "November 18", "Dec 5", etc.
      const monthDayMatch = dateStr.match(/([A-Za-z]+)\s+(\d+)/);
      if (monthDayMatch) {
        const monthStr = monthDayMatch[1];
        const day = parseInt(monthDayMatch[2]);
        
        // Parse month name
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                           'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthIndex = monthNames.findIndex(m => 
          monthStr.toLowerCase().startsWith(m)
        );
        
        if (monthIndex !== -1) {
          const date = new Date(currentYear, monthIndex, day);
          
          // If the date is in the past, assume next year
          if (date < now) {
            date.setFullYear(currentYear + 1);
          }
          
          return date.toISOString().split('T')[0];
        }
      }
      
      // Handle "Friday", "Monday", etc. (this week or next)
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = daysOfWeek.findIndex(d => 
        dateStr.toLowerCase().includes(d)
      );
      
      if (dayIndex !== -1) {
        const today = new Date();
        const currentDay = today.getDay();
        let daysUntil = dayIndex - currentDay;
        
        // If the day already passed this week, go to next week
        if (daysUntil <= 0) {
          daysUntil += 7;
        }
        
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntil);
        return targetDate.toISOString().split('T')[0];
      }

      // Handle "12/15", "12/15/2024", "2024-12-15"
      if (dateStr.includes('/') || dateStr.includes('-')) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }

      // Default: return tomorrow (safer than today)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    } catch (e) {
      console.error('Date parsing error:', e);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
  }

  const totalTimeForDate = selectedDateAssignments.reduce((sum, a) => sum + a.estimatedTime, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      <ScrollView>
        {/* Calendar */}
        <Calendar
          style={styles.calendar}
          theme={{
            calendarBackground: '#0a0a0a',
            textSectionTitleColor: '#888',
            selectedDayBackgroundColor: '#4a9eff',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#4a9eff',
            dayTextColor: '#fff',
            textDisabledColor: '#444',
            monthTextColor: '#fff',
            textMonthFontWeight: 'bold',
            textMonthFontSize: 18,
            arrowColor: '#4a9eff',
          }}
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markingType={'dot'}
        />

        {/* Selected Date Details */}
        <View style={styles.detailsSection}>
          <View style={styles.dateHeader}>
            <Text style={styles.dateTitle}>
              {(() => {
                const [year, month, day] = selectedDate.split('-').map(Number);
                const date = new Date(year, month - 1, day, 12, 0, 0);
                return date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                });
              })()}
            </Text>
            {totalTimeForDate > 0 && (
              <View style={styles.totalTimeChip}>
                <Text style={styles.totalTimeText}>{totalTimeForDate}h total</Text>
              </View>
            )}
          </View>

          {selectedDateAssignments.length > 0 ? (
            <>
              <Text style={styles.assignmentCount}>
                {selectedDateAssignments.length} assignment{selectedDateAssignments.length !== 1 ? 's' : ''} due
              </Text>
              
              {selectedDateAssignments.map((assignment) => (
                <View key={assignment.id} style={styles.assignmentCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                    <View style={styles.timeChip}>
                      <Text style={styles.timeChipText}>{assignment.estimatedTime}h</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.assignmentClass}>{assignment.className}</Text>
                  
                  {assignment.description && (
                    <Text style={styles.assignmentDescription} numberOfLines={2}>
                      {assignment.description}
                    </Text>
                  )}
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyDay}>
              <Text style={styles.emptyDayText}>No assignments due this day</Text>
              <Text style={styles.emptyDaySubtext}>Tap a date with a blue dot to see assignments</Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {assignments.filter(a => {
                  const dueDate = parseDateToKey(a.dueDate);
                  const today = new Date();
                  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                  const assignmentDate = new Date(dueDate);
                  return assignmentDate >= today && assignmentDate <= weekFromNow;
                }).length}
              </Text>
              <Text style={styles.statLabel}>Assignments</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {assignments.filter(a => {
                  const dueDate = parseDateToKey(a.dueDate);
                  const assignmentDate = new Date(dueDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return assignmentDate.toDateString() === today.toDateString();
                }).length}
              </Text>
              <Text style={styles.statLabel}>Due Today</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  calendar: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  detailsSection: {
    padding: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  totalTimeChip: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  totalTimeText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  assignmentCount: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
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
    fontSize: 16,
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
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyDayText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptyDaySubtext: {
    fontSize: 13,
    color: '#444',
  },
  statsSection: {
    padding: 20,
    paddingTop: 0,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
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
});