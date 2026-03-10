/**
 * Seed data for development
 * Initialize with sample categories and tasks
 */

import categoryService from '../services/categoryService';
import taskService from '../services/taskService';

export async function seedDatabase() {
  console.log('Checking if database needs seeding...');

  // Check if categories already exist
  const existingCategories = await categoryService.getAll();
  if (existingCategories.length > 0) {
    console.log('Database already seeded, skipping.');
    return;
  }

  console.log('Seeding database...');

  // Create sample categories with more variety
  const workCategory = await categoryService.create({
    name: 'Work',
    color: '#4A90E2',
  });

  const personalCategory = await categoryService.create({
    name: 'Personal',
    color: '#50E3C2',
  });

  const shoppingCategory = await categoryService.create({
    name: 'Shopping',
    color: '#F5A623',
  });

  const healthCategory = await categoryService.create({
    name: 'Health',
    color: '#7B68EE',
  });

  const financeCategory = await categoryService.create({
    name: 'Finance',
    color: '#FF6B6B',
  });

  const learningCategory = await categoryService.create({
    name: 'Learning',
    color: '#4ECDC4',
  });

  // Create sample tasks with more variety across categories
  const tasks = [
    // Work tasks
    { title: 'Complete project documentation', description: 'Write comprehensive docs for the new feature', categoryId: workCategory.id },
    { title: 'Review pull requests', description: 'Review and merge pending PRs', categoryId: workCategory.id },
    { title: 'Prepare presentation slides', description: 'Create slides for Monday meeting', categoryId: workCategory.id },
    { title: 'Team standup meeting', description: '', categoryId: workCategory.id },
    { title: 'Update JIRA tickets', description: 'Log all completed work', categoryId: workCategory.id },

    // Personal tasks
    { title: 'Call mom', description: '', categoryId: personalCategory.id },
    { title: 'Go for a run', description: '30 minutes workout', categoryId: personalCategory.id },
    { title: 'Plan weekend trip', description: 'Research destinations and book hotel', categoryId: personalCategory.id },
    { title: 'Read 30 pages', description: 'Continue reading current book', categoryId: personalCategory.id },
    { title: 'Water the plants', description: '', categoryId: personalCategory.id },

    // Shopping tasks
    { title: 'Buy groceries', description: 'Milk, eggs, bread, vegetables', categoryId: shoppingCategory.id },
    { title: 'Order cat food', description: '', categoryId: shoppingCategory.id },
    { title: 'Get new phone case', description: '', categoryId: shoppingCategory.id },
    { title: 'Buy birthday gift for Sarah', description: '', categoryId: shoppingCategory.id },

    // Health tasks
    { title: 'Schedule dentist appointment', description: '', categoryId: healthCategory.id },
    { title: 'Take vitamins', description: 'Daily supplements', categoryId: healthCategory.id },
    { title: 'Drink 8 glasses of water', description: '', categoryId: healthCategory.id },
    { title: 'Meditate for 10 minutes', description: '', categoryId: healthCategory.id },

    // Finance tasks
    { title: 'Pay electricity bill', description: '', categoryId: financeCategory.id },
    { title: 'Review monthly budget', description: '', categoryId: financeCategory.id },
    { title: 'Transfer savings', description: '', categoryId: financeCategory.id },
    { title: 'Check credit card statement', description: '', categoryId: financeCategory.id },

    // Learning tasks
    { title: 'Watch React tutorial', description: 'Learn about new hooks', categoryId: learningCategory.id },
    { title: 'Practice Spanish', description: 'Duolingo daily lesson', categoryId: learningCategory.id },
    { title: 'Read tech articles', description: 'Stay updated on industry news', categoryId: learningCategory.id },
    { title: 'Complete coding challenge', description: '', categoryId: learningCategory.id },
  ];

  for (const task of tasks) {
    await taskService.create(task);
  }

  console.log('Database seeded successfully!');
  console.log(`Created 6 categories and ${tasks.length} tasks`);
}

/**
 * Clear all data
 */
export async function clearDatabase() {
  console.log('Clearing database...');

  const tasks = await taskService.getAll();
  for (const task of tasks) {
    await taskService.delete(task.id);
  }

  const categories = await categoryService.getAll();
  for (const category of categories) {
    await categoryService.delete(category.id);
  }

  console.log('Database cleared!');
}

/**
 * Reset and reseed database
 */
export async function resetDatabase() {
  console.log('Resetting database...');
  await clearDatabase();
  await seedDatabase();
  console.log('Database reset complete!');
}
