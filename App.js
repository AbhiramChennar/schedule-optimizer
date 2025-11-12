import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens (we'll create these next)
import HomeScreen from './screens/HomeScreen';
import AddClassScreen from './screens/AddClassScreen';
import AddAssignmentScreen from './screens/AddAssignmentScreen';
import AssignmentListScreen from './screens/AssignmentListScreen';

const Stack = createStackNavigator();

export default function App() {
  // Global state - stores all your data
  // Later we'll move this to SQLite database
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // We'll create custom headers
          cardStyle: { backgroundColor: '#0a0a0a' }
        }}
      >
        <Stack.Screen name="Home">
          {props => (
            <HomeScreen 
              {...props} 
              assignments={assignments}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen name="AddClass">
          {props => (
            <AddClassScreen 
              {...props} 
              classes={classes}
              setClasses={setClasses}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen name="AddAssignment">
          {props => (
            <AddAssignmentScreen 
              {...props} 
              classes={classes}
              assignments={assignments}
              setAssignments={setAssignments}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen name="AssignmentList">
          {props => (
            <AssignmentListScreen 
              {...props} 
              assignments={assignments}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}