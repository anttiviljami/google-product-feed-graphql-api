exports.up = function(knex, Promise) {
  const products = knex.schema.createTable('products', table => {
		// internal product id
    table.increments('id').unsigned().primary();

		// updated_at and created_at timestamps
    table.timestamps(true, true);
  });
  return Promise.resolve(true)
		.then(() => products);
};

exports.down = function(knex, Promise) {
  return Promise.resolve(true)
    .then(() => knex.schema.dropTable('products'));
};
