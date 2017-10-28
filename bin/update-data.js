#!/usr/bin/env node
/**
 * Usage: ./update-data.js
 *
 * Reads the comma-separated PRODUCT_FEED_URLS env for XML product feed sources
 * and uses them to populate a Postgres database at DATABASE_URL
 */

const { mapValues, flatMap } = require('lodash');
const Promise = require('bluebird');
const axios = require('axios');
const logger = require('winston');
const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  searchPath: 'knex,public'
});

const { Builder, parseStringAsync, processors } = Promise.promisifyAll(
  require('xml2js')
);

function entryToProductRow(entry) {
  const raw = mapValues(entry, prop => prop[0]);

  // 10.00 EUR
  const basePrice = raw.price ? parseFloat(raw.price) : null;
  const salePrice = raw.sale_price ? parseFloat(raw.sale_price) : null;
  const currency = raw.price ? raw.price.split(' ').pop() : null;

  // Separate start date and and end date with /
  const salePriceDateStart = raw.sale_price_effective_date
    ? new Date(raw.sale_price_effective_date.split('/')[0])
    : null;
  const salePriceDateEnd = raw.sale_price_effective_date
    ? new Date(raw.sale_price_effective_date.split('/')[1])
    : null;

  // rebuild the entry as xml
  const xml = new Builder({ renderOpts: { writer: { declaration: () => '' } } })
    .buildObject({ entry });

  const row = {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    link: raw.link,
    mobile_link: raw.mobile_link,
    image_link: raw.image_link,
    additional_image_link: entry.additional_image_link, // jsonb
    availability: raw.availability,
    availability_date: raw.availability_date
      ? new Date(raw.availability_date)
      : null,
    expiration_date: raw.expiration_date ? new Date(raw.expiration_date) : null,
    price: basePrice,
    sale_price: salePrice,
    currency,
    sale_price_effective_date_start: salePriceDateStart,
    sale_price_effective_date_end: salePriceDateEnd,
    unit_pricing_measure: raw.unit_pricing_measure,
    unit_pricing_base_measure: raw.unit_pricing_base_measure,
    google_product_category: raw.google_product_category,
    product_type: raw.product_type,
    brand: raw.brand,
    gtin: raw.gtin,
    mpn: raw.mpn,
    condition: raw.condition,
    adult: Boolean(raw.adult === 'yes'),
    multipack: raw.multipack ? parseInt(raw.multipack, 10) : null,
    is_bundle: Boolean(raw.is_bundle), // boolean
    energy_efficiency_class: raw.energy_efficiency_class,
    age_group: raw.age_group,
    color: raw.color,
    gender: raw.gender,
    material: raw.material,
    pattern: raw.pattern,
    size: raw.size,
    size_type: raw.size_type,
    size_system: raw.size_system,
    item_group_id: raw.item_group_id,
    shipping_price: raw.shipping_price,
    shipping_label: raw.shipping_label,
    shipping_weight: raw.shipping_weight,
    shipping_length: raw.shipping_length,
    shipping_width: raw.shipping_width,
    shipping_height: raw.shipping_height,
    tax: raw.tax,
    raw,
    xml,
  };
  return row;
}

async function upsertProduct(row) {
  const { id } = row;
  try {
    return Promise.resolve(true)
      .then(() => knex.withSchema('api').table('products').insert(row))
      .tap(() => logger.info(`Added new product id ${id}`));
  } catch (err) {
    return Promise.resolve(true)
      .then(() => knex.withSchema('api').table('products').where({ id }).update(row))
      .tap(() => logger.info(`Updated product id ${id}`));
  }
}

async function main() {
  // product feed comma-separated URLs
  const urls = `${process.env.PRODUCT_FEED_URLS}`.split(',');

  // fetch xml feeds
  const getXMLFeed = url => axios.get(url, { responseType: 'xml' });
  const productFeedsXML = await axios.all(urls.map(getXMLFeed));

  // parse xml
  const feedData = await Promise.map(productFeedsXML, xml =>
    parseStringAsync(xml.data, { tagNameProcessors: [processors.stripPrefix] })
  );

  // get products from feed
  const products = flatMap(feedData, xml => xml.feed.entry).map(entryToProductRow);

  // update to database
  await Promise.map(products, upsertProduct, { concurrency: 10 })
  logger.info('Done');
  process.exit(0);
}

main();
