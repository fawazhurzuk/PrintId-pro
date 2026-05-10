require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Template = require('../models/Template');
const connectDB = require('../config/db');

const seedDB = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ role: 'printShopAdmin' });
  if (existingAdmin) {
    console.log('Print Shop Admin already exists. Skipping seed.');
    process.exit(0);
  }

  const admin = new User({
    name: 'Print Shop Admin',
    email: 'admin@printidpro.com',
    password: 'admin123',
    role: 'printShopAdmin',
  });
  await admin.save();
  console.log('Print Shop Admin created: admin@printidpro.com / admin123');

  const defaultFields = [
    { label: 'Name', key: 'name', visible: true, order: 1 },
    { label: 'Class', key: 'className', visible: true, order: 2 },
    { label: 'Section', key: 'section', visible: true, order: 3 },
    { label: 'Roll No.', key: 'rollNumber', visible: true, order: 4 },
    { label: 'DOB', key: 'dateOfBirth', visible: true, order: 5 },
    { label: 'Blood Group', key: 'bloodGroup', visible: true, order: 6 },
    { label: "Father's Name", key: 'fatherName', visible: true, order: 7 },
    { label: 'Address', key: 'address', visible: true, order: 8 },
    { label: 'Phone', key: 'phone', visible: true, order: 9 },
  ];

  await Template.create([
    {
      name: 'Classic Blue - Horizontal',
      orientation: 'horizontal',
      isDefault: true,
      backgroundColor: '#1E3A5F',
      textColor: '#FFFFFF',
      accentColor: '#0F9DC8',
      headerText: 'STUDENT IDENTITY CARD',
      fields: defaultFields,
      createdBy: admin._id,
    },
    {
      name: 'Classic Blue - Vertical',
      orientation: 'vertical',
      isDefault: true,
      backgroundColor: '#1E3A5F',
      textColor: '#FFFFFF',
      accentColor: '#0F9DC8',
      headerText: 'STUDENT IDENTITY CARD',
      fields: defaultFields,
      createdBy: admin._id,
    },
    {
      name: 'Modern Green - Horizontal',
      orientation: 'horizontal',
      isDefault: false,
      backgroundColor: '#2E7D32',
      textColor: '#FFFFFF',
      accentColor: '#66BB6A',
      headerText: 'STUDENT ID CARD',
      fields: defaultFields,
      createdBy: admin._id,
    },
    {
      name: 'Modern Green - Vertical',
      orientation: 'vertical',
      isDefault: false,
      backgroundColor: '#2E7D32',
      textColor: '#FFFFFF',
      accentColor: '#66BB6A',
      headerText: 'STUDENT ID CARD',
      fields: defaultFields,
      createdBy: admin._id,
    },
    {
      name: 'Elegant Maroon - Horizontal',
      orientation: 'horizontal',
      isDefault: false,
      backgroundColor: '#7B1F3A',
      textColor: '#FFFFFF',
      accentColor: '#E8A87C',
      headerText: 'IDENTITY CARD',
      fields: defaultFields,
      createdBy: admin._id,
    },
    {
      name: 'Elegant Maroon - Vertical',
      orientation: 'vertical',
      isDefault: false,
      backgroundColor: '#7B1F3A',
      textColor: '#FFFFFF',
      accentColor: '#E8A87C',
      headerText: 'IDENTITY CARD',
      fields: defaultFields,
      createdBy: admin._id,
    },
  ]);
  console.log('Default templates created.');

  process.exit(0);
};

seedDB().catch(err => { console.error(err); process.exit(1); });
