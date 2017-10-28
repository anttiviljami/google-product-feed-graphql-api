exports.up = function up(knex, Promise) {
  // create a custom schema for postgraphql
  const api = knex.raw('CREATE SCHEMA api');

  // products table
  const products = knex.schema.withSchema('api').createTable('products', table => {
		// internal product id
    table.increments('id').unsigned().primary();

		// updated_at and created_at timestamps
    table.timestamps(true, true);
  });
  return Promise.resolve(true)
		.then(() => api)
		.then(() => products);
};

exports.down = function down(knex, Promise) {
  return Promise.resolve(true)
    .then(() => knex.raw('DROP SCHEMA api'))
    .then(() => knex.schema.withSchema('api').dropTable('products'));
};
