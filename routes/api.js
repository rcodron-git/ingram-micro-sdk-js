require('dotenv').config();
var express = require('express');
var router = express.Router();
var XiSdkResellers = require('xi_sdk_resellers');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
const e = require('express');
const short = require('short-uuid');
const crypto = require('crypto');

// Use session middleware
router.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  }));

  // Function to generate a 30-character hash from a UUID
function generateShortUUID(uuid) {
  return crypto.createHash('sha256').update(uuid).digest('base64').substring(0, 30);
}

// generate a correlation ID for the session
router.use(function(req, res, next) {
  if (!req.session.correlationID) {
    const uuid = short.uuid();
    req.session.correlationID = generateShortUUID(uuid);
  }
  next();
});

function errorHandler(error, req, res, next) {
  console.error(error);
  let errorResponse;
  try {
    errorResponse = JSON.parse(error.response.text);
  } catch (parseError) {
    errorResponse = { message: 'An error occurred', details: error.response.text };
  }
  res.status(error.status).json({ error: errorResponse });
}

function configSDK() {
  let defaultClient = XiSdkResellers.ApiClient.instance;
  if (process.env.NODE_ENV === 'production') {
      defaultClient.basePath = 'https://api.ingrammicro.com:443';
  } else {
      defaultClient.basePath = 'https://api.ingrammicro.com:443/sandbox';
  }

  let application = defaultClient.authentications['application'];

  let tokenData;
  try {
      tokenData = JSON.parse(fs.readFileSync(path.join(__dirname, 'token.json')));
  } catch (error) {
      return next(new Error('Token not found. Please authenticate first.'));
  }

  application.accessToken = tokenData.access_token;
}

/* GET test page. */
router.get('/test', function(req, res, next) {
  res.json({ title: 'Express' });
});

router.get('/auth/token', function(req, res, next) {
  var api = new XiSdkResellers.AccesstokenApi();
  var grantType = "client_credentials";
  var clientId = process.env.CLIENT_ID;
  var clientSecret = process.env.CLIENT_SECRET;

  api.getAccesstoken(grantType, clientId, clientSecret, function(error, data, response) {
    if (error) {
      console.error(error);
      next(error);
    } else {
        fs.writeFileSync(path.join(__dirname, 'token.json'), JSON.stringify(data));
        res.json({ token: data });
    }
  });
});

/* ref : https://github.com/ingrammicro-xvantage/xi-sdk-resellers-node/blob/main/docs/OrdersApi.md*/
router.post('/orders/search', function(req, res, next) {
    configSDK();
    let apiInstance = new XiSdkResellers.OrdersApi();
    let iMCustomerNumber = "20-222222"; // String | Your unique Ingram Micro customer number.
    let iMCountryCode = "US"; // String | Two-character ISO country code.
    let iMCorrelationID = req.session.correlationID; // Use the correlation ID from the session
    if(process.env.NODE_ENV === 'production') {
      iMCustomerNumber = process.env.IM_CUSTOMER_NUMBER; // String | Your unique Ingram Micro customer number.
      iMCountryCode = process.env.IM_COUNTRY_CODE; // String | Two-character ISO country code.
    } 

    let opts = {
      'ingramOrderNumber': req.body.ingramOrderNumber,
      'orderStatus': req.body.orderStatus,
      'orderStatusIn': req.body.orderStatusIn,
      'ingramOrderDate': req.body.ingramOrderDate,
      'ingramOrderDateBt': req.body.ingramOrderDateBt,
      'iMSenderID': process.env.IM_SENDERID,
      'customerOrderNumber': req.body.customerOrderNumber,
      'pageSize': req.body.pageSize,
      'pageNumber': req.body.pageNumber,
      'endCustomerOrderNumber': req.body.endCustomerOrderNumber,
      'invoiceDateBt': req.body.invoiceDateBt,
      'shipDateBt': req.body.shipDateBt,
      'deliveryDateBt': req.body.deliveryDateBt,
      'ingramPartNumber': req.body.ingramPartNumber,
      'vendorPartNumber': req.body.vendorPartNumber,
      'serialNumber': req.body.serialNumber,
      'trackingNumber': req.body.trackingNumber,
      'vendorName': req.body.vendorName,
      'specialBidNumber': req.body.specialBidNumber
    };
  
    apiInstance.getResellersV6Ordersearch(iMCustomerNumber, iMCountryCode, 
        iMCorrelationID, opts, (error, data, response) => {
      if (error) {
        errorHandler(error, req, res, next);
      } else {
        console.log('API called successfully. Returned data: ' + data);
        res.json(data);
      }
    });
});

