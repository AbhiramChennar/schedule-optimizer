import * as SQLite from 'expo-sqlite';

// Open database (creates it if doesn't exist)
const db = SQLite.openDatabaseSync('scheduleOptimizer.db');

// Initialize database tables
export const initDatabase = async () => {
  try {
    // Create classes table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create assignments table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        class_name TEXT NOT NULL,
        due_date TEXT NOT NULL,
        estimated_time REAL DEFAULT 2,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// ============ CLASS OPERATIONS ============

export const addClass = async (name, difficulty) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO classes (name, difficulty) VALUES (?, ?)',
      [name, difficulty]
    );
    return { id: result.lastInsertRowId, name, difficulty };
  } catch (error) {
    console.error('Error adding class:', error);
    throw error;
  }
};

export const getAllClasses = async () => {
  try {
    const classes = await db.getAllAsync('SELECT * FROM classes ORDER BY name');
    return classes;
  } catch (error) {
    console.error('Error getting classes:', error);
    return [];
  }
};

export const deleteClass = async (id) => {
  try {
    await db.runAsync('DELETE FROM classes WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting class:', error);
    return false;
  }
};

// ============ ASSIGNMENT OPERATIONS ============

export const addAssignment = async (assignment) => {
  try {
    const result = await db.runAsync(
      `INSERT INTO assignments 
       (title, description, class_name, due_date, estimated_time) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        assignment.title,
        assignment.description || '',
        assignment.className,
        assignment.dueDate,
        assignment.estimatedTime || 2
      ]
    );
    
    return {
      id: result.lastInsertRowId,
      ...assignment
    };
  } catch (error) {
    console.error('Error adding assignment:', error);
    throw error;
  }
};

export const getAllAssignments = async () => {
  try {
    const assignments = await db.getAllAsync(
      'SELECT * FROM assignments WHERE completed = 0 ORDER BY due_date'
    );
    return assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      className: a.class_name,
      dueDate: a.due_date,
      estimatedTime: a.estimated_time,
      completed: a.completed === 1
    }));
  } catch (error) {
    console.error('Error getting assignments:', error);
    return [];
  }
};

export const updateAssignment = async (id, updates) => {
  try {
    const fields = [];
    const values = [];
    
    if (updates.title) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.dueDate) {
      fields.push('due_date = ?');
      values.push(updates.dueDate);
    }
    if (updates.estimatedTime) {
      fields.push('estimated_time = ?');
      values.push(updates.estimatedTime);
    }
    if (updates.completed !== undefined) {
      fields.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
    }
    
    values.push(id);
    
    await db.runAsync(
      `UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return true;
  } catch (error) {
    console.error('Error updating assignment:', error);
    return false;
  }
};

export const deleteAssignment = async (id) => {
  try {
    await db.runAsync('DELETE FROM assignments WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return false;
  }
};

export const markAssignmentComplete = async (id) => {
  try {
    await db.runAsync('UPDATE assignments SET completed = 1 WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error marking assignment complete:', error);
    return false;
  }
};