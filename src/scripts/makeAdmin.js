import { updateUserToAdmin } from '../lib/updateUserRole.js';

async function makeAdmin() {
  try {
    await updateUserToAdmin('mahatosubashis3@gmail.com');
    console.log('Successfully updated user to admin role');
  } catch (error) {
    console.error('Failed to update user role:', error);
  }
}

makeAdmin();