/* ref : https://github.com/ingrammicro-xvantage/xi-sdk-resellers-node/blob/main/docs/ProductCatalogApi.md*/
router.get('/products/search', function(req, res, next) {
  configSDK();
  let apiInstance = new XiSdkResellers.ProductCatalogApi();
  let iMCustomerNumber = "20-222222"; // String | Your unique Ingram Micro customer number
  let iMCorrelationID = req.session.correlationID; // String | Unique transaction number to identify each transaction accross all the systems
  let iMCountryCode = "US"; // String | Two-character ISO country code.
  if(process.env.NODE_ENV === 'production') {
    iMCustomerNumber = process.env.IM_CUSTOMER_NUMBER; // String | Your unique Ingram Micro customer number.
    iMCountryCode = process.env.IM_COUNTRY_CODE; // String | Two-character ISO country code.
  } 
  let opts = {};

  if (req.query.pageNumber) opts.pageNumber = req.query.pageNumber; // Number | Current page number. Default is 1
  if (req.query.pageSize) opts.pageSize = req.query.pageSize; // Number | Number of records required in the call - max records 100 per page
  if (req.query.iMSenderID) opts.iMSenderID = req.query.iMSenderID; // String | Sender Identification text
  if (req.query.type) opts.type = req.query.type; // String | The SKU type of product. One of Physical, Digital, or Any.
  if (req.query.hasDiscounts) opts.hasDiscounts = req.query.hasDiscounts; // String | Specifies if there are discounts available for the product.
  if (req.query.vendor) opts.vendor = req.query.vendor; // [String] | The name of the vendor/manufacturer of the product.
  if (req.query.vendorPartNumber) opts.vendorPartNumber = req.query.vendorPartNumber; // [String] | The vendors part (req.query.specialBidNumber) opts.specialBidNumber = req.query.specialBidNumber; // String | Special Pricing Bid Number
  if (req.query.endUserContact) opts.endUserContact = req.query.endUserContact; // String | End User Name
  if (req.query.sortingOrder) opts.sortingOrder = req.query.sortingOrder; // String | Sort order
  if (req.query.sortBy) opts.sortBy = req.query.sortBy; // String | Column to sort by
  if (req.query.pageSize) opts.pageSize = req.query.pageSize; // Number | Number of records per page
  if (req.query.pageNumber) opts.pageNumber = req.query.pageNumber; // Number | Page number
  if (req.query.vendorName) opts.vendorName = req.query.vendorName; // String | Vendor name
  if (req.query.quoteName) opts.quoteName = req.query.quoteName; // String | Quote name
  if (req.query.status) opts.status = req.query.status; // String | Quote status
  if (req.query.quoteCreateDateBt) opts.quoteCreateDateBt = req.query.quoteCreateDateBt; // String | Search with start and end date(only 2 entries allowed)
  if (req.query.iMSenderID) opts.iMSenderID = req.query.iMSenderID; // String | Sender Identification text

  apiInstance.getQuotessearchV6(iMCustomerNumber, iMCountryCode, iMCustomerContact, iMCorrelationID, opts, (error, data, response) => {
    if (error) {
      errorHandler(error, req, res, next);
    } else {
      console.log('API called successfully. Returned data: ' + data);
      res.json(data);
    }
  });
});

/* ref : https://github.com/ingrammicro-xvantage/xi-sdk-resellers-node/blob/main/docs/QuotesApi.md*/
router.get('/quotes/:quoteNumber', function(req, res, next) {
  configSDK();
  let apiInstance = new XiSdkResellers.QuotesApi();
  let iMCustomerNumber = "20-222222"; // String | Your Ingram Micro unique customer number
  let iMCountryCode = "US"; // String | Two-character ISO country code.
  let iMCorrelationID = req.session.correlationID; // String | Unique transaction number to identify each transaction across all the systems
  let quoteNumber = req.params.quoteNumber; // String | Unique identifier generated by Ingram Micro's CRM specific to each quote
  if (process.env.NODE_ENV === 'production') {
    iMCustomerNumber = process.env.IM_CUSTOMER_NUMBER; // String | Your unique Ingram Micro customer number.
    iMCountryCode = process.env.IM_COUNTRY_CODE; // String | Two-character ISO country code.
  }
  let opts = {
    'iMSenderID': process.env.IM_SENDERID // String | Unique identifier used to identify the third party source accessing the services.
  };

  
  apiInstance.getResellersV6Quotes(iMCustomerNumber, iMCountryCode, iMCorrelationID, quoteNumber, opts, (error, data, response) => {
    if (error) {
      errorHandler(error, req, res, next);
    } else {
      console.log('API called successfully. Returned data: ' + data);
      res.json(data);
    }
  });
});

module.exports = router;
