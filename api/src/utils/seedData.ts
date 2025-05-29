import { Category } from '../models/Category';
// import { ICategory } from '../types';

interface DefaultCategory {
  name: string;
  description: string;
}

export class DataSeeder {
  private readonly defaultCategories: DefaultCategory[] = [
    {
      name: 'Recurring',
      description: 'Monthly recurring bills and subscriptions',
    },
    {
      name: 'Telecommunications',
      description: 'Phone, internet, cable, and streaming services',
    },
    {
      name: 'Groceries',
      description: 'Food, beverages, and household items',
    },
    {
      name: 'Utilities',
      description: 'Electric, gas, water, trash, and sewer',
    },
    {
      name: 'Transportation',
      description: 'Car payments, gas, insurance, and maintenance',
    },
    {
      name: 'Healthcare',
      description: 'Medical bills, insurance, and prescriptions',
    },
    {
      name: 'Entertainment',
      description: 'Dining out, movies, events, and hobbies',
    },
    {
      name: 'Housing',
      description: 'Rent, mortgage, HOA fees, and home maintenance',
    },
    {
      name: 'Insurance',
      description: 'Life, health, auto, and home insurance',
    },
    {
      name: 'Miscellaneous',
      description: "Other expenses that don't fit specific categories",
    },
  ];

  public async seedCategories(): Promise<void> {
    try {
      console.log('🌱 Seeding default categories...');

      for (const categoryData of this.defaultCategories) {
        const existingCategory = await Category.findOne({ name: categoryData.name });

        if (!existingCategory) {
          const category = new Category(categoryData);
          await category.save();
          console.log(`✅ Created category: ${categoryData.name}`);
        } else {
          console.log(`⏭️  Category already exists: ${categoryData.name}`);
        }
      }

      console.log('🎉 Category seeding completed!');
    } catch (error) {
      console.error('❌ Error seeding categories:', error);
      throw error;
    }
  }

  public async seedAllData(): Promise<void> {
    try {
      await this.seedCategories();
      console.log('✅ All data seeding completed successfully!');
    } catch (error) {
      console.error('❌ Data seeding failed:', error);
      throw error;
    }
  }

  public async resetCategories(): Promise<void> {
    try {
      console.log('🗑️  Resetting categories...');
      await Category.deleteMany({});
      await this.seedCategories();
      console.log('✅ Categories reset completed!');
    } catch (error) {
      console.error('❌ Error resetting categories:', error);
      throw error;
    }
  }
}

export const dataSeeder = new DataSeeder();
