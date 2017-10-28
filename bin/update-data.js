#!/usr/bin/env node
/**
 * Usage: ./update-data.js
 *
 * Reads the comma-separated PRODUCT_FEED_URLS env for XML product feed sources
 * and uses them to populate a Postgres database at DATABASE_URL
 */

const Promise = require('bluebird');
const axios = require('axios');
const logger = require('winston');

const { parseStringAsync } = Promise.promisifyAll(require('xml2js'));

async function main() {
  // product feed comma-separated URLs
  const urls = `${process.env.PRODUCT_FEED_URLS}`.split(',');

  // fetch xml feeds
  const getXMLFeed = url => axios.get(url, { responseType: 'xml' });
  const productFeedsXML = await axios.all(urls.map(getXMLFeed));
  logger.info(productFeedsXML);

  // parse xml
  const productData = await Promise.map(productFeedsXML, xml => parseStringAsync(xml.data));
  logger.info(productData);
}

main();
