import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';

// Import database functions
import { getAllAssignments, getAllClasses, initDatabase } from './database/db';
// Import screens
import AddAssignmentScreen from './screens/AddAssignmentScreen';
import AddClassScreen from './screens/AddClassScreen';
import AssignmentListScreen from './screens/AssignmentListScreen';
import CalendarScreen from './screens/CalendarScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize database and load data on app start
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        // Initialize database tables
        await initDatabase();
        
        // Load existing data
        const loadedClasses = await getAllClasses();
        const loadedAssignments = await getAllAssignments();
        
        setClasses(loadedClasses);
        setAssignments(loadedAssignments);
        
        console.log('Loaded classes:', loadedClasses.length);
        console.log('Loaded assignments:', loadedAssignments.length);
      } catch (error) {
        console.error('Error setting up database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupDatabase();
  }, []);

  // Function to refresh data from database
  const refreshData = async () => {
    const loadedClasses = await getAllClasses();
    const loadedAssignments = await getAllAssignments();
    setClasses(loadedClasses);
    setAssignments(loadedAssignments);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0a0a0a' }
        }}
      >
        <Stack.Screen name="Home">
          {props => (
            <HomeScreen 
              {...props} 
              assignments={assignments}
              refreshData={refreshData}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen name="AddClass">
          {props => (
            <AddClassScreen 
              {...props} 
              classes={classes}
              refreshData={refreshData}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen name="AddAssignment">
          {props => (
            <AddAssignmentScreen 
              {...props} 
              classes={classes}
              assignments={assignments}
              refreshData={refreshData}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen name="AssignmentList">
          {props => (
            <AssignmentListScreen 
              {...props} 
              assignments={assignments}
              refreshData={refreshData}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Calendar">
          {props => (
            <CalendarScreen 
              {...props} 
              assignments={assignments}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}