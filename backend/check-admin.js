import { usersContainer } from './src/config/database.js';

const querySpec = {
  query: 'SELECT c.id, c.username, c.role, c.password_hash FROM c WHERE c.username = @username',
  parameters: [
    { name: '@username', value: 'admin' }
  ]
};

const { resources } = await usersContainer.items.query(querySpec).fetchAll();

if (!resources.length) {
  console.log('ADMIN USER NOT FOUND');
} else {
  console.log('ADMIN USER FOUND');
  console.log('id:', resources[0].id);
  console.log('username:', resources[0].username);
  console.log('role:', resources[0].role);
  console.log('password_hash exists:', !!resources[0].password_hash);
}
