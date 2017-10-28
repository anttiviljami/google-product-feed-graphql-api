exports.up = function up(knex, Promise) {
  // create a custom schema for postgraphql
  const api = Promise.resolve(true)
    .then(() => knex.raw('create schema api'))
    .then(() => knex.raw('create role api'))
    .then(() => knex.raw('grant usage on schema api to api'))

  // products table
  // based on schema at https://support.google.com/merchants/answer/7052112?hl=en
  const products = knex.schema.withSchema('api').createTable('products', table => {
    /* Basic product data */

		// internal product id
    table.string('id', 50).unique().primary();
    // product title
    table.string('title', 150).notNullable();
    // product description (max chars: 5000)
    table.string('description', 5000);
    // product link
    table.string('link', 2000).notNullable();
    // optional product mobile link
    table.string('mobile_link', 2000);
    // product image link
    table.string('image_link', 2000);
    // additional image links stored as jsonb array
    table.jsonb('additional_image_link');

    /* Price & availability */

    // availability [in stock, out of stock, preorder]
    table.string('availability').defaultTo('in stock');
    // The date a pre-ordered product becomes available for delivery
    table.date('availability_​​date');
    // The date that your product should stop showing
    table.date('expiration_date');
    // numeric price (parsed from source data)
    table.float('price')
    // numeric price (parsed from source data)
    table.float('sale_price')
    // ISO 4217 currency (parsed from source data)
    table.string('currency');
    // The date range during which the product’s sale_price applies
    table.date('sale_​​price_​​effective_​​date_start');
    table.date('sale_​​price_​​effective_​​date_end');
    // measure or dimension of the product without packaging 
    table.string('unit_​​pricing_​​measure');
    table.string('unit_​​pricing_​​base_​​measure');

    /* Product category */

    // Google-defined product category
    // see: https://support.google.com/merchants/answer/1705911
    table.string('google_​​product_​​category');
    // optional category
    table.string('product_type', 750);

    /* Product identifiers */
    // brand name
    table.string('brand', 70);
    // gtin (e.g. EAN)
    table.string('gtin', 50);
    // Product manufacturer number
    table.string('mpn', 70);
    // Product condition ['new', 'refurbished', 'used']
    table.string('condition');

    /* Detailed product description */

    // Product includes sexually suggestive content
    table.boolean('adult').defaultTo(false);
    // Submit the number of products in your multipack
    table.integer('multipack').defaultTo(0);
    // If you're selling a custom bundle of different products that you created, and the bundle includes a main product
    table.boolean('is_bundle').defaultTo(false);
    // Your product’s energy label [G, F, E, D, C, B, A, A+, A++, A+++]
    table.string('energy_​​efficiency_​​class');
    // Product's targeted age group [infant, toddler, kids, adult]
    table.string('age_​​group');
    // Your product’s color(s)
    table.string('color', 100);
    // Your product’s targeted gender 
    table.string('gender');
    // Your product’s fabric or material
    table.string('material', 200);
    // Your product’s pattern or graphic print
    table.string('pattern', 100);
    // Your product’s size
    table.string('size', 100);
    // Your product's size type [regular, petite, plus, big and tall, maternity]
    table.string('size_type');
    // The country of the size system used by your product [US, UK, EU, DE, FR, JP, CN (China), IT, BR, MEX, AU]
    table.string('size_​​system')
    // ID for a group of products that come in different versions (variants). Use the parent SKU where possible 
    table.string('item_group_id', 50);

    /* Shipping */

    // Your product's shipping cost [US:CA:Overnight:16.00 USD]
    table.string('shipping_price')
    // Label for your shipping method
    table.string('shipping_label', 100);
    // The weight of the product used to calculate the shipping cost e.g. "3 kg"
    table.string('shipping_​​weight');
    // Dimensions used to calculate the shipping costs
    table.string('shipping_​​length');
    table.string('shipping_​​width');
    table.string('shipping_​​height');
    
    /* Tax */

    // Your product’s sales tax rate in percent (if not included in price)
    table.string('tax');

    /* Non-google derived fields */

    // Raw product data, as imported from the feed
    table.jsonb('raw');
		// updated_at and created_at timestamps
    table.timestamps(true, true);
  }).then(() => knex.raw('grant select on api.products to api'));

  return Promise.resolve(true)
		.then(() => api)
		.then(() => products);
};

exports.down = function down(knex, Promise) {
  return Promise.resolve(true)
    .then(() => knex.schema.withSchema('api').dropTable('products'))
    .then(() => knex.raw('drop role api'))
    .then(() => knex.raw('drop schema api'));
};
